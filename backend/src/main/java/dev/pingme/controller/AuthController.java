package dev.pingme.controller;

import dev.pingme.entity.User;
import dev.pingme.repository.UserRepository;
import dev.pingme.security.DilithiumService;
import dev.pingme.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.KeyPair;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final DilithiumService dilithiumService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Username is already taken"));
        }
        if (userRepository.existsByEmail(request.email())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Email is already taken"));
        }

        User user = User.builder()
                .username(request.username())
                .displayName(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .status(User.UserStatus.OFFLINE)
                .build();

        user = userRepository.save(user);

        try {
            KeyPair kp = dilithiumService.generateKeyPair();
            String pubKeyBase64 = dilithiumService.encodePublicKey(kp.getPublic());
            user.setDilithiumPublicKey(pubKeyBase64);
            userRepository.save(user);
            dilithiumService.storePrivateKey(user.getId(), kp.getPrivate());
            log.info("Dilithium keypair generated for new user: {}", user.getUsername());
        } catch (Exception e) {
            log.error("Dilithium keygen failed for {}: {}", user.getUsername(), e.getMessage());
        }

        String token = jwtUtil.generateToken(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, mapToUserDto(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid username or password"));
        }

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(User.UserStatus.ONLINE);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, mapToUserDto(user)));
    }

    private UserDto mapToUserDto(User user) {
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getAvatarColor(),
                user.getStatus().name()
        );
    }

    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 50) String username,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6) String password
    ) {}

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {}

    public record UserDto(
            Long id,
            String username,
            String displayName,
            String avatarColor,
            String status
    ) {}

    public record AuthResponse(
            String token,
            UserDto user
    ) {}

    public record ErrorResponse(
            String message
    ) {}
}
