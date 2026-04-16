import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  status: 'SENT' | 'DELIVERED' | 'READ';
}

export default function MessageStatusIcon({ status }: Props) {
  const color = status === 'READ' ? '#1FD89C' : '#4A7B6F';

  const Tick = () => (
    <View style={styles.tickWrapper}>
      <View style={[styles.tickShort, { backgroundColor: color }]} />
      <View style={[styles.tickLong, { backgroundColor: color }]} />
    </View>
  );

  return (
    <View style={styles.container}>
      {status === 'SENT' ? (
        <View style={styles.singleCenter}><Tick /></View>
      ) : (
        <View style={styles.doubleWrapper}>
          <View style={styles.leftTick}><Tick /></View>
          <View style={styles.rightTick}><Tick /></View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 16,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  tickWrapper: {
    width: 8,
    height: 10,
    position: 'relative',
    transform: [{ rotate: '45deg' }],
  },
  tickShort: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 4,
    height: 1.5,
  },
  tickLong: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    width: 1.5,
    height: 8,
  },
  singleCenter: {
    position: 'absolute',
    left: 4,
    top: 2,
  },
  doubleWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  leftTick: {
    position: 'absolute',
    left: 0,
    top: 2,
  },
  rightTick: {
    position: 'absolute',
    left: 6,
    top: 2,
  }
});
