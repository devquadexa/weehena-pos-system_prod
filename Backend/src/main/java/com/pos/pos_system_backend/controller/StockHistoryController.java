package com.pos.pos_system_backend.controller;


import com.pos.pos_system_backend.entity.StockHistory;
import com.pos.pos_system_backend.service.StockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/stock/history")
@CrossOrigin
public class StockHistoryController {

    private final StockService service;

    public StockHistoryController(StockService service) {
        this.service = service;
    }

    @GetMapping
    public List<StockHistory> getHistory() {
        return service.getAllHistory();
    }

    //get history by time period
    @GetMapping("/period")
    public ResponseEntity<List<StockHistory>> getStockHistory(
            @RequestParam String outletId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        return ResponseEntity.ok(
                service.getStockHistoryForPeriod(
                        outletId,
                        startDate,
                        endDate
                )
        );
    }

}
