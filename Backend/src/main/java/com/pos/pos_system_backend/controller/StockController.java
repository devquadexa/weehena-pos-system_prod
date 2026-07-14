package com.pos.pos_system_backend.controller;

import com.pos.pos_system_backend.config.JwtUtil;
import com.pos.pos_system_backend.dto.StockRequest;
import com.pos.pos_system_backend.dto.StockUpdateRequest;
import com.pos.pos_system_backend.entity.Stock;
import com.pos.pos_system_backend.service.StockService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@CrossOrigin
public class StockController {

    private final StockService service;
    private final JwtUtil jwtUtil;

    public StockController(StockService service, JwtUtil jwtUtil) {
        this.service = service;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping()
    public Stock addStock(@RequestBody StockRequest req, HttpServletRequest request) {

        String auth = request.getHeader("Authorization");
        String token = auth.substring(7);
        String username = jwtUtil.getUsernameFromToken(token);

        return service.addStock(req, username);
    }

    @GetMapping
    public List<Stock> getStock(
            @RequestParam(required = false) String outletId
    ) {
        if (outletId != null) {
            return service.getStockByOutlet(outletId);
        }
        return service.getAllStock();
    }

    @PutMapping("/{id}")
    public Stock updateStock(
            @PathVariable Long id,
            @RequestBody StockUpdateRequest req,
            HttpServletRequest request
    ) {

        String auth = request.getHeader("Authorization");
        String token = auth.substring(7);
        String username = jwtUtil.getUsernameFromToken(token);
        return service.updateStock(
                id,
                req.getValue(),
                username
        );
    }

    @DeleteMapping("/{id}")
    public void deleteStock(@PathVariable Long id) {
        service.deleteStock(id);
    }
}
