package dev.pingme.repository;

import dev.pingme.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c JOIN c.members m WHERE m.user.id = :userId ORDER BY (SELECT MAX(msg.createdAt) FROM Message msg WHERE msg.conversation = c) DESC")
    List<Conversation> findConversationsByUserId(@Param("userId") Long userId);
}
