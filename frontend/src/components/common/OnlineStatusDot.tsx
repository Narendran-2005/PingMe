import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface Props {
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  size?: number;
}

export default function OnlineStatusDot({ status, size = 10 }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'ONLINE') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      opacity.setValue(1);
    }
  }, [status]);

  const color = status === 'ONLINE' ? '#23A55A' : status === 'AWAY' ? '#F0B232' : '#4A7B6F';

  return (
    <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity }} />
  );
}
