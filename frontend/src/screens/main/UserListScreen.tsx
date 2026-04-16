import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { THEME } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL, ENDPOINTS } from '../../constants/api';
import UserAvatar from '../../components/common/UserAvatar';
import { BackIcon } from '../../components/common/Icons';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import OnlineStatusDot from '../../components/common/OnlineStatusDot';

export default function UserListScreen() {
  const navigation = useNavigation<any>();
  const { token, user } = useContext(AuthContext);
  
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.USERS.LIST}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const otherUsers = response.data.filter((u: any) => u.id !== user?.id);
      setUsers(otherUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (targetUserId: number, targetName: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.CONVERSATIONS.DIRECT}`, 
        { targetUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigation.replace('Chat', { conversationId: response.data.id, conversationName: targetName });
    } catch (error) {
      console.error("Failed to start conversation", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => startConversation(item.id, item.displayName)}
    >
      <View style={styles.avatarWrapperContainer}>
        <UserAvatar displayName={item.displayName} avatarColor={item.avatarColor} size={48} />
        <View style={styles.statusDotWrapper}>
          <OnlineStatusDot status={item.status} size={10} />
        </View>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.displayName}>{item.displayName}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackIcon color={THEME.text.muted} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Start a Conversation</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by name or username..."
          placeholderTextColor={THEME.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={{ paddingTop: 20 }}><LoadingSkeleton rows={6} /></View>
      ) : filteredUsers.length === 0 ? (
        <EmptyState 
          title="No users found" 
          subtitle="Try a different search term" 
        />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text.heading,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: THEME.background.primary,
  },
  searchInput: {
    backgroundColor: THEME.background.surface,
    color: THEME.text.body,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: THEME.border.default,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2D3555',
  },
  avatarWrapperContainer: {
    marginRight: 16,
    position: 'relative',
  },
  statusDotWrapper: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: THEME.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background.primary,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    color: THEME.text.heading,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    color: THEME.text.muted,
    fontSize: 14,
  },
});
