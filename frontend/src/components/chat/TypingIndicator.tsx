import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { THEME } from '../../theme/colors';

interface TypingIndicatorProps {
  isTyping: boolean;
}

export default function TypingIndicator({ isTyping }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  );
}

const Dot = ({ delay }: { delay: number }) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(translateY, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    };
    startAnimation();
  }, []);

  return <Animated.View style={[styles.dot, { transform: [{ translateY }] }]} />;
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 8, alignItems: 'flex-start' },
  bubble: { flexDirection: 'row', backgroundColor: THEME.background.surface, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: THEME.accent.secondary, marginHorizontal: 2 },
});
