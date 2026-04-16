import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface Props {
  rows?: number;
  rowHeight?: number;
}

export default function LoadingSkeleton({ rows = 3, rowHeight = 56 }: Props) {
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const rowsArray = Array.from({ length: rows });

  return (
    <View style={styles.container}>
      {rowsArray.map((_, index) => (
        <Animated.View key={index} style={[styles.row, { height: rowHeight, opacity }]}>
          <View style={styles.circle} />
          <View style={styles.lineContainer}>
            <View style={styles.wideLine} />
            <View style={styles.narrowLine} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 16, paddingTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  circle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1C2730', marginRight: 16 },
  lineContainer: { flex: 1, justifyContent: 'center' },
  wideLine: { width: '70%', height: 12, backgroundColor: '#1C2730', borderRadius: 6, marginBottom: 10 },
  narrowLine: { width: '40%', height: 12, backgroundColor: '#1C2730', borderRadius: 6 },
});
