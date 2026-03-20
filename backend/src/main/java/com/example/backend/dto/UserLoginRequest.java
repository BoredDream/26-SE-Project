package com.example.backend.dto;

import javax.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserLoginRequest {
    @NotBlank(message = "code不能为空")
    private String code;
}
