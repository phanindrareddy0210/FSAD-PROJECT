package com.klu;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    @Transactional
    public ResponseEntity<String> signup(@Valid @RequestBody User user) {
        logger.info("Signup request received: username={}, email={}, roleString={}", 
                    user.getUsername(), user.getEmail(), user.getRoleString());

        // Validate required fields
        if (user.getUsername() == null || user.getPassword() == null || 
            user.getEmail() == null || user.getRoleString() == null || 
            user.getUsername().trim().isEmpty() || user.getPassword().trim().isEmpty() || 
            user.getEmail().trim().isEmpty() || user.getRoleString().trim().isEmpty()) {
            logger.warn("Invalid signup request: username, password, email, or role missing or empty");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Username, password, email, and role are required and cannot be empty");
        }

        // Normalize username and email
        String username = user.getUsername().trim();
        String email = user.getEmail().trim();

        // Check for existing username
        if (userRepository.findByUsername(username) != null) {
            logger.warn("Signup failed: username {} already exists", username);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("Username already exists");
        }

        // Check for existing email
        if (userRepository.findByEmail(email) != null) {
            logger.warn("Signup failed: email {} already exists", email);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("Email already exists");
        }

        // Convert roleString to Role enum
        try {
            Role role = Role.valueOf(user.getRoleString().toUpperCase());
            user.setRole(role);
        } catch (IllegalArgumentException e) {
            logger.warn("Signup failed: invalid role {}", user.getRoleString());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Invalid role. Must be one of: PATIENT, DOCTOR, ADMIN");
        }

        // Validate doctor-specific fields
        if (user.getRole() == Role.DOCTOR) {
            if (user.getSpecialty() == null || user.getSpecialty().trim().isEmpty()) {
                logger.warn("Signup failed: specialty is required for doctors");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body("Specialty is required for doctors");
            }
            if (user.getLicenseNumber() == null || user.getLicenseNumber().trim().isEmpty()) {
                logger.warn("Signup failed: license number is required for doctors");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body("License number is required for doctors");
            }
        } else {
            // Clear doctor-specific fields for non-doctors
            user.setSpecialty(null);
            user.setLicenseNumber(null);
        }

        try {
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User savedUser = userRepository.save(user);
            logger.info("User signed up successfully: id={}, username={}, email={}, role={}", 
                        savedUser.getId(), username, email, user.getRole());
            return ResponseEntity.ok("Successfully signed up");
        } catch (Exception e) {
            logger.error("Error during signup for username {}: {}", username, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Failed to sign up: " + e.getMessage());
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody User user) {
        logger.info("Signin request received: username={}", user.getUsername());

        if (user == null || user.getUsername() == null || user.getPassword() == null || 
            user.getUsername().trim().isEmpty() || user.getPassword().trim().isEmpty()) {
            logger.warn("Invalid signin request: username or password missing or empty");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Username and password are required and cannot be empty");
        }

        String username = user.getUsername().trim();
        User existingUser = userRepository.findByUsername(username);
        if (existingUser == null || !passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            logger.warn("Signin failed: invalid credentials for username {}", username);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body("Invalid username or password");
        }

        logger.info("User signed in successfully: username={}, role={}", username, existingUser.getRole());
        return ResponseEntity.ok(new SignInResponse(existingUser.getId(), username, existingUser.getRole()));
    }
}