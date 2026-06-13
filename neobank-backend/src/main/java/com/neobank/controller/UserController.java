package com.neobank.controller;

import com.neobank.dto.*;
import com.neobank.model.User;
import com.neobank.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getProfile(Authentication auth) {
        User user = userService.getUserById(auth.getName());
        return ResponseEntity.ok(ApiResponse.<User>builder()
                .success(true).data(user).build());
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateProfile(Authentication auth,
                                                            @RequestBody UpdateProfileRequest request) {
        User user = userService.updateProfile(auth.getName(), request);
        return ResponseEntity.ok(ApiResponse.<User>builder()
                .success(true).message("Profile updated.").data(user).build());
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(Authentication auth,
                                                             @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(auth.getName(), request);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true).message("Password changed.").build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .success(false).message(e.getMessage()).build());
        }
    }
}
