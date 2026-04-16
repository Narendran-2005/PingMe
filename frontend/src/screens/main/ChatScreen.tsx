import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { THEME } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL, ENDPOINTS } from '../../constants/api';
import MessageBubble from '../../components/chat/MessageBubble';
import MessageInput from '../../components/chat/MessageInput';
import TypingIndicator from '../../components/chat/TypingIndicator';
import { BackIcon } from '../../components/common/Icons';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { webSocketService, MessageDto, TypingResponse } from '../../services/webSocketService';

export default function ChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { conversationId, conversationName } = route.params;
  const { user, token } = useContext(AuthContext);

  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMessages();

    // Subscribe to WebSocket topics after a short delay to ensure WS is connected
    const subscribeTimeout = setTimeout(() => {
      webSocketService.subscribeToConversation(conversationId, handleIncomingMessage);
      webSocketService.subscribeToTyping(conversationId, handleTypingEvent);
    }, 1000);

    return () => {
      clearTimeout(subscribeTimeout);
      webSocketService.unsubscribeFromConversation(conversationId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sorted = response.data.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMessages(sorted);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncomingMessage = useCallback((msg: MessageDto) => {
    if (msg.senderId === user?.id) return; // Skip our own messages
    
    setMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev;
      return [msg, ...prev];
    });
  }, [user]);

  const handleTypingEvent = useCallback((event: TypingResponse) => {
    if (event.username === user?.username) return; // Skip own typing
    
    if (event.isTyping) {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    } else {
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  }, [user]);

  const handleSend = (content: string) => {
    // Optimistic UI update
    const newMessage: MessageDto = {
      id: Date.now(),
      conversationId,
      senderId: user?.id ?? 0,
      senderName: user?.displayName ?? '',
      senderAvatarColor: user?.avatarColor ?? '#1FD89C',
      content,
      status: 'SENT',
      createdAt: new Date().toISOString(),
    };
    
    setMessages(prev => [newMessage, ...prev]);
    webSocketService.sendMessage(conversationId, content);
    webSocketService.stopTyping(conversationId);
  };

  const handleTyping = () => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    
    webSocketService.sendTyping(conversationId);
    
    // Auto-stop typing after 2 seconds of silence
    debounceTimeoutRef.current = setTimeout(() => {
      webSocketService.stopTyping(conversationId);
    }, 2000);
  };

  const renderItem = ({ item, index }: { item: MessageDto, index: number }) => {
    const isOwn = item.senderId === user?.id;
    const olderMessage = messages[index + 1];
    const showAvatar = !olderMessage || olderMessage.senderId !== item.senderId;

    return (
      <MessageBubble
        message={item}
        isOwn={isOwn}
        showAvatar={showAvatar}
        index={index}
      />
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackIcon color={THEME.text.muted} size={22} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}># {conversationName}</Text>
        </View>
      </View>

      <View style={styles.chatArea}>
        {loading ? (
          <View style={{ flex: 1, paddingTop: 20 }}><LoadingSkeleton rows={4} /></View>
        ) : messages.length === 0 ? (
          <EmptyState 
            title="No messages yet" 
            subtitle="Send a message to start the conversation" 
            showIcon={false}
          />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            inverted
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
        <TypingIndicator isTyping={isTyping} />
      </View>

      <MessageInput 
        onSend={handleSend} 
        onTyping={handleTyping} 
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: THEME.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border.default,
  },
  backButton: {
    paddingRight: 16,
    paddingVertical: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text.heading,
  },
  chatArea: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: 16,
  },
});
