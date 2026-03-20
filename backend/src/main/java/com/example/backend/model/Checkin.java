package com.example.backend.model;

import javax.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "checkins")
public class Checkin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "bloom_report", length = 20)
    private String bloomReport;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "images", columnDefinition = "JSON")
    private String imagesJson;

    @Column(name = "gps_verified", nullable = false)
    private Boolean gpsVerified;

    @Column(name = "user_latitude")
    private Double userLatitude;

    @Column(name = "user_longitude")
    private Double userLongitude;

    @Column(name = "audit_status", nullable = false, length = 20)
    private String auditStatus;

    @Column(name = "audit_reason", columnDefinition = "TEXT")
    private String auditReason;

    @Column(name = "likes_count", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer likesCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 图片列表的getter和setter（JSON转换）
    public List<String> getImages() {
        if (imagesJson == null) {
            return null;
        }
        try {
            return new ObjectMapper().readValue(imagesJson, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse images JSON", e);
        }
    }

    public void setImages(List<String> images) {
        if (images == null) {
            imagesJson = null;
            return;
        }
        try {
            imagesJson = new ObjectMapper().writeValueAsString(images);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert images to JSON", e);
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (auditStatus == null) {
            auditStatus = "pending";
        }
        if (likesCount == null) {
            likesCount = 0;
        }
        if (gpsVerified == null) {
            gpsVerified = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}