import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { THEME } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL, ENDPOINTS } from '../../constants/api';
import { BackIcon, CheckIcon } from '../../components/common/Icons';

const AVATAR_COLORS = ['#1FD89C', '#38BFA0', '#67C9E0', '#9B59B6', '#2E86AB', '#E74C3C'];
const STATUS_OPTIONS = ['ONLINE', 'AWAY', 'OFFLINE'] as const;

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, token, login, logout } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || AVATAR_COLORS[0]);
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]>((user?.status as typeof STATUS_OPTIONS[number]) || 'ONLINE');
  const [isSaving, setIsSaving] = useState(false);

  const avatarScale = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const bounceAvatar = () => {
    Animated.sequence([
      Animated.spring(avatarScale, { toValue: 1.1, damping: 10, stiffness: 400, useNativeDriver: true }),
      Animated.spring(avatarScale, { toValue: 1, damping: 10, stiffness: 400, useNativeDriver: true }),
    ]).start();
  };

  const handleSave = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}${ENDPOINTS.USERS.PROFILE}`,
        { displayName, avatarColor, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      login(token, response.data);

      Animated.sequence([
        Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(successOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } catch (e) {
      console.error("Failed to update profile", e);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (s: string) => {
    if (s === 'ONLINE') return THEME.status.online;
    if (s === 'AWAY') return THEME.status.away;
    return THEME.status.offline;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackIcon color={THEME.text.muted} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 22, marginRight: 16 }} />
      </View>

      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.avatarSection}>
          <Animated.View style={[styles.avatarCircle, { backgroundColor: avatarColor, transform: [{ scale: avatarScale }] }]}>
            <Text style={styles.avatarInitial}>
              {displayName.charAt(0).toUpperCase() || '?'}
            </Text>
          </Animated.View>

          {isEditingName ? (
            <TextInput
              style={styles.nameInput}
              value={displayName}
              onChangeText={setDisplayName}
              autoFocus
              onBlur={() => setIsEditingName(false)}
              onSubmitEditing={() => setIsEditingName(false)}
            />
          ) : (
            <TouchableOpacity onPress={() => setIsEditingName(true)}>
              <Text style={styles.nameText}>{displayName}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.usernameText}>@{user?.username}</Text>
        </View>

        <View style={styles.statusSection}>
          {STATUS_OPTIONS.map(opt => {
            const isSelected = status === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => setStatus(opt)}
                style={[styles.statusPill, isSelected && styles.statusPillSelected, isSelected && { borderColor: getStatusColor(opt) }]}
              >
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(opt) }]} />
                <Text style={[styles.statusText, isSelected && styles.statusTextSelected]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.colorSection}>
          <Text style={styles.sectionLabel}>AVATAR COLOUR</Text>
          <View style={styles.swatchRow}>
            {AVATAR_COLORS.map(color => {
              const isSelected = avatarColor === color;
              return (
                <TouchableOpacity
                  key={color}
                  onPress={() => { setAvatarColor(color); bounceAvatar(); }}
                  style={[styles.swatch, { backgroundColor: color }, isSelected && styles.swatchSelected]}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color="#0D1117" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>

          <Animated.View style={[styles.successRow, { opacity: successOpacity }]}>
            <View style={styles.successCircle}>
              <CheckIcon color="#0D1117" size={12} />
            </View>
            <Text style={styles.successText}>Profile updated!</Text>
          </Animated.View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: THEME.background.surface, borderBottomWidth: 1, borderBottomColor: THEME.border.default },
  backButton: { paddingRight: 16, paddingVertical: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text.heading },
  content: { flex: 1, padding: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 40, marginTop: 16 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarInitial: { color: '#0D1117', fontSize: 36, fontWeight: 'bold' },
  nameInput: { fontSize: 22, fontWeight: 'bold', color: THEME.text.heading, borderBottomWidth: 1, borderBottomColor: THEME.accent.primary, paddingVertical: 4, minWidth: 150, textAlign: 'center', marginBottom: 4 },
  nameText: { fontSize: 22, fontWeight: 'bold', color: THEME.text.heading, marginBottom: 4 },
  usernameText: { fontSize: 14, color: THEME.text.muted },
  statusSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: THEME.background.surface, borderWidth: 1, borderColor: 'transparent' },
  statusPillSelected: { backgroundColor: '#263440' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusText: { fontSize: 12, color: THEME.text.muted, fontWeight: '600' },
  statusTextSelected: { color: THEME.text.heading },
  colorSection: { marginBottom: 40 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: THEME.text.muted, marginBottom: 16 },
  swatchRow: { flexDirection: 'row', justifyContent: 'space-between' },
  swatch: { width: 40, height: 40, borderRadius: 20 },
  swatchSelected: { borderWidth: 3, borderColor: '#FFFFFF' },
  actionSection: { alignItems: 'center' },
  saveBtn: { width: '100%', backgroundColor: THEME.accent.primary, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  saveBtnText: { color: '#0D1117', fontSize: 16, fontWeight: 'bold' },
  logoutBtn: { width: '100%', backgroundColor: 'transparent', paddingVertical: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E74C3C', marginTop: 12 },
  logoutBtnText: { color: '#E74C3C', fontSize: 16, fontWeight: 'bold' },
  successRow: { flexDirection: 'row', alignItems: 'center' },
  successCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: THEME.accent.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  successText: { color: THEME.text.heading, fontSize: 14, fontWeight: '500' },
});
