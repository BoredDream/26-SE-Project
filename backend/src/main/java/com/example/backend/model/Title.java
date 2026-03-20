package com.example.backend.model;

import javax.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "titles", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "title_key"})
})
public class Title {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title_key", nullable = false, length = 50)
    private String titleKey;

    @Column(name = "title_name", nullable = false, length = 50)
    private String titleName;

    @Column(name = "awarded_at", nullable = false, updatable = false)
    private LocalDateTime awardedAt;

    @PrePersist
    protected void onCreate() {
        awardedAt = LocalDateTime.now();
    }
}