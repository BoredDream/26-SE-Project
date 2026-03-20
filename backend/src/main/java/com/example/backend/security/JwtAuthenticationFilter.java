package com.example.backend.security;

import com.example.backend.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    
    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        // 从请求头获取Token
        String token = extractTokenFromHeader(request);
        
        // 验证Token
        if (token != null) {
            Claims claims = jwtUtil.validateToken(token);
            if (claims != null) {
                // 将用户ID添加到请求属性
                Long userId = claims.get("id", Long.class);
                request.setAttribute("userId", userId);
                request.setAttribute("isAdmin", claims.get("isAdmin", Boolean.class));
            }
        }
        
        // 继续处理请求
        filterChain.doFilter(request, response);
    }
    
    // 从请求头中提取Token
    private String extractTokenFromHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}