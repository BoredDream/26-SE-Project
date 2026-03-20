package com.example.backend.repository;

import com.example.backend.model.Like;
import com.example.backend.model.Like.LikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LikeRepository extends JpaRepository<Like, LikeId> {
    Like findByUserIdAndCheckinId(Long userId, Long checkinId);
    
    @Query("SELECT COUNT(l) FROM Like l WHERE l.checkin.id = :checkinId")
    Integer getLikesCount(@Param("checkinId") Long checkinId);
    
    List<Like> findByCheckinId(Long checkinId);
}
