package com.example.backend.config;

import com.example.backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 禁用默认的CSRF和会话管理
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            
            // 配置授权规则
            .authorizeRequests()
                // 允许公开访问的静态资源
                .antMatchers("/admin.html", "/admin.css", "/admin.js", "/favicon.ico").permitAll()
                // 允许访问所有静态资源
                .antMatchers("/static/**").permitAll()
                // 允许公开访问的接口
                .antMatchers("/v1/auth/login", "/health", "/actuator/**").permitAll()
                // 允许访问地点列表和详情
                .antMatchers("/v1/locations", "/v1/locations/{id}").permitAll()
                .antMatchers("/v1/locations/{id}/checkins").permitAll()
                // 允许访问排行榜相关接口
                .antMatchers("/v1/leaderboard/**").permitAll()
                .antMatchers("/v1/users/{id}/achievements").permitAll()
                // 其他接口需要认证
                .anyRequest().authenticated()
            .and()
            
            // 添加JWT过滤器
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}