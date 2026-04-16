package dev.pingme.controller;

import dev.pingme.dto.UserDto;
import dev.pingme.entity.User;
import dev.pingme.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @GetMapping
    public List<UserDto> getAllUsers() {
        User currentUser = getAuthenticatedUser();
        return userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .map(UserDto::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/me")
    public UserDto getCurrentUser() {
        return UserDto.from(getAuthenticatedUser());
    }

    @PutMapping("/me")
    public UserDto updateCurrentUser(@Valid @RequestBody UserUpdateRequest request) {
        User currentUser = getAuthenticatedUser();

        if (request.displayName() != null) {
            currentUser.setDisplayName(request.displayName());
        }
        if (request.avatarColor() != null) {
            currentUser.setAvatarColor(request.avatarColor());
        }
        if (request.status() != null) {
            try {
                currentUser.setStatus(User.UserStatus.valueOf(request.status().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Ignore invalid status for now, or handle appropriately
            }
        }

        userRepository.save(currentUser);
        return UserDto.from(currentUser);
    }

    public record UserUpdateRequest(
            @Size(max = 100) String displayName,
            @Pattern(regexp = "^#[0-9A-Fa-f]{6}$") String avatarColor,
            String status
    ) {}
}
