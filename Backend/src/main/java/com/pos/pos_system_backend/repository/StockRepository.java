package com.pos.pos_system_backend.repository;

import com.pos.pos_system_backend.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findByBarcodeAndOutletId(String barcode, String outletId);

    List<Stock> findByOutletId(String outletId);


    @Query("""
            SELECT
                s.barcode,
                COALESCE(SUM(s.updatedStock), 0)
            FROM StockHistory s
            WHERE s.outletId = :outletId
            AND s.changedAt >= :start
            AND s.changedAt < :end
            GROUP BY s.barcode
            """)
    List<Object[]> getStockInByDate(
            @Param("outletId") String outletId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}