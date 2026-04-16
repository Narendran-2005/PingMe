package dev.pingme.config;

import dev.pingme.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        System.out.println("[WEBSOCKET HANDSHAKE] Incoming request to: " + request.getURI());
        String query = request.getURI().getQuery();
        if (query != null && query.contains("token=")) {
            String token = query.substring(query.indexOf("token=") + 6);
            if (token.contains("&")) {
                token = token.substring(0, token.indexOf("&"));
            }
            if (jwtUtil.isTokenValid(token)) {
                String username = jwtUtil.extractUsername(token);
                attributes.put("username", username);
                System.out.println("[WEBSOCKET HANDSHAKE] SUCCESS for user: " + username);
                return true;
            } else {
                System.out.println("[WEBSOCKET HANDSHAKE] FAILURE: Token inherently invalid");
            }
        } else {
            System.out.println("[WEBSOCKET HANDSHAKE] FAILURE: Missing token=");
        }
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, @org.springframework.lang.Nullable Exception exception) {
        // empty implementation
    }
}
