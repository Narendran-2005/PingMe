import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface UserAvatarProps {
  displayName: string;
  avatarColor: string;
  size?: number;
}

export default function UserAvatar({ displayName, avatarColor, size = 36 }: UserAvatarProps) {
  const firstLetter = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: avatarColor,
          width: size,
          height: size,
          borderRadius: size / 2,
        }
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.45 }]}>{firstLetter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#0D1117',
    fontWeight: 'bold',
  },
});
