package com.pos.pos_system_backend.repository;

import com.pos.pos_system_backend.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    @Query("SELECT COALESCE(SUM(s.total),0) FROM Sale s WHERE s.outletId = :outletId AND s.status = 'ACTIVE' AND s.date >= :start AND s.date < :end")
    double getTotalSales(@Param("outletId") String outletId, @Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

    @Query("SELECT COALESCE(SUM(s.discountAmount),0) FROM Sale s WHERE s.outletId = :outletId AND s.status = 'ACTIVE' AND s.date >= :start AND s.date < :end")
    double getTotalDiscount(@Param("outletId") String outletId, @Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.outletId = :outletId AND s.status = 'ACTIVE' AND s.date >= :start AND s.date < :end")
    long getTotalTransactions(@Param("outletId") String outletId, @Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

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

    Optional<Sale> findTopByOutletIdOrderByDateDesc(String outletId);


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
                p.weighted,
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

    @Query("""
            select s.date, s.total
            from Sale s
            where s.outletId = :outletId
              and s.status = com.pos.pos_system_backend.enums.SaleStatus.ACTIVE
              and s.date >= :start and s.date < :end
            """)
    List<Object[]> getSaleDateAndTotals(@Param("outletId") String outletId,
                                        @Param("start") OffsetDateTime start,
                                        @Param("end") OffsetDateTime end);


    @Query("""
        SELECT p.barcode, p.name, p.weighted, si.priceType,
               SUM(si.value),
               SUM(si.value * si.unitPrice)
        FROM SaleItem si
        JOIN si.sale s
        JOIN Product p ON p.barcode = si.barcode
        WHERE s.outletId = :outletId
          AND s.status = 'ACTIVE'
          AND s.date >= :start AND s.date < :end
        GROUP BY p.barcode, p.name, p.weighted, si.priceType
        """)
    List<Object[]> getMonthlyProductSales(
            @Param("outletId") String outletId,
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end
    );

//    @Query("""
//    select new com.pos.pos_system_backend.dto.ItemTotals(
//        si.barcode, si.priceType, sum(si.value), sum(si.value * si.unitPrice))
//    from SaleItem si join si.sale s
//    where s.outletId = :outletId and s.status = :status
//      and s.date >= :from and s.date < :to
//    group by si.barcode, si.priceType
//    """)
//    List<ItemTotals> sumItems(String outletId, SaleStatus status, OffsetDateTime from, OffsetDateTime to);

//    @Query("""
//    select new com.pos.pos_system_backend.dto.SaleRow(s.date, s.total, s.discountAmount)
//    from Sale s
//    where s.outletId = :outletId and s.status = :status
//      and s.date >= :from and s.date < :to
//    """)
//    List<SaleRow> findSaleRows(String outletId, SaleStatus status, OffsetDateTime from, OffsetDateTime to);
//
//    long countByOutletIdAndStatusAndDateGreaterThanEqualAndDateLessThan(
//            String outletId, SaleStatus status, OffsetDateTime from, OffsetDateTime to);
}