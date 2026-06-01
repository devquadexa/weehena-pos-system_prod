package com.pos.pos_system_backend.service;

import com.pos.pos_system_backend.dto.ProductRequest;
import com.pos.pos_system_backend.entity.Product;
import com.pos.pos_system_backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repo;


    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public Product addProduct(ProductRequest req) {

        validateProduct(req);

        Product p = new Product();
        p.setBarcode(req.getBarcode());
        p.setName(req.getName());
        p.setRetailPrice(req.getRetailPrice());
        p.setBulkPrice(req.getBulkPrice());
        p.setPackPrice(req.getPackPrice());
        p.setPricePerKg(req.getPricePerKg());
        p.setWeighted(req.isWeighted());

        return repo.save(p);
    }

    public List<Product> getAll() {
        return repo.findAll();
    }

    public Product getByBarcode(String barcode) {
        return repo.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void deleteProduct(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Product not found with id " + id);
        }
        repo.deleteById(id);
    }


    public void validateProduct(ProductRequest req) {

        if (req.isWeighted()) {
            if (req.getPricePerKg() <= 0) {
                throw new RuntimeException("Price per Kg required for weighted products");
            }
        } else {
            if (req.getRetailPrice() <= 0 || req.getPackPrice() <= 0) {
                throw new RuntimeException("Retail or Pack price required");
            }
        }
    }


}
