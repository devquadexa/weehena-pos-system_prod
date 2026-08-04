package com.pos.pos_system_backend.controller;


import com.pos.pos_system_backend.dto.SaleRequest;
import com.pos.pos_system_backend.entity.Sale;
import com.pos.pos_system_backend.service.SaleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin
public class SaleController {

    private final SaleService service;

    public SaleController(SaleService service) {
        this.service = service;
    }

    @PostMapping
    public String processSale(@RequestBody SaleRequest request) {
        service.processSale(request);
        return "Sale completed";
    }

    @GetMapping("/daily")
    public ResponseEntity<List<Sale>> getSalesByDateAndOutlet(
            @RequestParam LocalDate date,
            @RequestParam String outletId
    ) {

        List<Sale> sales = service.getSalesByDateAndOutletId(date, outletId);

        return ResponseEntity.ok(sales);
    }

    @PutMapping("/cancel-last-sale")
    public Sale cancelLastSale(
            @RequestParam String outletId
    ) {
        return service.cancelLastSale(outletId);
    }


}