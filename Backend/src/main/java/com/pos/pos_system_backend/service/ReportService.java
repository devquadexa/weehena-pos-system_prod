package com.pos.pos_system_backend.service;

import com.pos.pos_system_backend.dto.*;
import com.pos.pos_system_backend.entity.Product;
import com.pos.pos_system_backend.entity.Stock;
import com.pos.pos_system_backend.repository.ProductRepository;
import com.pos.pos_system_backend.repository.SaleRepository;
import com.pos.pos_system_backend.repository.StockRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;

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

        OffsetDateTime start = localDate.atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();
        OffsetDateTime end = localDate.plusDays(1).atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();

        if (outletId != null) {
            return List.of(buildReport(outletId, start, end, date));
        }

        // ALL OUTLETS (FIXED)
        List<String> outlets = saleRepo.findDistinctOutletIdsBetween(start, end);

        return outlets.stream().map(o -> buildReport(o, start, end, date)).toList();
    }

    public DailyReportResponse buildReport(String outletId, OffsetDateTime start, OffsetDateTime end, String date) {

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


    public SoldItemsReportResponse getSoldItems(String outletId, String date) {

        LocalDate localDate = LocalDate.parse(date);

        OffsetDateTime start = localDate.atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();
        OffsetDateTime end = localDate.plusDays(1).atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();

        List<Object[]> results = saleRepo.getSoldItemsReport(outletId, start, end);

        Map<String, SoldItemReport> weightedGrouped = new LinkedHashMap<>();
        Map<String, SoldItemReport> nonWeightedGrouped = new LinkedHashMap<>();
        Map<String, SoldItemReport> bulkGrouped = new LinkedHashMap<>();

        for (Object[] r : results) {
            String invoiceNo = (String) r[0];
            String saleStatus = String.valueOf(r[1]);
            String barcode = String.valueOf(r[2]);
            String itemName = (String) r[3];
            double saleQty = ((Number) r[4]).doubleValue();
            double salePrice = ((Number) r[5]).doubleValue();
            double saleValue = ((Number) r[6]).doubleValue();
            boolean isWeighted = (Boolean) r[7];
            String priceType = String.valueOf(r[8]); // "RETAIL" or "BULK"

            Map<String, SoldItemReport> targetMap;
            if (isWeighted) {
                targetMap = weightedGrouped;              // weighted items -> always here
            } else if ("BULK".equals(priceType)) {
                targetMap = bulkGrouped;                   // non-weighted, bulk price -> separate, never merged
            } else {
                targetMap = nonWeightedGrouped;             // non-weighted, retail price
            }



            SoldItemReport dto = targetMap.get(barcode);
            if (dto == null) {
                dto = new SoldItemReport();
                dto.setInvoiceNo(invoiceNo);
                dto.setSaleStatus(saleStatus);
                dto.setBarcode(barcode);
                dto.setItemName(itemName);
                dto.setSaleQty(saleQty);
                dto.setSalePrice(salePrice);
                dto.setSaleValue(saleValue);
                targetMap.put(barcode, dto);
            } else {
                dto.setSaleQty(dto.getSaleQty() + saleQty);
                dto.setSaleValue(dto.getSaleValue() + saleValue);
                dto.setInvoiceNo(dto.getInvoiceNo() + ", " + invoiceNo);
            }
        }

        return new SoldItemsReportResponse(
                new ArrayList<>(weightedGrouped.values()),
                new ArrayList<>(nonWeightedGrouped.values()),
                new ArrayList<>(bulkGrouped.values())
        );
    }

    // stock report
    public List<StockReportDto> getDayEndStockReport(
            String outletId,
            String date
    ) {

        LocalDate localDate = LocalDate.parse(date);

        OffsetDateTime start = localDate.atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();
        OffsetDateTime end = localDate.plusDays(1).atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();
        OffsetDateTime now = OffsetDateTime.now(APP_TIME_ZONE);

        List<Product> products = productRepo.findAll();

        // Movements ON the report date (for opening -> closing display)
        Map<String, Double> stockInMap = new HashMap<>();
        Map<String, Double> stockOutMap = new HashMap<>();

        for (Object[] row : stockRepo.getStockInByDate(outletId, start, end)) {
            stockInMap.put(row[0].toString(), ((Number) row[1]).doubleValue());
        }
        for (Object[] row : saleRepo.getStockOutByDate(outletId, start, end)) {
            stockOutMap.put(row[0].toString(), ((Number) row[1]).doubleValue());
        }

        // Movements AFTER the report date, up to now (to unwind current stock back to that day's closing)
        Map<String, Double> stockInSinceMap = new HashMap<>();
        Map<String, Double> stockOutSinceMap = new HashMap<>();

        for (Object[] row : stockRepo.getStockInByDate(outletId, end, now)) {
            stockInSinceMap.put(row[0].toString(), ((Number) row[1]).doubleValue());
        }
        for (Object[] row : saleRepo.getStockOutByDate(outletId, end, now)) {
            stockOutSinceMap.put(row[0].toString(), ((Number) row[1]).doubleValue());
        }

        List<StockReportDto> report = new ArrayList<>();

        for (Product product : products) {

            String barcode = product.getBarcode();

            double stockIn = stockInMap.getOrDefault(barcode, 0.0);
            double stockOut = stockOutMap.getOrDefault(barcode, 0.0);

            double stockInSince = stockInSinceMap.getOrDefault(barcode, 0.0);
            double stockOutSince = stockOutSinceMap.getOrDefault(barcode, 0.0);

            Stock stock = stockRepo.findByBarcodeAndOutletId(barcode, outletId).orElse(null);

            double currentStock;
            if (stock != null) {
                currentStock = product.isWeighted() ? stock.getWeight() : stock.getQuantity();
            } else {
                currentStock = 0;
            }

            // Unwind current live stock back to what it was at end of report date
            double closingStock = currentStock - stockInSince + stockOutSince;

            double openingStock = closingStock - stockIn + stockOut;

            StockReportDto dto = new StockReportDto();
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

        OffsetDateTime start = localDate.atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();
        OffsetDateTime end = localDate.plusDays(1).atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();

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

            dto.setSaleDate(OffsetDateTime.parse(String.valueOf(r[5])));

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

        OffsetDateTime start = localDate.atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();
        OffsetDateTime end = localDate.plusDays(1).atStartOfDay(APP_TIME_ZONE).toOffsetDateTime();

        List<Object[]> results =
                saleRepo.getCancelledSaleItems(outletId, start, end);

        return results.stream().map(r -> {

            CancelledSaleResponse dto =
                    new CancelledSaleResponse();

            dto.setInvoiceNo((String) r[0]);

            dto.setDate(
                    ((OffsetDateTime) r[1])
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