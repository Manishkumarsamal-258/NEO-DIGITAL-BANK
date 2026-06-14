package com.neobank.service;

import com.neobank.dto.*;
import com.neobank.model.User;
import com.neobank.repository.UserRepository;
import com.neobank.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email."));

        if (user.getStatus() == User.UserStatus.suspended) {
            throw new RuntimeException("Your account has been suspended. Contact support.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect password. Please try again.");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return toLoginResponse(user, token);
    }

    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new RuntimeException("An account with this email already exists.");
        }

        String initials = Arrays.stream(request.getName().split(" "))
                .map(n -> n.substring(0, 1).toUpperCase())
                .collect(Collectors.joining())
            .substring(0, Math.min(2, request.getName().split(" ").length));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.customer)
                .phone(request.getPhone())
                .address(request.getAddress() != null ? request.getAddress() : "")
                .createdAt(LocalDate.now())
                .status(User.UserStatus.active)
                .avatarInitials(initials)
                .build();

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return toLoginResponse(user, token);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(String userId, UpdateProfileRequest request) {
        User user = getUserById(userId);
        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        return userRepository.save(user);
    }

    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = getUserById(userId);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect.");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User toggleUserStatus(String userId) {
        User user = getUserById(userId);
        user.setStatus(user.getStatus() == User.UserStatus.active
                ? User.UserStatus.suspended
                : User.UserStatus.active);
        return userRepository.save(user);
    }

    // ── Admin CRUD ──────────────────────────────────────────────────────────

    public User createUser(AdminUserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new RuntimeException("A user with this email already exists.");
        }

        String initials = Arrays.stream(request.getName().split(" "))
                .map(n -> n.substring(0, 1).toUpperCase())
                .collect(Collectors.joining())
            .substring(0, Math.min(2, request.getName().split(" ").length));

        User.UserRole role = User.UserRole.customer;
        if (request.getRole() != null) {
            role = User.UserRole.valueOf(request.getRole());
        }

        User.UserStatus status = User.UserStatus.active;
        if (request.getStatus() != null) {
            status = User.UserStatus.valueOf(request.getStatus());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "NeoBank@123"))
                .role(role)
                .phone(request.getPhone() != null ? request.getPhone() : "")
                .address(request.getAddress() != null ? request.getAddress() : "")
                .createdAt(LocalDate.now())
                .status(status)
                .avatarInitials(initials)
                .build();

        return userRepository.save(user);
    }

    public User updateUser(String userId, AdminUserRequest request) {
        User user = getUserById(userId);

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getRole() != null) user.setRole(User.UserRole.valueOf(request.getRole()));
        if (request.getStatus() != null) user.setStatus(User.UserStatus.valueOf(request.getStatus()));
        if (request.getEmail() != null) {
            if (!request.getEmail().equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmailIgnoreCase(request.getEmail())) {
                throw new RuntimeException("A user with this email already exists.");
            }
            user.setEmail(request.getEmail().toLowerCase());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return userRepository.save(user);
    }

    public void deleteUser(String userId) {
        User user = getUserById(userId);
        if (user.getRole() == User.UserRole.admin) {
            throw new RuntimeException("Cannot delete admin users.");
        }
        userRepository.delete(user);
    }

    private LoginResponse toLoginResponse(User user, String token) {
        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .phone(user.getPhone())
                .address(user.getAddress())
                .createdAt(user.getCreatedAt().toString())
                .status(user.getStatus().name())
                .avatarInitials(user.getAvatarInitials())
                .build();
    }
}
