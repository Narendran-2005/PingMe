package dev.pingme.dto;

import dev.pingme.entity.Message;
import java.time.LocalDateTime;

public record MessageDto(
        Long id,
        Long conversationId,
        Long senderId,
        String senderName,
        String senderAvatarColor,
        String content,
        String status,
        LocalDateTime createdAt,
        boolean signatureVerified
) {

    public static MessageDto from(Message message) {
        return new MessageDto(
                message.getId(),
                message.getConversation().getId(),
                message.getSender().getId(),
                message.getSender().getDisplayName(),
                message.getSender().getAvatarColor(),
                message.getContent(),
                message.getStatus().name(),
                message.getCreatedAt(),
                false
        );
    }

    public static MessageDto from(Message message, boolean signatureVerified) {
        return new MessageDto(
                message.getId(),
                message.getConversation().getId(),
                message.getSender().getId(),
                message.getSender().getDisplayName(),
                message.getSender().getAvatarColor(),
                message.getContent(),
                message.getStatus().name(),
                message.getCreatedAt(),
                signatureVerified
        );
    }
}
