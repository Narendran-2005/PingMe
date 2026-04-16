package dev.pingme.dto;

import dev.pingme.entity.User;

public record UserDto(
        Long id,
        String username,
        String displayName,
        String avatarColor,
        String status
) {
    public static UserDto from(User user) {
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getAvatarColor(),
                user.getStatus().name()
        );
    }
}
