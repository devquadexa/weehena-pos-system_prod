package com.pos.pos_system_backend.repository;

import com.pos.pos_system_backend.entity.StockHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockHistoryRepository extends JpaRepository<StockHistory, Long> {

}

