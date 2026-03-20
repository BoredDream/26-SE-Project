package com.example.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class UploadService {
    
    // 本地存储路径（实际项目中应该配置到application.properties）
    private static final String UPLOAD_DIR = "uploads/";
    
    public UploadService() {
        // 创建上传目录
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }
    
    // 上传图片
    public Map<String, String> uploadImage(MultipartFile file) throws IOException {
        // 验证文件
        if (file.isEmpty()) {
            throw new RuntimeException("未上传文件");
        }
        
        // 验证文件类型
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("只允许上传图片文件");
        }
        
        // 生成文件名
        String filename = UUID.randomUUID().toString();
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        
        // 创建上传目录
        createDirectories();
        
        // 读取原始图片
        BufferedImage originalImage = ImageIO.read(file.getInputStream());
        
        // 生成三级分辨率
        Map<String, String> result = new HashMap<>();
        
        // 原图（保存为webp格式）
        String originalPath = UPLOAD_DIR + "original/" + filename + ".webp";
        File originalFile = new File(originalPath);
        ImageIO.write(originalImage, "webp", originalFile);
        result.put("original", getUrl("original/" + filename + ".webp"));
        
        // 标准图（1080x1080，jpg格式）
        BufferedImage standardImage = resizeImage(originalImage, 1080, 1080);
        String standardPath = UPLOAD_DIR + "standard/" + filename + ".jpg";
        File standardFile = new File(standardPath);
        ImageIO.write(standardImage, "jpg", standardFile);
        result.put("standard", getUrl("standard/" + filename + ".jpg"));
        
        // 缩略图（400x400，jpg格式）
        BufferedImage thumbImage = resizeImage(originalImage, 400, 400);
        String thumbPath = UPLOAD_DIR + "thumb/" + filename + ".jpg";
        File thumbFile = new File(thumbPath);
        ImageIO.write(thumbImage, "jpg", thumbFile);
        result.put("thumb", getUrl("thumb/" + filename + ".jpg"));
        
        return result;
    }
    
    // 创建目录
    private void createDirectories() {
        new File(UPLOAD_DIR + "original/").mkdirs();
        new File(UPLOAD_DIR + "standard/").mkdirs();
        new File(UPLOAD_DIR + "thumb/").mkdirs();
    }
    
    // 调整图片大小
    private BufferedImage resizeImage(BufferedImage originalImage, int targetWidth, int targetHeight) {
        int width = originalImage.getWidth();
        int height = originalImage.getHeight();
        
        // 计算缩放比例，保持宽高比
        double widthRatio = (double) targetWidth / width;
        double heightRatio = (double) targetHeight / height;
        double ratio = Math.min(widthRatio, heightRatio);
        
        int newWidth = (int) (width * ratio);
        int newHeight = (int) (height * ratio);
        
        // 创建缩放后的图片
        Image resultingImage = originalImage.getScaledInstance(newWidth, newHeight, Image.SCALE_SMOOTH);
        BufferedImage outputImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        
        // 绘制缩放后的图片
        Graphics2D g2d = outputImage.createGraphics();
        g2d.drawImage(resultingImage, 0, 0, null);
        g2d.dispose();
        
        return outputImage;
    }
    
    // 生成访问URL（实际项目中应该根据部署情况生成正确的URL）
    private String getUrl(String path) {
        // 这里简化处理，返回相对路径
        // 实际项目中应该返回完整的URL
        return "/" + path;
    }
}