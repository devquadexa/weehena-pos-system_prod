package com.pos.pos_system_backend.controller;


import com.pos.pos_system_backend.entity.StockHistory;
import com.pos.pos_system_backend.service.StockService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

}
