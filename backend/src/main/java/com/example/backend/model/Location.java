package com.example.backend.model;

import javax.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "locations")
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "flower_species", nullable = false, length = 50)
    private String flowerSpecies;

    @Column(name = "flower_species_en", length = 50)
    private String flowerSpeciesEn;

    @Column(name = "historical_bloom_start")
    private Integer historicalBloomStart;

    @Column(name = "historical_bloom_end")
    private Integer historicalBloomEnd;

    @Column(name = "cover_image", length = 255)
    private String coverImage;

    @Column(name = "bloom_status", nullable = false, length = 20)
    private String bloomStatus;

    @Column(name = "status_updated_at")
    private LocalDateTime statusUpdatedAt;

    @Column(name = "checkin_count", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer checkinCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (bloomStatus == null) {
            bloomStatus = "unknown";
        }
        if (checkinCount == null) {
            checkinCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}