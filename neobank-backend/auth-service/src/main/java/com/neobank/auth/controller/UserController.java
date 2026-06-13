package com.neobank.auth.controller;

import com.neobank.auth.dto.*;
import com.neobank.auth.model.User;
import com.neobank.auth.service.UserService;
import com.neobank.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) { this.userService = userService; }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getProfile(Authentication auth) {
        User user = userService.getUserById(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateProfile(Authentication auth, @RequestBody UpdateProfileRequest request) {
        User user = userService.updateProfile(auth.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated.", user));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(Authentication auth, @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(auth.getName(), request);
            return ResponseEntity.ok(ApiResponse.ok("Password changed.", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}