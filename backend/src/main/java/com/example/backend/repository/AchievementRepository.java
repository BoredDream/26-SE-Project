package com.example.backend.repository;

import com.example.backend.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    Achievement findByUserIdAndFlowerSpecies(Long userId, String flowerSpecies);
    
    List<Achievement> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT COUNT(c) FROM Checkin c WHERE c.user.id = :userId AND c.location.flowerSpecies = :flowerSpecies AND c.auditStatus = 'approved'")
    Integer getCheckinCountByUserAndSpecies(@Param("userId") Long userId, @Param("flowerSpecies") String flowerSpecies);
}
