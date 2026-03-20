package com.example.backend.repository;

import com.example.backend.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByBloomStatus(String bloomStatus);
    
    List<Location> findByNameContainingOrFlowerSpeciesContainingOrDescriptionContaining(String name, String flowerSpecies, String description);
    
    @Modifying
    @Query("UPDATE Location l SET l.bloomStatus = :status, l.statusUpdatedAt = CURRENT_TIMESTAMP WHERE l.id = :id")
    void updateBloomStatus(@Param("id") Long id, @Param("status") String status);
    
    @Modifying
    @Query("UPDATE Location l SET l.checkinCount = l.checkinCount + 1 WHERE l.id = :id")
    void incrementCheckinCount(@Param("id") Long id);
    
    @Query("SELECT l.id, l.latitude, l.longitude, l.checkinCount FROM Location l")
    List<Object[]> findAllForHeatmap();
}
