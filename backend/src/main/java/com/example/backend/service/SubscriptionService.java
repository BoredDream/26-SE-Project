package com.example.backend.service;

import com.example.backend.model.Subscription;
import com.example.backend.model.Subscription.SubscriptionId;
import com.example.backend.repository.SubscriptionRepository;
import com.example.backend.repository.LocationRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubscriptionService {
    
    private final SubscriptionRepository subscriptionRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    
    public SubscriptionService(SubscriptionRepository subscriptionRepository, LocationRepository locationRepository, 
                             UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
    }
    
    // 订阅地点
    @Transactional
    public void subscribeLocation(Long userId, Long locationId) {
        // 检查地点是否存在
        locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("地点不存在"));
        
        // 检查是否已订阅
        Subscription existingSubscription = subscriptionRepository.findByUserIdAndLocationId(userId, locationId);
        
        if (existingSubscription == null) {
            // 创建订阅
            Subscription subscription = new Subscription();
            SubscriptionId subscriptionId = new SubscriptionId();
            subscriptionId.setUserId(userId);
            subscriptionId.setLocationId(locationId);
            subscription.setId(subscriptionId);
            subscription.setUser(userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("用户不存在")));
            subscription.setLocation(locationRepository.findById(locationId)
                    .orElseThrow(() -> new RuntimeException("地点不存在")));
            
            subscriptionRepository.save(subscription);
        }
    }
    
    // 取消订阅
    @Transactional
    public void unsubscribeLocation(Long userId, Long locationId) {
        Subscription subscription = subscriptionRepository.findByUserIdAndLocationId(userId, locationId);
        
        if (subscription != null) {
            subscriptionRepository.delete(subscription);
        }
    }
    
    // 获取我的订阅列表
    public List<Subscription> getMySubscriptions(Long userId) {
        return subscriptionRepository.findByUserId(userId);
    }
}