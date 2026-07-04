package com.pos.pos_system_backend.service;

import com.pos.pos_system_backend.dto.ProductRequest;
import com.pos.pos_system_backend.dto.UpdatePriceRequest;
import com.pos.pos_system_backend.entity.Product;
import com.pos.pos_system_backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository repo;


    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public Product addProduct(ProductRequest req) {

        Optional<Product> existingProductOpt = repo.findByBarcode(req.getBarcode());

        if (existingProductOpt.isPresent()) {
            throw new RuntimeException("Product already exists");
        }

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

    public List<Product> searchByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return repo.findByNameContainingIgnoreCase(name.trim());
    }

    public void deleteProduct(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Product not found with id " + id);
        }
        repo.deleteById(id);
    }

    //Update prices
    public Product updatePrices(UpdatePriceRequest request) {

        Product product = repo.findByBarcode(request.getBarcode())
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        product.setRetailPrice(request.getRetailPrice());
        product.setBulkPrice(request.getBulkPrice());
        product.setPackPrice(request.getPackPrice());
        product.setPricePerKg(request.getPricePerKg());

        return repo.save(product);
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
