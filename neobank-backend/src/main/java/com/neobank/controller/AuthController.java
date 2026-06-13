package com.neobank.controller;

import com.neobank.dto.*;
import com.neobank.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            return ResponseEntity.ok(ApiResponse.<LoginResponse>builder()
                    .success(true).message("Login successful.").data(response).build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<LoginResponse>builder()
                    .success(false).message(e.getMessage()).build());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<LoginResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            LoginResponse response = userService.register(request);
            return ResponseEntity.ok(ApiResponse.<LoginResponse>builder()
                    .success(true).message("Registration successful.").data(response).build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<LoginResponse>builder()
                    .success(false).message(e.getMessage()).build());
        }
    }
}
