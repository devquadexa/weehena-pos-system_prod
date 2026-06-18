package com.pos.pos_system_backend.service;

import com.pos.pos_system_backend.entity.*;
import com.pos.pos_system_backend.dto.SaleRequest;
import com.pos.pos_system_backend.enums.SaleStatus;
import com.pos.pos_system_backend.repository.ProductRepository;
import com.pos.pos_system_backend.repository.SaleRepository;
import com.pos.pos_system_backend.repository.StockRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SaleService {

    private final SaleRepository repo;
    private final StockService stockService;
    private final StockRepository stockRepo;
    private final ProductRepository productRepo;

    public SaleService(SaleRepository repo, StockService stockService, StockRepository stockRepo, ProductRepository productRepo) {
        this.repo = repo;
        this.stockService = stockService;
        this.stockRepo = stockRepo;
        this.productRepo = productRepo;
    }

    @Transactional
    public void processSale(SaleRequest req) {

        double subtotal = 0;

        Sale sale = new Sale();
        sale.setInvoiceNo(req.getInvoiceNo());
        sale.setOutletId(req.getOutletId());
        sale.setDiscountAmount(req.getDiscountAmount());
        sale.setDate(LocalDateTime.now());
        sale.setStatus(SaleStatus.ACTIVE);

        // attach items to sale
        for (SaleItem item : req.getItems()) {

            Product product = productRepo.findByBarcode(item.getBarcode())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            double itemTotal;

            if (product.isWeighted()) {
                itemTotal = item.getValue() * product.getRetailPrice();
            } else {
                double unitPrice = switch (item.getPriceType()) {
                    case BULK -> product.getBulkPrice();
                    case RETAIL -> product.getRetailPrice();
//                    case PACK -> product.getPackPrice();
                    default -> product.getRetailPrice();

                };
                System.out.println(unitPrice);
                itemTotal = unitPrice * item.getValue();
            }


            stockService.reduceStock(
                    item.getBarcode(),
                    req.getOutletId(),
                    item.getValue()
            );

            subtotal += itemTotal;

            item.setSale(sale);
        }

        sale.setTotal(subtotal - req.getDiscountAmount());

        sale.setItems(req.getItems());

        repo.save(sale);


    }

    public List<Sale> getSalesByDateAndOutletId(LocalDate date, String outletId) {

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);

        return repo.findByDateAndOutletId(start, end, outletId);
    }

    @Transactional
    public Sale cancelLastSale() {

        // Find latest sale
        Sale latestSale = repo.findTopByOrderByDateDesc()
                .orElseThrow(() -> new RuntimeException("No sales found"));

        // Prevent double cancel
        if (latestSale.getStatus() == SaleStatus.CANCELLED) {
            throw new RuntimeException("Last sale already cancelled");
        }

        // Restore stock
        for (SaleItem item : latestSale.getItems()) {

            Stock stock = stockRepo
                    .findByBarcodeAndOutletId(
                            item.getBarcode(),
                            latestSale.getOutletId()
                    )
                    .orElseThrow(() ->
                            new RuntimeException("Stock not found")
                    );

            if (stock.isWeighted()) {
                stock.setWeight(stock.getWeight() + item.getValue());
            } else {
                stock.setQuantity(stock.getQuantity() + (int) item.getValue());
            }

            stockRepo.save(stock);
        }

        // Mark cancelled
        latestSale.setStatus(SaleStatus.CANCELLED);

        return repo.save(latestSale);
    }

}
