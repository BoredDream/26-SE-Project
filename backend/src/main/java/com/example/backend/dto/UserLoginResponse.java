package com.example.backend.dto;

import lombok.Data;

@Data
public class UserLoginResponse {
    private String token;
    private UserInfo user;
    
    @Data
    public static class UserInfo {
        private Long id;
        private String nickname;
        private String role;
    }
}
