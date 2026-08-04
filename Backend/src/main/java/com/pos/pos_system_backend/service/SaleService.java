package com.pos.pos_system_backend.service;

import com.pos.pos_system_backend.entity.*;
import com.pos.pos_system_backend.dto.SaleRequest;
import com.pos.pos_system_backend.enums.PriceType;
import com.pos.pos_system_backend.enums.SaleStatus;
import com.pos.pos_system_backend.repository.ProductRepository;
import com.pos.pos_system_backend.repository.SaleRepository;
import com.pos.pos_system_backend.repository.StockRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class SaleService {

    private final SaleRepository repo;
    private final StockService stockService;
    private final StockRepository stockRepo;
    private final ProductRepository productRepo;

    private static final ZoneId APP_TIME_ZONE = ZoneId.of("Asia/Colombo");
    private static final double BULK_THRESHOLD = 10;

    public SaleService(SaleRepository repo, StockService stockService, StockRepository stockRepo, ProductRepository productRepo) {
        this.repo = repo;
        this.stockService = stockService;
        this.stockRepo = stockRepo;
        this.productRepo = productRepo;
    }

    private static double round(double value) {
        return Math.round(value * 1000.0) / 1000.0;
    }

    @Transactional
    public void processSale(SaleRequest req) {

        double subtotal = 0;

        Sale sale = new Sale();
        sale.setInvoiceNo(req.getInvoiceNo());
        sale.setOutletId(req.getOutletId());
        sale.setDate(OffsetDateTime.now(APP_TIME_ZONE));
        sale.setStatus(SaleStatus.ACTIVE);

        // attach items to sale
        for (SaleItem item : req.getItems()) {

            Product product = productRepo.findByBarcode(item.getBarcode())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            double unitPrice;
            PriceType priceType;
            if (product.isWeighted()) {
                // Bulk pricing does not apply to weighted products
                unitPrice = product.getRetailPrice();
                priceType = PriceType.RETAIL;
            } else {
                boolean isBulk = item.getValue() >= BULK_THRESHOLD;
                unitPrice = isBulk ? product.getBulkPrice() : product.getRetailPrice();
                priceType = isBulk ? PriceType.BULK : PriceType.RETAIL;
            }

            double itemTotal = unitPrice * round(item.getValue());

            stockService.reduceStock(
                    item.getBarcode(),
                    req.getOutletId(),
                    round(item.getValue())
            );

            subtotal += itemTotal;

            item.setSale(sale);
            item.setUnitPrice(unitPrice);
            item.setPriceType(priceType);
        }

        double discountAmount = 0;
        if (req.getDiscountType() != null) {
            discountAmount = switch (req.getDiscountType()) {
                case PERCENTAGE -> subtotal * req.getDiscountValue() / 100;
                case FIXED -> req.getDiscountValue();
                default -> 0;
            };
        }

        discountAmount = Math.min(discountAmount, subtotal); // never exceed subtotal
        discountAmount = Math.max(discountAmount, 0);        // never negative

        double total = Math.max(0, subtotal - discountAmount);

        sale.setDiscountAmount(discountAmount);
        sale.setTotal(total);
        sale.setItems(req.getItems());


        repo.save(sale);
    }

    public List<Sale> getSalesByDateAndOutletId(LocalDate date, String outletId) {

        OffsetDateTime start = date.atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();
        OffsetDateTime end = date.plusDays(1).atStartOfDay(APP_TIME_ZONE).minusNanos(1).toOffsetDateTime();

        return repo.findByDateAndOutletId(start, end, outletId);
    }

    @Transactional
    public Sale cancelLastSale(String outletId) {

        //Find latest sale
        Sale latestSale = repo.findTopByOutletIdOrderByDateDesc(outletId)
                .orElseThrow(() -> new RuntimeException("No sales found"));

        // Prevent double cancel
        if (latestSale.getStatus() == SaleStatus.CANCELLED) {
            throw new RuntimeException("Last sale already cancelled (" + latestSale.getInvoiceNo() + ")");
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
