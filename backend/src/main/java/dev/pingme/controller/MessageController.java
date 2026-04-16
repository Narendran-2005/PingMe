package dev.pingme.controller;

import dev.pingme.dto.MessageDto;
import dev.pingme.entity.Conversation;
import dev.pingme.entity.Message;
import dev.pingme.entity.User;
import dev.pingme.repository.ConversationMemberRepository;
import dev.pingme.repository.ConversationRepository;
import dev.pingme.repository.MessageRepository;
import dev.pingme.repository.UserRepository;
import dev.pingme.security.DilithiumService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Base64;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageRepository messageRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final DilithiumService dilithiumService;

    @MessageMapping("/chat.send")
    @Transactional
    public void sendMessage(SendMessageRequest request, SimpMessageHeaderAccessor headerAccessor) {
        var attributes = headerAccessor.getSessionAttributes();
        if (attributes == null) return;
        String username = (String) attributes.get("username");
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return;

        if (!conversationMemberRepository.existsByConversationIdAndUserId(request.conversationId(), user.getId())) {
            return;
        }

        Conversation conversation = conversationRepository.findById(request.conversationId()).orElse(null);
        if (conversation == null) return;

        Message message = Message.builder()
                .conversation(conversation)
                .sender(user)
                .content(request.content())
                .status(Message.MessageStatus.SENT)
                .isDeleted(false)
                .build();

        Message savedMessage = messageRepository.save(message);

        boolean signatureVerified = false;
        try {
            Optional<PrivateKey> privKeyOpt = dilithiumService.getPrivateKey(user.getId());

            if (privKeyOpt.isPresent() && user.getDilithiumPublicKey() != null) {
                byte[] msgBytes = request.content().getBytes(StandardCharsets.UTF_8);
                byte[] sigBytes = dilithiumService.signMessage(msgBytes, privKeyOpt.get());
                String sigBase64 = Base64.getEncoder().encodeToString(sigBytes);
                
                PublicKey pubKey = dilithiumService.decodePublicKey(user.getDilithiumPublicKey());

                if (pubKey != null) {
                    signatureVerified = dilithiumService.verifySignature(msgBytes, sigBytes, pubKey);
                }

                savedMessage.setSignature(sigBase64);
                messageRepository.save(savedMessage);

                log.debug("Message {} signed and verified={}", savedMessage.getId(), signatureVerified);
            } else {
                log.warn("No private key for user {} — message sent unsigned", user.getId());
            }
        } catch (Exception e) {
            log.error("Signing failed for message {}: {}", savedMessage.getId(), e.getMessage());
        }

        MessageDto messageDto = MessageDto.from(savedMessage, signatureVerified);

        messagingTemplate.convertAndSend("/topic/conversation." + request.conversationId(), messageDto);
    }

    @MessageMapping("/chat.typing")
    public void typing(TypingEvent request, SimpMessageHeaderAccessor headerAccessor) {
        var attributes = headerAccessor.getSessionAttributes();
        if (attributes == null) return;
        String username = (String) attributes.get("username");
        if (username == null) return;

        TypingResponse response = new TypingResponse(request.conversationId(), username, true);
        messagingTemplate.convertAndSend("/topic/conversation." + request.conversationId() + ".typing", response);
    }

    @MessageMapping("/chat.stopTyping")
    public void stopTyping(TypingEvent request, SimpMessageHeaderAccessor headerAccessor) {
        var attributes = headerAccessor.getSessionAttributes();
        if (attributes == null) return;
        String username = (String) attributes.get("username");
        if (username == null) return;

        TypingResponse response = new TypingResponse(request.conversationId(), username, false);
        messagingTemplate.convertAndSend("/topic/conversation." + request.conversationId() + ".typing", response);
    }

    public record SendMessageRequest(Long conversationId, String content) {}
    public record TypingEvent(Long conversationId) {}
    public record TypingResponse(Long conversationId, String username, boolean isTyping) {}
}
