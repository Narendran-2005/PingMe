import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../theme/colors';
import { SendIcon } from '../common/Icons';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  onTyping?: () => void;
}

export default function MessageInput({ onSend, disabled, onTyping }: MessageInputProps) {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.85, damping: 10, stiffness: 400, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1.0, damping: 10, stiffness: 400, useNativeDriver: true }).start();
  };

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <TextInput
        style={styles.input}
        placeholder="Message..."
        placeholderTextColor={THEME.text.muted}
        value={text}
        onChangeText={(val) => { setText(val); onTyping?.(); }}
        multiline
        maxLength={2000}
      />
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleSend}
        disabled={disabled || text.trim().length === 0}
        style={styles.buttonContainer}
      >
        <Animated.View style={[styles.button, { transform: [{ scale }], opacity: (!text.trim() || disabled) ? 0.5 : 1 }]}>
          <SendIcon color="#0D1117" size={16} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: THEME.background.surface, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: THEME.border.default },
  input: { flex: 1, backgroundColor: THEME.background.primary, color: THEME.text.body, borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, minHeight: 40, maxHeight: 120, marginRight: 12 },
  buttonContainer: { justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  button: { backgroundColor: THEME.accent.primary, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
});
