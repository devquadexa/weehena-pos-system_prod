package com.pos.pos_system_backend.service;

import com.pos.pos_system_backend.dto.*;
import com.pos.pos_system_backend.entity.Product;
import com.pos.pos_system_backend.entity.Stock;
import com.pos.pos_system_backend.repository.ProductRepository;
import com.pos.pos_system_backend.repository.SaleRepository;
import com.pos.pos_system_backend.repository.StockRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

        private static final ZoneId APP_TIME_ZONE = ZoneId.of("Asia/Colombo");

    private final SaleRepository saleRepo;
    private final ProductRepository productRepo;
    private final StockRepository stockRepo;

    public ReportService(SaleRepository saleRepo, ProductRepository productRepo, StockRepository stockRepo) {
        this.saleRepo = saleRepo;
        this.productRepo = productRepo;

        this.stockRepo = stockRepo;
    }

    public List<DailyReportResponse> getDailyReport(String date, String outletId) {

        LocalDate localDate = LocalDate.parse(date);

        LocalDateTime start = localDate.atStartOfDay();
        LocalDateTime end = localDate.plusDays(1).atStartOfDay();
        OffsetDateTime stockStart = localDate.atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();
        OffsetDateTime stockEnd = localDate.plusDays(1).atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();

        if (outletId != null) {
            return List.of(buildReport(outletId, start, end, date));
        }

        // ALL OUTLETS (FIXED)
        List<String> outlets = saleRepo.findDistinctOutletIdsBetween(start, end);

        return outlets.stream().map(o -> buildReport(o, start, end, date)).toList();
    }

    public DailyReportResponse buildReport(String outletId, LocalDateTime start, LocalDateTime end, String date) {

        double totalDiscount = saleRepo.getTotalDiscount(outletId, start, end);
        double totalSales = saleRepo.getTotalSales(outletId, start, end);
        long totalTransactions = saleRepo.getTotalTransactions(outletId, start, end);

        DailyReportResponse res = new DailyReportResponse();
        res.setDate(date);
        res.setOutletId(outletId);
        res.setDiscountAmount(totalDiscount);
        res.setTotalSales(totalSales);
        res.setTotalTransactions(totalTransactions);

        return res;
    }


    public List<SoldItemReport> getSoldItems(String outletId, String date) {

        LocalDate localDate = LocalDate.parse(date);

        LocalDateTime start = localDate.atStartOfDay();
        LocalDateTime end = localDate.plusDays(1).atStartOfDay();

        List<Object[]> results = saleRepo.getSoldItemsReport(outletId, start, end);

        return results.stream().map(r -> {
            SoldItemReport dto = new SoldItemReport();
            dto.setInvoiceNo((String) r[0]);
            dto.setSaleStatus(String.valueOf(r[1]));
            dto.setBarcode(String.valueOf(r[2]));
            dto.setItemName((String) r[3]);
            dto.setSaleQty(((Number) r[4]).doubleValue());
            dto.setSalePrice(((Number) r[5]).doubleValue());
            dto.setSaleValue(((Number) r[6]).doubleValue());
            return dto;
        }).toList();
    }


    // stock report
    public List<StockReportDto> getDayEndStockReport(
            String outletId,
            String date
    ) {

        LocalDate localDate = LocalDate.parse(date);

        LocalDateTime start = localDate.atStartOfDay();
        LocalDateTime end = localDate.plusDays(1).atStartOfDay();
        OffsetDateTime stockStart = localDate.atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();
        OffsetDateTime stockEnd = localDate.plusDays(1).atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();

        List<Product> products = productRepo.findAll();

        Map<String, Double> stockInMap = new HashMap<>();
        Map<String, Double> stockOutMap = new HashMap<>();

        // STOCK IN
        for (Object[] row : stockRepo.getStockInByDate(
                outletId,
                stockStart,
                stockEnd
        )) {

            stockInMap.put(
                    row[0].toString(),
                    ((Number) row[1]).doubleValue()
            );
        }

        // STOCK OUT
        for (Object[] row : saleRepo.getStockOutByDate(
                outletId,
                start,
                end
        )) {

            stockOutMap.put(
                    row[0].toString(),
                    ((Number) row[1]).doubleValue()
            );
        }

        List<StockReportDto> report = new ArrayList<>();

        for (Product product : products) {

            String barcode = product.getBarcode();

            double stockIn =
                    stockInMap.getOrDefault(barcode, 0.0);

            double stockOut =
                    stockOutMap.getOrDefault(barcode, 0.0);

            Stock stock =
                    stockRepo.findByBarcodeAndOutletId(
                            barcode,
                            outletId
                    ).orElse(null);

            double closingStock;

            if (stock != null) {
                if (product.isWeighted()) {
                    closingStock = stock.getWeight();
                } else {
                    closingStock = stock.getQuantity();
                }
            } else {
                closingStock = 0;
            }
            double openingStock =
                    closingStock - stockIn + stockOut;

            StockReportDto dto =
                    new StockReportDto();

            dto.setBarcode(barcode);

            dto.setProductName(product.getName());

            dto.setOpeningStock(openingStock);

            dto.setStockIn(stockIn);

            dto.setStockOut(stockOut);

            dto.setClosingStock(closingStock);

            report.add(dto);
        }

        return report;
    }


    //Get sales products
    public List<ProductSaleDetailDto> getProductSales(
            String barcode,
            String outletId,
            String date
    ) {

        LocalDate localDate = LocalDate.parse(date);

        LocalDateTime start = localDate.atStartOfDay();

        LocalDateTime end =
                localDate.plusDays(1).atStartOfDay();

        List<Object[]> results =
                saleRepo.getProductSales(
                        barcode,
                        outletId,
                        start,
                        end
                );

        return results.stream().map(r -> {

            ProductSaleDetailDto dto =
                    new ProductSaleDetailDto();

            dto.setInvoiceNo((String) r[0]);

            dto.setBarcode((String) r[1]);

            dto.setProductName((String) r[2]);

            dto.setOutletId((String) r[3]);

            dto.setSaleStatus(String.valueOf(r[4]));

            dto.setSaleDate(LocalDateTime.parse(String.valueOf(r[5])));

            dto.setSaleQty(
                    ((Number) r[6]).doubleValue()
            );

            dto.setSalePrice(
                    ((Number) r[7]).doubleValue()
            );

            dto.setSaleValue(
                    ((Number) r[8]).doubleValue()
            );

            return dto;

        }).toList();
    }


    //Get Cancelled sales items
    public List<CancelledSaleResponse> getCancelledSaleItems(
            String outletId,
            String date
    ) {

        LocalDate localDate = LocalDate.parse(date);

        LocalDateTime start = localDate.atStartOfDay();
        LocalDateTime end = localDate.plusDays(1).atStartOfDay();

        List<Object[]> results =
                saleRepo.getCancelledSaleItems(outletId, start, end);

        return results.stream().map(r -> {

            CancelledSaleResponse dto =
                    new CancelledSaleResponse();

            dto.setInvoiceNo((String) r[0]);

            dto.setDate(
                    ((LocalDateTime) r[1])
                            .toLocalDate()
                            .toString()
            );

            dto.setBarcode(String.valueOf(r[2]));
            dto.setItemName((String) r[3]);

            dto.setSaleQty(
                    ((Number) r[4]).doubleValue()
            );

            dto.setSalePrice(
                    ((Number) r[5]).doubleValue()
            );

            dto.setSaleValue(
                    ((Number) r[6]).doubleValue()
            );

            return dto;

        }).toList();
    }
}