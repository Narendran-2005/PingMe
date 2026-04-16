package dev.pingme.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ConversationDto(
        Long id,
        String name,
        String type,
        String lastMessageContent,
        LocalDateTime lastMessageTime,
        int unreadCount,
        List<MemberDto> members
) {
    public record MemberDto(
            Long userId,
            String displayName,
            String avatarColor,
            String role,
            String status
    ) {}
}
