package com.pos.pos_system_backend.repository;

import com.pos.pos_system_backend.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    @Query("SELECT COALESCE(" + "SUM(s.total),0) " + "FROM Sale s " + "WHERE s.outletId = :outletId AND s.status = 'ACTIVE' AND s.date BETWEEN :start AND :end")
    double getTotalSales(@Param("outletId") String outletId, @Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

    @Query("SELECT COALESCE(" + "SUM(s.discountAmount),0) " + "FROM Sale s " + "WHERE s.outletId = :outletId AND s.status = 'ACTIVE' AND s.date BETWEEN :start AND :end")
    double getTotalDiscount(@Param("outletId") String outletId, @Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.outletId = :outletId AND s.status = 'ACTIVE' AND s.date BETWEEN :start AND :end")
    long getTotalTransactions(@Param("outletId") String outletId, @Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);


    @Query("SELECT DISTINCT s.outletId FROM Sale s WHERE s.date >= :start AND s.date < :end")
    List<String> findDistinctOutletIdsBetween(@Param("start") OffsetDateTime start,
                                              @Param("end") OffsetDateTime end);

    @Query("""
            SELECT s.invoiceNo, s.status,
                p.barcode,
                p.name,
                SUM(si.value),
                CASE 
                    WHEN si.priceType = 'RETAIL' THEN p.retailPrice
                    ELSE p.bulkPrice
                END,
                SUM(si.value * 
                    CASE 
                        WHEN si.priceType = 'RETAIL' THEN p.retailPrice
                        ELSE p.bulkPrice
                    END
                ),
                p.weighted,
                si.priceType
            FROM SaleItem si
            JOIN si.sale s
            JOIN Product p ON p.barcode = si.barcode
            WHERE s.outletId = :outletId
            AND s.status = 'ACTIVE'
            AND s.date >= :start AND s.date < :end
            GROUP BY s.invoiceNo,s.status, p.barcode, p.name, si.priceType, p.retailPrice, p.bulkPrice,p.weighted
            """)
    List<Object[]> getSoldItemsReport(
            @Param("outletId") String outletId,
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end
    );

    @Query("SELECT s FROM Sale s WHERE s.date BETWEEN :start AND :end AND s.outletId = :outletId")
    List<Sale> findByDateAndOutletId(
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end,
            @Param("outletId") String outletId
    );

    Optional<Sale> findTopByOrderByDateDesc();


    @Query("""
            SELECT
                si.barcode,
                COALESCE(SUM(si.value), 0)
            FROM SaleItem si
            JOIN si.sale s
            WHERE s.outletId = :outletId
            AND s.status = 'ACTIVE'
            AND s.date >= :start
            AND s.date < :end
            GROUP BY si.barcode
            """)
    List<Object[]> getStockOutByDate(
            @Param("outletId") String outletId,
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end
    );

    @Query("""
            SELECT
                s.invoiceNo,
                p.barcode,
                p.name,
                s.outletId,
                s.status,
                s.date,
            
                si.value,
            
                CASE
                    WHEN si.priceType = 'RETAIL'
                    THEN p.retailPrice
                    ELSE p.bulkPrice
                END,
            
                (
                    si.value *
                    CASE
                        WHEN si.priceType = 'RETAIL'
                        THEN p.retailPrice
                        ELSE p.bulkPrice
                    END
                )
            
            FROM SaleItem si
            
            JOIN si.sale s
            
            JOIN Product p
            ON p.barcode = si.barcode
            
            WHERE si.barcode = :barcode
            AND s.outletId = :outletId
            AND s.date >= :start
            AND s.date < :end
            
            ORDER BY s.date DESC
            """)
    List<Object[]> getProductSales(
            @Param("barcode") String barcode,
            @Param("outletId") String outletId,
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end
    );


    @Query("""
            SELECT
                s.invoiceNo,
                s.date,
                p.barcode,
                p.name,
                si.value,
                CASE
                    WHEN si.priceType = 'RETAIL'
                    THEN p.retailPrice
                    ELSE p.bulkPrice
                END,
            
                (
                    si.value *
                    CASE
                        WHEN si.priceType = 'RETAIL'
                        THEN p.retailPrice
                        ELSE p.bulkPrice
                    END
                )
            FROM Sale s
            JOIN s.items si
            JOIN Product p ON p.barcode = si.barcode
            WHERE s.status = 'CANCELLED'
            AND s.outletId = :outletId
            AND s.date >= :start
            AND s.date < :end
            ORDER BY s.date DESC
            """)
    List<Object[]> getCancelledSaleItems(
            String outletId,
            OffsetDateTime start,
            OffsetDateTime end
    );


}