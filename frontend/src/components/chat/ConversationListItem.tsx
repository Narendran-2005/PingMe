import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { THEME } from '../../theme/colors';
import UserAvatar from '../common/UserAvatar';
import { GroupIcon } from '../common/Icons';

interface ConversationDto {
  id: number;
  name: string | null;
  type: string;
  lastMessageContent: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
  members: any[];
}

interface ConversationListItemProps {
  conversation: ConversationDto;
  currentUserId: number | undefined;
  isActive: boolean;
  onPress: () => void;
}

const formatTime = (isoString: string | null) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const today = new Date();
  const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { weekday: 'short' });
};

export default function ConversationListItem({ conversation, currentUserId, isActive, onPress }: ConversationListItemProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, damping: 12, stiffness: 300, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1.0, damping: 12, stiffness: 300, useNativeDriver: true }).start();
    onPress();
  };

  let name = conversation.name || 'Group Chat';
  let avatarColor = THEME.accent.secondary;
  let isDirect = conversation.type === 'DIRECT';
  let status = 'OFFLINE';

  if (isDirect) {
    const otherMember = conversation.members?.find(m => m.userId !== currentUserId);
    if (otherMember) {
      name = otherMember.displayName;
      avatarColor = otherMember.avatarColor;
      status = otherMember.status;
    } else {
      name = 'Unknown';
    }
  }

  const preview = conversation.lastMessageContent
    ? (conversation.lastMessageContent.length > 35 ? conversation.lastMessageContent.substring(0, 35) + '...' : conversation.lastMessageContent)
    : 'No messages yet';

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.container, isActive && styles.activeContainer, { transform: [{ scale }] }]}>
        <View style={styles.avatarWrapper}>
          {isDirect ? (
            <UserAvatar displayName={name} avatarColor={avatarColor} size={48} />
          ) : (
            <View style={[styles.groupAvatar, { backgroundColor: THEME.background.primary }]}>
              <GroupIcon color={THEME.text.muted} size={28} />
            </View>
          )}
          {isDirect && (
            <View style={[
              styles.statusDot,
              { backgroundColor: status === 'ONLINE' ? THEME.status.online : status === 'AWAY' ? THEME.status.away : THEME.status.offline },
              isActive && { borderColor: THEME.background.surface }
            ]} />
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            <Text style={styles.nameText} numberOfLines={1}>{name}</Text>
            {conversation.lastMessageTime && (
              <Text style={styles.timeText}>{formatTime(conversation.lastMessageTime)}</Text>
            )}
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.previewText} numberOfLines={1}>{preview}</Text>
            {conversation.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8, marginVertical: 2, backgroundColor: 'transparent' },
  activeContainer: { backgroundColor: THEME.background.surface },
  avatarWrapper: { marginRight: 14, position: 'relative' },
  groupAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  statusDot: { position: 'absolute', right: -2, bottom: -2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: THEME.background.sidebar },
  contentContainer: { flex: 1, justifyContent: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  nameText: { fontSize: 16, fontWeight: '600', color: THEME.text.heading, flex: 1, paddingRight: 8 },
  timeText: { fontSize: 12, color: THEME.text.muted },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewText: { fontSize: 14, color: THEME.text.muted, flex: 1, paddingRight: 8 },
  unreadBadge: { backgroundColor: THEME.accent.primary, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadText: { fontSize: 12, fontWeight: 'bold', color: '#0D1117' },
});
