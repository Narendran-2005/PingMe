import React, { useState, useRef, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, ScrollView, Animated, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { PanGestureHandler, State, HandlerStateChangeEvent, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import axios from 'axios';
import { THEME } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL, ENDPOINTS } from '../../constants/api';
import UserAvatar from '../../components/common/UserAvatar';
import { MenuIcon, AddIcon } from '../../components/common/Icons';
import ConversationListItem from '../../components/chat/ConversationListItem';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = 280;

interface ConversationDto {
  id: number;
  name: string | null;
  type: string;
  lastMessageContent: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
  members: any[];
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, token, logout } = useContext(AuthContext);
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const fetchConversations = async () => {
    try {
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.CONVERSATIONS.LIST}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
    } catch (error) {
      console.error("Failed to load conversations", error);
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
    Animated.parallel([
      Animated.spring(translateX, { toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(translateX, { toValue: -DRAWER_WIDTH, damping: 20, stiffness: 200, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setIsDrawerOpen(false));
  };

  const onHandlerStateChange = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationX > 50) {
        openDrawer();
      } else if (event.nativeEvent.translationX < -50) {
        closeDrawer();
      }
    }
  };

  const handleConversationPress = (conv: ConversationDto) => {
    setActiveConversationId(conv.id);
    closeDrawer();

    let convName = conv.name || 'Group Chat';
    if (conv.type === 'DIRECT') {
      const otherMember = conv.members?.find(m => m.userId !== user?.id) || conv.members?.find(m => m.user?.id !== user?.id);
      if (otherMember) {
        convName = otherMember.displayName || otherMember.user?.displayName;
      }
    }

    navigation.navigate('Chat', { conversationId: conv.id, conversationName: convName });
  };

  const directConvs = conversations.filter(c => c.type === 'DIRECT');
  const groupConvs = conversations.filter(c => c.type === 'GROUP');

  return (
    <View style={styles.container}>
      <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
        <Animated.View style={styles.mainContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={openDrawer} style={{ padding: 8 }}>
              <MenuIcon color={THEME.text.heading} size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>PingMe</Text>
            <TouchableOpacity onPress={() => navigation.navigate('UserList')} style={{ padding: 8 }}>
              <AddIcon color={THEME.text.heading} size={22} />
            </TouchableOpacity>
          </View>

          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Swipe right to view your messages</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>

      {isDrawerOpen && (
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>PingMe</Text>
        </View>

        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : conversations.length === 0 ? (
          <EmptyState title="No conversations yet" subtitle="Tap + to start a message" />
        ) : (
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>DIRECT MESSAGES</Text>
              <TouchableOpacity onPress={() => navigation.navigate('UserList')} style={styles.addBtnContainer}>
                <Text style={styles.addBtnIcon}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.convList}>
              {directConvs.map(conv => (
                <ConversationListItem
                  key={conv.id}
                  conversation={conv}
                  currentUserId={user?.id}
                  isActive={activeConversationId === conv.id}
                  onPress={() => handleConversationPress(conv)}
                />
              ))}
              {directConvs.length === 0 && (
                <Text style={styles.noConvsText}>No direct messages yet</Text>
              )}
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>GROUPS</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CreateGroup')} style={styles.addBtnContainer}>
                <Text style={styles.addBtnIcon}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.convList}>
              {groupConvs.map(conv => (
                <ConversationListItem
                  key={conv.id}
                  conversation={conv}
                  currentUserId={user?.id}
                  isActive={activeConversationId === conv.id}
                  onPress={() => handleConversationPress(conv)}
                />
              ))}
              {groupConvs.length === 0 && (
                <Text style={styles.noConvsText}>No groups yet</Text>
              )}
            </View>
          </ScrollView>
        )}

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {user && (
            <TouchableOpacity style={styles.currentUserInfo} onPress={() => navigation.navigate('Profile')}>
              <View style={styles.avatarWrapperContainer}>
                <UserAvatar displayName={user.displayName} avatarColor={user.avatarColor} size={36} />
                <View style={[styles.statusDot, styles.bottomStatusDot, { backgroundColor: THEME.status.online }]} />
              </View>
              <Text style={styles.currentUserName}>{user.displayName}</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background.primary },
  mainContent: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 8, paddingBottom: 16, backgroundColor: THEME.background.surface, borderBottomWidth: 1, borderBottomColor: THEME.border.default },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text.heading },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyStateText: { color: THEME.text.muted, fontSize: 16 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', zIndex: 1 },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: DRAWER_WIDTH, backgroundColor: THEME.background.sidebar, zIndex: 2, elevation: 5 },
  drawerHeader: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: THEME.border.default },
  drawerTitle: { color: THEME.text.heading, fontSize: 22, fontWeight: 'bold' },
  scrollContainer: { flex: 1 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 24, marginBottom: 8 },
  sectionHeader: { color: THEME.text.muted, fontSize: 12, fontWeight: '600' },
  addBtnContainer: { paddingHorizontal: 8, paddingVertical: 2 },
  addBtnIcon: { color: THEME.text.heading, fontSize: 18, fontWeight: '300', marginTop: -2 },
  convList: { paddingHorizontal: 8 },
  noConvsText: { color: THEME.text.muted, fontSize: 13, paddingHorizontal: 12, paddingVertical: 8, fontStyle: 'italic' },
  avatarWrapperContainer: { marginRight: 12, position: 'relative' },
  statusDot: { position: 'absolute', right: -2, bottom: -2, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: THEME.background.sidebar },
  bottomStatusDot: { borderColor: THEME.background.surface },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: THEME.background.surface, borderTopWidth: 1, borderTopColor: THEME.border.default },
  currentUserInfo: { flexDirection: 'row', alignItems: 'center' },
  currentUserName: { color: THEME.text.heading, fontSize: 14, fontWeight: 'bold' },
  logoutText: { color: THEME.error, fontSize: 12, fontWeight: 'bold' },
});
