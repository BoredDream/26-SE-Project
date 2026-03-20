package com.example.backend.repository;

import com.example.backend.model.Checkin;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CheckinRepository extends JpaRepository<Checkin, Long> {
    List<Checkin> findByLocationIdAndAuditStatusOrderByCreatedAtDesc(Long locationId, String auditStatus, Pageable pageable);
    
    List<Checkin> findByUserIdAndAuditStatusOrderByCreatedAtDesc(Long userId, String auditStatus);
    
    @Modifying
    @Query("UPDATE Checkin c SET c.auditStatus = :status, c.auditReason = :reason WHERE c.id = :id")
    void updateAuditStatus(@Param("id") Long id, @Param("status") String status, @Param("reason") String reason);
    
    @Modifying
    @Query("UPDATE Checkin c SET c.likesCount = c.likesCount + 1 WHERE c.id = :id")
    void incrementLikesCount(@Param("id") Long id);
    
    @Modifying
    @Query("UPDATE Checkin c SET c.likesCount = c.likesCount - 1 WHERE c.id = :id AND c.likesCount > 0")
    void decrementLikesCount(@Param("id") Long id);
    
    @Query("SELECT c.bloomReport, COUNT(c) FROM Checkin c WHERE c.location.id = :locationId AND c.bloomReport IS NOT NULL AND c.auditStatus = 'approved' AND c.createdAt > :since GROUP BY c.bloomReport")
    List<Object[]> getRecentBloomReports(@Param("locationId") Long locationId, @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(c) FROM Checkin c WHERE c.user.id = :userId AND c.auditStatus = 'approved' AND YEAR(c.createdAt) = :year AND MONTH(c.createdAt) = :month")
    Integer getMonthlyCheckinCount(@Param("userId") Long userId, @Param("year") Integer year, @Param("month") Integer month);
    
    List<Checkin> findByAuditStatusOrderByLikesCountDesc(String auditStatus, Pageable pageable);
}
