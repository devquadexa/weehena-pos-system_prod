package com.pos.pos_system_backend.controller;

import com.pos.pos_system_backend.dto.*;
import com.pos.pos_system_backend.service.ReportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin
public class ReportController {

    private final ReportService service;

    public ReportController(ReportService service) {
        this.service = service;
    }

    @GetMapping("/daily")
    public List<DailyReportResponse> getDailyReport(
            @RequestParam String date,
            @RequestParam(required = false) String outletId
    ) {
        return service.getDailyReport(date, outletId);
    }


    @GetMapping("/items")
    public List<SoldItemReport> getSoldItems(
            @RequestParam String outletId,
            @RequestParam String date
    ) {
        return service.getSoldItems(outletId, date);
    }

    @GetMapping("/day-end-stock")
    public List<StockReportDto> getDayEndStockReport(
            @RequestParam String outletId,
            @RequestParam String date
    ) {
        return service.getDayEndStockReport(
                outletId,
                date
        );
    }

    @GetMapping("/product-sales")
    public List<ProductSaleDetailDto> getProductSales(
            @RequestParam String barcode,
            @RequestParam String outletId,
            @RequestParam String date
    ) {
        return service.getProductSales(
                barcode,
                outletId,
                date
        );
    }

    @GetMapping("/cancelled-sales")
    public List<CancelledSaleResponse> getCancelledSaleItems(
            @RequestParam String outletId,
            @RequestParam String date
    ) {
        return service.getCancelledSaleItems(outletId, date);
    }
}