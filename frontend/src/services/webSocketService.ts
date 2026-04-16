import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from '../constants/api';

export interface MessageDto {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatarColor: string;
  content: string;
  status: string;
  createdAt: string;
  signatureVerified: boolean;
}

export const webSocketService = {
  client: null as Client | null,
  isConnected: false,
  subscriptions: new Map<string, StompSubscription>(),

  connect(token: string, onConnect?: () => void, onError?: (err: any) => void) {
    if (this.client && this.isConnected) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      connectHeaders: {
        token: token,
      },
      debug: (str) => {
        console.log('[STOMP]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.isConnected = true;
        onConnect?.();
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        onError?.(frame);
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        this.isConnected = false;
        onError?.(event);
      },
      onWebSocketClose: () => {
        this.isConnected = false;
      }
    });

    this.client.activate();
  },

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  },

  subscribeToConversation(conversationId: number, onMessage: (msg: MessageDto) => void) {
    if (!this.client || !this.isConnected) return;

    const subscriptionKey = `conv_${conversationId}`;
    if (this.subscriptions.has(subscriptionKey)) return;

    const subscription = this.client.subscribe(
      `/topic/conversation.${conversationId}`,
      (message) => {
        if (message.body) {
          onMessage(JSON.parse(message.body));
        }
      }
    );
    this.subscriptions.set(subscriptionKey, subscription);
  },

  subscribeToTyping(conversationId: number, onTyping: (data: { username: string, isTyping: boolean }) => void) {
    if (!this.client || !this.isConnected) return;

    const subscriptionKey = `typing_${conversationId}`;
    if (this.subscriptions.has(subscriptionKey)) return;

    const subscription = this.client.subscribe(
      `/topic/conversation.${conversationId}.typing`,
      (message) => {
        if (message.body) {
          const data = JSON.parse(message.body);
          onTyping(data);
        }
      }
    );
    this.subscriptions.set(subscriptionKey, subscription);
  },

  unsubscribeFromConversation(conversationId: number) {
    const chatKey = `conv_${conversationId}`;
    const typingKey = `typing_${conversationId}`;

    if (this.subscriptions.has(chatKey)) {
      this.subscriptions.get(chatKey)!.unsubscribe();
      this.subscriptions.delete(chatKey);
    }
    
    if (this.subscriptions.has(typingKey)) {
      this.subscriptions.get(typingKey)!.unsubscribe();
      this.subscriptions.delete(typingKey);
    }
  },

  sendMessage(conversationId: number, content: string): void {
    if (!this.client || !this.isConnected) return;
    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ conversationId, content })
    });
  },

  sendTyping(conversationId: number) {
    if (!this.client || !this.isConnected) return;
    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({ conversationId })
    });
  },

  stopTyping(conversationId: number) {
    if (!this.client || !this.isConnected) return;
    this.client.publish({
      destination: '/app/chat.stopTyping',
      body: JSON.stringify({ conversationId })
    });
  }
};
