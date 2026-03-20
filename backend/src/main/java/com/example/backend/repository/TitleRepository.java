package com.example.backend.repository;

import com.example.backend.model.Title;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TitleRepository extends JpaRepository<Title, Long> {
    Title findByUserIdAndTitleKey(Long userId, String titleKey);
    List<Title> findByUserIdOrderByAwardedAtDesc(Long userId);
}