package com.pos.pos_system_backend.repository;

import com.pos.pos_system_backend.entity.StockHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface StockHistoryRepository extends JpaRepository<StockHistory, Long> {

    @Query("""
       SELECT sh
       FROM StockHistory sh
       WHERE sh.outletId = :outletId
       AND sh.changedAt BETWEEN :startDate AND :endDate
       ORDER BY sh.changedAt DESC
       """)
    List<StockHistory> getStockHistoryForPeriod(
            @Param("outletId") String outletId,
          @Param("startDate") OffsetDateTime startDate,
          @Param("endDate") OffsetDateTime endDate);
}

