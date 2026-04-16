package dev.pingme.config;

import dev.pingme.entity.User;
import dev.pingme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final UserRepository userRepository;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        var attributes = headerAccessor.getSessionAttributes();
        String username = attributes != null ? (String) attributes.get("username") : null;
        
        if (username != null) {
            log.info("User connected to WebSocket: {}", username);
            userRepository.findByUsername(username).ifPresent(user -> {
                user.setStatus(User.UserStatus.ONLINE);
                userRepository.save(user);
            });
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        var attributes = headerAccessor.getSessionAttributes();
        String username = attributes != null ? (String) attributes.get("username") : null;

        if (username != null) {
            log.info("User disconnected from WebSocket: {}", username);
            userRepository.findByUsername(username).ifPresent(user -> {
                user.setStatus(User.UserStatus.OFFLINE);
                user.setLastSeen(LocalDateTime.now());
                userRepository.save(user);
            });
        }
    }
}
