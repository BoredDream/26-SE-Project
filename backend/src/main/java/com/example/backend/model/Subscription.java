package com.example.backend.model;

import javax.persistence.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "subscriptions")
public class Subscription {
    
    // 复合主键类
    @Data
    @Embeddable
    public static class SubscriptionId implements Serializable {
        @Column(name = "user_id")
        private Long userId;
        
        @Column(name = "location_id")
        private Long locationId;
    }

    @EmbeddedId
    private SubscriptionId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @MapsId("locationId")
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}