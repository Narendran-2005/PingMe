import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { THEME } from '../../theme/colors';
import UserAvatar from '../common/UserAvatar';
import MessageStatusIcon from './MessageStatusIcon';

interface MessageDto {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatarColor: string;
  content: string;
  status: string;
  createdAt: string;
  signatureVerified?: boolean;
}

interface MessageBubbleProps {
  message: MessageDto;
  isOwn: boolean;
  showAvatar: boolean;
  index: number;
}

export default function MessageBubble({ message, isOwn, showAvatar, index }: MessageBubbleProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  const PQShield = () => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 6,
    }}>
      <View style={{
        width: 10,
        height: 12,
        backgroundColor: '#1FD89C',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          width: 5,
          height: 1.5,
          backgroundColor: '#0D1117',
          position: 'absolute',
          bottom: 3,
          left: 1,
          transform: [{ rotate: '45deg' }],
        }} />
        <View style={{
          width: 1.5,
          height: 4,
          backgroundColor: '#0D1117',
          position: 'absolute',
          bottom: 3,
          right: 2,
          transform: [{ rotate: '45deg' }],
        }} />
      </View>
      <Text style={{
        fontSize: 9,
        color: '#1FD89C',
        fontWeight: '600',
        marginLeft: 3,
      }}>PQ</Text>
    </View>
  );

  useEffect(() => {
    const delay = Math.min(index * 30, 300);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 200,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const timeString = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return `Today ${timeString}`;
    }

    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return `Yesterday ${timeString}`;
    }

    return `${date.toLocaleDateString([], { weekday: 'short' })} ${timeString}`;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isOwn ? styles.containerOwn : styles.containerOther,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {!isOwn && showAvatar && (
        <View style={styles.avatarContainer}>
          <UserAvatar
            displayName={message.senderName}
            avatarColor={message.senderAvatarColor}
            size={36}
          />
        </View>
      )}
      {!isOwn && !showAvatar && <View style={styles.avatarSpacer} />}

      <View style={[styles.messageWrapper, isOwn ? styles.messageWrapperOwn : styles.messageWrapperOther]}>
        {!isOwn && showAvatar && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}

        <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
          <Text style={[styles.content, isOwn ? styles.contentOwn : styles.contentOther]}>
            {message.content}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text style={[styles.timestamp, isOwn ? styles.timestampOwn : styles.timestampOther]}>
            {formatTime(message.createdAt)}
          </Text>
          {isOwn && message.signatureVerified && <PQShield />}
          {isOwn && <MessageStatusIcon status={message.status as any} />}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    justifyContent: 'flex-end',
    paddingBottom: 22,
  },
  avatarSpacer: {
    width: 36,
    marginRight: 8,
  },
  messageWrapper: {
    maxWidth: '75%',
  },
  messageWrapperOwn: {
    alignItems: 'flex-end',
  },
  messageWrapperOther: {
    alignItems: 'flex-start',
  },
  senderName: {
    color: THEME.accent.cyan,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleOwn: {
    backgroundColor: THEME.accent.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: THEME.background.surface,
    borderBottomLeftRadius: 4,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  contentOwn: {
    color: '#0D1117',
  },
  contentOther: {
    color: THEME.text.body,
  },
  timestamp: {
    fontSize: 10,
    color: THEME.text.muted,
  },
  timestampOwn: {
    marginRight: 4,
  },
  timestampOther: {
    marginLeft: 4,
  },
});
