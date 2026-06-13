package com.neobank.auth.controller;

import com.neobank.auth.model.User;
import com.neobank.auth.service.UserService;
import com.neobank.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) { this.userService = userService; }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<ApiResponse<User>> toggleUserStatus(@PathVariable String id) {
        User user = userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("User status updated.", user));
    }
}