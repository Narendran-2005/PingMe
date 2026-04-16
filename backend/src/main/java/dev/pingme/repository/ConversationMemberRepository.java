package dev.pingme.repository;

import dev.pingme.entity.Conversation;
import dev.pingme.entity.ConversationMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationMemberRepository extends JpaRepository<ConversationMember, Long> {
    
    Optional<ConversationMember> findByConversationIdAndUserId(Long convId, Long userId);
    
    List<ConversationMember> findByConversationId(Long convId);
    
    boolean existsByConversationIdAndUserId(Long convId, Long userId);

    @Query("SELECT cm1.conversation FROM ConversationMember cm1 " +
           "JOIN ConversationMember cm2 ON cm1.conversation = cm2.conversation " +
           "WHERE cm1.user.id = :userId1 AND cm2.user.id = :userId2 AND cm1.conversation.type = 'DIRECT'")
    Optional<Conversation> findDirectConversation(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
