import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { THEME } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL, ENDPOINTS } from '../../constants/api';
import UserAvatar from '../../components/common/UserAvatar';
import { BackIcon, CheckIcon } from '../../components/common/Icons';

export default function CreateGroupScreen() {
  const navigation = useNavigation<any>();
  const { token, user } = useContext(AuthContext);
  
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.USERS.LIST}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter out current user from the list
      const otherUsers = response.data.filter((u: any) => u.id !== user?.id);
      setUsers(otherUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedIds.size === 0 || !token) return;
    
    setIsCreating(true);
    try {
      const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.CONVERSATIONS.GROUP}`, 
        { 
          name: groupName.trim(),
          memberIds: Array.from(selectedIds)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Navigate to Chat screen replacing current screen
      navigation.replace('Chat', { 
        conversationId: response.data.id, 
        conversationName: response.data.name 
      });
    } catch (error) {
      console.error("Failed to create group", error);
      setIsCreating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUsersList = users.filter(u => selectedIds.has(u.id));

  // Animated selected chip component
  const SelectedUserChip = ({ u }: { u: any }) => {
    const scale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(scale, { toValue: 1, damping: 12, useNativeDriver: true }).start();
    }, []);

    return (
      <Animated.View style={[styles.chipContainer, { transform: [{ scale }] }]}>
        <UserAvatar displayName={u.displayName} avatarColor={u.avatarColor} size={32} />
        <TouchableOpacity style={styles.chipCloseBtn} onPress={() => toggleSelection(u.id)}>
          <Text style={styles.chipCloseText}>×</Text>
        </TouchableOpacity>
        <Text style={styles.chipText} numberOfLines={1}>{u.displayName.split(' ')[0]}</Text>
      </Animated.View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedIds.has(item.id);
    return (
      <TouchableOpacity 
        style={styles.userRow}
        onPress={() => toggleSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarWrapperContainer}>
          <UserAvatar displayName={item.displayName} avatarColor={item.avatarColor} size={40} />
          <View style={[
            styles.statusDot, 
            { backgroundColor: item.status === 'ONLINE' ? THEME.status.online : item.status === 'AWAY' ? THEME.status.away : THEME.status.offline }
          ]} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.displayName}>{item.displayName}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <CheckIcon color="#0D1117" size={12} />}
        </View>
      </TouchableOpacity>
    );
  };

  const isFormValid = groupName.trim().length > 0 && selectedIds.size > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackIcon color={THEME.text.muted} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Group</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput 
          style={styles.nameInput}
          placeholder="Group Name"
          placeholderTextColor={THEME.text.muted}
          value={groupName}
          onChangeText={setGroupName}
          maxLength={50}
        />
      </View>

      {selectedUsersList.length > 0 && (
        <View style={styles.selectedContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedScroll}>
            {selectedUsersList.map(u => (
              <SelectedUserChip key={`sel-${u.id}`} u={u} />
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={styles.sectionLabel}>ADD MEMBERS</Text>
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor={THEME.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={THEME.accent.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.createBtn, !isFormValid && styles.createBtnDisabled]}
          onPress={createGroup}
          disabled={!isFormValid || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="#0D1117" />
          ) : (
            <Text style={styles.createBtnText}>Create Group</Text>
          )}
        </TouchableOpacity>
      </View>
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
  formContainer: {
    padding: 16,
  },
  nameInput: {
    backgroundColor: THEME.background.surface,
    color: THEME.text.heading,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: THEME.border.default,
  },
  selectedContainer: {
    paddingBottom: 16,
  },
  selectedScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  chipContainer: {
    alignItems: 'center',
    width: 60,
  },
  chipCloseBtn: {
    position: 'absolute',
    top: 0,
    right: 8,
    backgroundColor: THEME.background.surface,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border.default,
  },
  chipCloseText: {
    color: THEME.text.muted,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -2,
  },
  chipText: {
    color: THEME.text.body,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionLabel: {
    color: THEME.text.muted,
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: THEME.background.surface,
    color: THEME.text.body,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
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
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border.default,
  },
  avatarWrapperContainer: {
    marginRight: 12,
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: THEME.background.primary,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    color: THEME.text.heading,
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    color: THEME.text.muted,
    fontSize: 13,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.text.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: THEME.accent.primary,
    borderColor: THEME.accent.primary,
  },
  footer: {
    padding: 16,
    backgroundColor: THEME.background.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.border.default,
  },
  createBtn: {
    backgroundColor: THEME.accent.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  createBtnDisabled: {
    backgroundColor: '#38BFA055', // Faded accent
  },
  createBtnText: {
    color: '#0D1117',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
