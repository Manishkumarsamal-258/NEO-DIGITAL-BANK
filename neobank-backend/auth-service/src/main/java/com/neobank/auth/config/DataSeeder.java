package com.neobank.auth.config;

import com.neobank.auth.model.User;
import com.neobank.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Auth database already seeded. Skipping...");
            return;
        }
        log.info("Seeding auth database with users...");

        User alice = saveUser("Alice Johnson", "alice@neobank.com", "password123", User.UserRole.customer, "+1 (555) 234-5678", "123 Maple Street, New York, NY 10001", "AJ");
        User bob = saveUser("Bob Martinez", "bob@neobank.com", "password123", User.UserRole.customer, "+1 (555) 345-6789", "456 Oak Avenue, Los Angeles, CA 90001", "BM");
        User sarah = saveUser("Sarah Chen", "teller@neobank.com", "teller123", User.UserRole.teller, "+1 (555) 456-7890", "789 Pine Road, Chicago, IL 60601", "SC");
        User michael = saveUser("Michael Brown", "admin@neobank.com", "admin123", User.UserRole.admin, "+1 (555) 567-8901", "321 Elm Street, Houston, TX 77001", "MB");
        User emma = saveUser("Emma Wilson", "emma@neobank.com", "password123", User.UserRole.customer, "+1 (555) 678-9012", "654 Birch Lane, Phoenix, AZ 85001", "EW");
        emma.setStatus(User.UserStatus.suspended);
        userRepository.save(emma);

        log.info("Auth database seeded with {} users.", userRepository.count());
    }

    private User saveUser(String name, String email, String password, User.UserRole role, String phone, String address, String initials) {
        return userRepository.save(User.builder()
                .name(name).email(email).password(passwordEncoder.encode(password))
                .role(role).phone(phone).address(address)
                .createdAt(LocalDate.now()).status(User.UserStatus.active)
                .avatarInitials(initials).build());
    }
}