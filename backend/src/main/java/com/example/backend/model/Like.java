package com.example.backend.model;

import javax.persistence.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "likes")
public class Like {
    
    // 复合主键类
    @Data
    @Embeddable
    public static class LikeId implements Serializable {
        @Column(name = "user_id")
        private Long userId;
        
        @Column(name = "checkin_id")
        private Long checkinId;
    }

    @EmbeddedId
    private LikeId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @MapsId("checkinId")
    @JoinColumn(name = "checkin_id", nullable = false)
    private Checkin checkin;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}