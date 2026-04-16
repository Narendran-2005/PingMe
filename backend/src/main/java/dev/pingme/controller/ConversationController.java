package dev.pingme.controller;

import dev.pingme.dto.ConversationDto;
import dev.pingme.dto.MessageDto;
import dev.pingme.entity.Conversation;
import dev.pingme.entity.ConversationMember;
import dev.pingme.entity.Message;
import dev.pingme.entity.User;
import dev.pingme.repository.ConversationMemberRepository;
import dev.pingme.repository.ConversationRepository;
import dev.pingme.repository.MessageRepository;
import dev.pingme.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository memberRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    private boolean isUserMemberOf(Long conversationId, Long userId) {
        return memberRepository.existsByConversationIdAndUserId(conversationId, userId);
    }

    @GetMapping
    public List<ConversationDto> getConversations() {
        User currentUser = getAuthenticatedUser();
        List<Conversation> conversations = conversationRepository.findConversationsByUserId(currentUser.getId());

        return conversations.stream().map(c -> {
            List<Message> msgs = messageRepository.findByConversationIdOrderByCreatedAtAsc(c.getId());
            String lastMsg = msgs.isEmpty() ? null : msgs.get(msgs.size() - 1).getContent();
            var lastTime = msgs.isEmpty() ? null : msgs.get(msgs.size() - 1).getCreatedAt();

            List<ConversationDto.MemberDto> memberDtos = c.getMembers().stream().map(m ->
                    new ConversationDto.MemberDto(
                            m.getUser().getId(),
                            m.getUser().getDisplayName(),
                            m.getUser().getAvatarColor(),
                            m.getRole().name(),
                            m.getUser().getStatus().name()
                    )
            ).collect(Collectors.toList());

            return new ConversationDto(
                    c.getId(),
                    c.getName(),
                    c.getType().name(),
                    lastMsg,
                    lastTime,
                    0, // hardcoded 0 unread
                    memberDtos
            );
        }).collect(Collectors.toList());
    }

    @PostMapping("/direct")
    public ResponseEntity<ConversationDto> createDirectConversation(@Valid @RequestBody DirectRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getId().equals(request.targetUserId())) {
            return ResponseEntity.badRequest().build();
        }

        User targetUser = userRepository.findById(request.targetUserId())
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        Optional<Conversation> existing = memberRepository.findDirectConversation(currentUser.getId(), targetUser.getId());
        if (existing.isPresent()) {
            return ResponseEntity.ok(mapToDto(existing.get()));
        }

        Conversation conversation = Conversation.builder()
                .type(Conversation.ConversationType.DIRECT)
                .createdBy(currentUser)
                .build();
        conversation = conversationRepository.save(conversation);

        memberRepository.save(ConversationMember.builder()
                .conversation(conversation)
                .user(currentUser)
                .role(ConversationMember.MemberRole.MEMBER)
                .build());

        memberRepository.save(ConversationMember.builder()
                .conversation(conversation)
                .user(targetUser)
                .role(ConversationMember.MemberRole.MEMBER)
                .build());

        // Reload to get members populated
        conversation = conversationRepository.findById(conversation.getId()).get();
        return ResponseEntity.ok(mapToDto(conversation));
    }

    @PostMapping("/group")
    public ResponseEntity<ConversationDto> createGroupConversation(@Valid @RequestBody GroupRequest request) {
        User currentUser = getAuthenticatedUser();

        Conversation conversation = Conversation.builder()
                .name(request.name())
                .type(Conversation.ConversationType.GROUP)
                .createdBy(currentUser)
                .build();
        final Conversation savedConversation = conversationRepository.save(conversation);

        memberRepository.save(ConversationMember.builder()
                .conversation(savedConversation)
                .user(currentUser)
                .role(ConversationMember.MemberRole.ADMIN)
                .build());

        for (Long memberId : request.memberIds()) {
            if (!memberId.equals(currentUser.getId())) {
                userRepository.findById(memberId).ifPresent(u -> {
                    memberRepository.save(ConversationMember.builder()
                            .conversation(savedConversation)
                            .user(u)
                            .role(ConversationMember.MemberRole.MEMBER)
                            .build());
                });
            }
        }

        Conversation reloadedConversation = conversationRepository.findById(savedConversation.getId()).get();
        return ResponseEntity.ok(mapToDto(reloadedConversation));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageDto>> getMessages(@PathVariable Long id) {
        User currentUser = getAuthenticatedUser();
        if (!isUserMemberOf(id, currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<MessageDto> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(id)
                .stream()
                .map(MessageDto::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(messages);
    }

    private ConversationDto mapToDto(Conversation c) {
        List<Message> msgs = messageRepository.findByConversationIdOrderByCreatedAtAsc(c.getId());
        String lastMsg = msgs.isEmpty() ? null : msgs.get(msgs.size() - 1).getContent();
        var lastTime = msgs.isEmpty() ? null : msgs.get(msgs.size() - 1).getCreatedAt();

        List<ConversationDto.MemberDto> memberDtos = memberRepository.findByConversationId(c.getId()).stream().map(m ->
                new ConversationDto.MemberDto(
                        m.getUser().getId(),
                        m.getUser().getDisplayName(),
                        m.getUser().getAvatarColor(),
                        m.getRole().name(),
                        m.getUser().getStatus().name()
                )
        ).collect(Collectors.toList());

        return new ConversationDto(
                c.getId(),
                c.getName(),
                c.getType().name(),
                lastMsg,
                lastTime,
                0,
                memberDtos
        );
    }

    public record DirectRequest(@NotNull Long targetUserId) {}
    
    public record GroupRequest(@NotBlank String name, @NotEmpty List<Long> memberIds) {}
}
