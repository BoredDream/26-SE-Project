package com.example.backend.repository;

import com.example.backend.model.Subscription;
import com.example.backend.model.Subscription.SubscriptionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, SubscriptionId> {
    Subscription findByUserIdAndLocationId(Long userId, Long locationId);
    
    @Query("SELECT s FROM Subscription s JOIN FETCH s.location WHERE s.user.id = :userId")
    List<Subscription> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT s.user FROM Subscription s WHERE s.location.id = :locationId")
    List<Object> getSubscribers(@Param("locationId") Long locationId);
}
