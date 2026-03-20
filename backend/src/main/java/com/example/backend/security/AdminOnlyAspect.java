package com.example.backend.security;

import com.example.backend.utils.Response;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

@Aspect
@Component
public class AdminOnlyAspect {
    
    @Around("@annotation(com.example.backend.security.AdminOnly)")
    public Object checkAdmin(ProceedingJoinPoint joinPoint) throws Throwable {
        // 获取当前请求
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        
        // 检查用户是否为管理员
        Boolean isAdmin = (Boolean) request.getAttribute("isAdmin");
        
        if (isAdmin == null || !isAdmin) {
            throw new RuntimeException("无权限访问该接口");
        }
        
        // 执行原方法
        return joinPoint.proceed();
    }
}