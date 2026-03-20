package com.example.backend.controller;

import com.example.backend.service.UploadService;
import com.example.backend.utils.Response;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/v1")
public class UploadController {
    
    private final UploadService uploadService;
    
    public UploadController(UploadService uploadService) {
        this.uploadService = uploadService;
    }
    
    // 处理图片上传
    @PostMapping("/upload/image")
    public Response<Map<String, String>> uploadImage(@RequestAttribute("userId") Long userId, 
                                                   @RequestParam("file") MultipartFile file) {
        try {
            Map<String, String> result = uploadService.uploadImage(file);
            return Response.success(result);
        } catch (Exception e) {
            return Response.error(1001, e.getMessage());
        }
    }
}