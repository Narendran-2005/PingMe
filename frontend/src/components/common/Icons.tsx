import React from 'react';
import { View, StyleSheet } from 'react-native';

export interface IconProps {
  color?: string;
  size?: number;
}

export const SendIcon = ({ color = '#0D1117', size = 16 }: IconProps) => (
  <View
    style={{
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderTopWidth: size * 0.4,
      borderTopColor: 'transparent',
      borderBottomWidth: size * 0.4,
      borderBottomColor: 'transparent',
      borderLeftWidth: size * 0.6,
      borderLeftColor: color,
    }}
  />
);

export const BackIcon = ({ color = '#C8E6E0', size = 20 }: IconProps) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{
      width: size * 0.5,
      height: 2,
      backgroundColor: color,
      transform: [{ rotate: '-45deg' }, { translateX: -size * 0.15 }, { translateY: size * 0.15 }]
    }} />
    <View style={{
      width: size * 0.5,
      height: 2,
      backgroundColor: color,
      transform: [{ rotate: '45deg' }, { translateX: -size * 0.15 }, { translateY: -size * 0.15 }]
    }} />
  </View>
);

export const MenuIcon = ({ color = '#C8E6E0', size = 20 }: IconProps) => (
  <View style={{ width: size, paddingVertical: size * 0.15, height: size, justifyContent: 'space-between' }}>
    <View style={{ width: '100%', height: 2, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: '90%', height: 2, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: '100%', height: 2, backgroundColor: color, borderRadius: 1 }} />
  </View>
);

export const AddIcon = ({ color = '#C8E6E0', size = 20 }: IconProps) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ position: 'absolute', width: '100%', height: 2, backgroundColor: color }} />
    <View style={{ position: 'absolute', width: 2, height: '100%', backgroundColor: color }} />
  </View>
);

export const GroupIcon = ({ color = '#C8E6E0', size = 20 }: IconProps) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{
      position: 'absolute',
      left: size * 0.25,
      width: size * 0.55,
      height: size * 0.55,
      borderRadius: size * 0.275,
      backgroundColor: color,
      opacity: 0.7,
    }} />
    <View style={{
      width: size * 0.55,
      height: size * 0.55,
      borderRadius: size * 0.275,
      backgroundColor: color,
    }} />
  </View>
);

export const CheckIcon = ({ color = '#1FD89C', size = 20 }: IconProps) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{
      width: size * 0.3,
      height: 2,
      backgroundColor: color,
      transform: [{ rotate: '45deg' }, { translateX: -size * 0.1 }, { translateY: size * 0.25 }]
    }} />
    <View style={{
      width: size * 0.6,
      height: 2,
      backgroundColor: color,
      transform: [{ rotate: '-45deg' }, { translateX: 0 }, { translateY: size * 0.1 }]
    }} />
  </View>
);
