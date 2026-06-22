package com.pos.pos_system_backend.service;

import com.pos.pos_system_backend.dto.StockRequest;
import com.pos.pos_system_backend.entity.Product;
import com.pos.pos_system_backend.entity.Stock;
import com.pos.pos_system_backend.entity.StockHistory;
import com.pos.pos_system_backend.exception.InsufficientStockException;
import com.pos.pos_system_backend.repository.ProductRepository;
import com.pos.pos_system_backend.repository.StockHistoryRepository;
import com.pos.pos_system_backend.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StockService {

    private static final ZoneId APP_TIME_ZONE = ZoneId.of("Asia/Colombo");

    private final StockRepository repo;
    private final ProductRepository productRepo;

    @Autowired
    private StockHistoryRepository stockHistoryRepository;

    public StockService(StockRepository repo, ProductRepository productRepo) {
        this.repo = repo;
        this.productRepo = productRepo;
    }

    //Long barcode, String outletId, int qty, double weight, int thresholdQty, double thresholdWeight
    public Stock addStock(StockRequest req) {


        Product product = productRepo.findByBarcode(req.getBarcode())
                .orElseThrow(() -> new RuntimeException("Product not found with barcode: " + req.getBarcode()));

        Optional<Stock> existingStockOpt = repo.findByBarcodeAndOutletId(req.getBarcode(), req.getOutletId());


        if (existingStockOpt.isPresent()) {
            throw new RuntimeException("Stock already exists for this product in this outlet");
        }

        validateStock(req, product);
        // Create stock
        Stock stock = new Stock();
        stock.setBarcode(product.getBarcode());
        stock.setProductName(product.getName());
        stock.setWeighted(product.isWeighted());
        stock.setOutletId(req.getOutletId());
        stock.setWeight(req.getWeight());
        stock.setQuantity(req.getQuantity());
        stock.setLowStockThresholdQty(req.getLowStockThresholdQty());
        stock.setLowStockThresholdWeight(req.getLowStockThresholdWeight());

        //update history
        StockHistory history = new StockHistory();
        history.setBarcode(product.getBarcode());
        history.setProductName(product.getName());
        history.setOutletId(req.getOutletId());

        if (product.isWeighted()) {
            history.setNewStock(req.getWeight());
        } else {
            history.setNewStock(req.getQuantity());
        }

        history.setOldStock(0);
        history.setUpdatedStock(0);
        history.setChangedBy(req.getUser());
        history.setChangedAt(OffsetDateTime.now(APP_TIME_ZONE));
        stockHistoryRepository.save(history);


        return repo.save(stock);
    }


    public void reduceStock(String barcode, String outletId, double value) {

        Stock stock = repo
                .findByBarcodeAndOutletId(barcode, outletId)
                .orElseThrow(() -> new RuntimeException(
                        "Stock not found for product " + barcode + " in outlet " + outletId
                ));

        Product product = productRepo.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException(
                        "Product not found with barcode: " + barcode
                ));

        if (product.isWeighted()) {
            //WEIGHT LOGIC
            if (stock.getWeight() < value) {
                throw new InsufficientStockException(
                        "Product " + barcode + " only has " + stock.getWeight() + " Kg left"
                );
            }

            stock.setWeight(stock.getWeight() - value);

        } else {
            //QUANTITY LOGIC
            int qty = (int) value;

            if (stock.getQuantity() < qty) {
                throw new InsufficientStockException(
                        "Product " + barcode + " only has " + stock.getQuantity() + " items left"
                );
            }

            stock.setQuantity(stock.getQuantity() - qty);
        }

        repo.save(stock);
    }


    public List<Stock> getAllStock() {
        return repo.findAll();
    }

    public List<Stock> getStockByOutlet(String outletId) {
        return repo.findByOutletId(outletId);
    }

    //Stock Update int qty, double weight
    public Stock updateStock(Long id, double value, String user) {
        Optional<Stock> stockOpt = repo.findById(id);
        if (stockOpt.isEmpty()) {
            throw new RuntimeException("Stock not found with id " + id);
        }

        String barcode = stockOpt.get().getBarcode();
        Product product = productRepo.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException("Product not found with barcode: " + barcode));

        //Update Stock
        Stock stock = stockOpt.get();

        //Update stock history
        StockHistory history = new StockHistory();
        history.setProductName(stock.getProductName());
        history.setBarcode(stock.getBarcode());
        history.setOutletId(stock.getOutletId());
        history.setChangedBy(user);
        history.setChangedAt(OffsetDateTime.now(APP_TIME_ZONE));

        if (product.isWeighted()) {
            //update stock weight
            double oldWeight = stock.getWeight();
            double newWeight = oldWeight + value;
            stock.setWeight(newWeight);

            //update stock history
            history.setOldStock(oldWeight);
            history.setUpdatedStock(value);
            history.setNewStock(newWeight);

        } else {
            //update stock Qty
            int oldQty = stock.getQuantity();
            int newQty = oldQty + (int) value;
            stock.setQuantity(newQty);

            //update stock history
            history.setOldStock(oldQty);
            history.setUpdatedStock((int) value);
            history.setNewStock(newQty);
        }
        Stock updatedStock = repo.save(stock);
        stockHistoryRepository.save(history);


        return updatedStock;
    }

    public void deleteStock(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Stock not found with id " + id);
        }
        repo.deleteById(id);
    }


    //Stock History
    public List<StockHistory> getAllHistory() {
        return stockHistoryRepository.findAll(
                Sort.by(Sort.Direction.DESC, "changedAt")
        );
    }

    public List<StockHistory> getStockHistoryForPeriod(
            String outletId,
            LocalDate startDate,
            LocalDate endDate) {

        OffsetDateTime start = startDate.atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();
        OffsetDateTime end = endDate.plusDays(1).atStartOfDay(APP_TIME_ZONE).minusNanos(1).toOffsetDateTime();

        return stockHistoryRepository.getStockHistoryForPeriod(
                outletId,
            start,
            end
        );
    }


    public void validateStock(StockRequest req, Product product) {

        if (product.isWeighted()) {
            if (req.getQuantity() != 0 || req.getLowStockThresholdQty() != 0) {
                throw new RuntimeException("Quantity is not available for weighted products");
            } else if (req.getWeight() == 0 || req.getLowStockThresholdWeight() == 0) {
                throw new RuntimeException("Weight is required for weighted product stock");
            }
        } else {
            if (req.getQuantity() == 0 || req.getLowStockThresholdQty() == 0) {
                throw new RuntimeException("Quantity is required");
            } else if (req.getWeight() != 0 || req.getLowStockThresholdWeight() != 0) {
                throw new RuntimeException("Weight is not available for this product");
            }
        }
    }
}