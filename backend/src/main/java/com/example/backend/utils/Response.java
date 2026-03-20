package com.example.backend.utils;

import lombok.Data;

@Data
public class Response<T> {
    private int code;
    private String message;
    private T data;
    private long timestamp;
    
    private Response(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }
    
    // 成功响应
    public static <T> Response<T> success(T data) {
        return new Response<>(0, "success", data);
    }
    
    public static Response<Void> success() {
        return new Response<>(0, "success", null);
    }
    
    // 失败响应
    public static <T> Response<T> error(int code, String message) {
        return new Response<>(code, message, null);
    }
    
    public static <T> Response<T> error(int code, String message, T data) {
        return new Response<>(code, message, data);
    }
}