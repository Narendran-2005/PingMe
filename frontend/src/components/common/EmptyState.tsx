import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  subtitle: string;
  showIcon?: boolean;
}

export default function EmptyState({ title, subtitle, showIcon = true }: Props) {
  return (
    <View style={styles.container}>
      {showIcon && (
        <View style={styles.iconContainer}>
          <View style={styles.bubbleMain} />
          <View style={styles.bubbleTail} />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    marginBottom: 16,
    position: 'relative',
  },
  bubbleMain: {
    width: 44,
    height: 36,
    backgroundColor: '#4A7B6F',
    borderRadius: 8,
    position: 'absolute',
    top: 4,
    left: 2,
  },
  bubbleTail: {
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderTopColor: '#4A7B6F',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 10,
    transform: [{ rotate: '15deg' }]
  },
  title: {
    color: '#C8E6E0',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#4A7B6F',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 240,
  }
});
