import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

interface ReactiveMascotProps {
  mood: 'idle' | 'happy' | 'sad' | 'excited' | 'encouraging';
  size?: number;
}

export default function ReactiveMascot({ mood, size = 90 }: ReactiveMascotProps) {
  const bounce = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Stop any existing animation
    bounce.stopAnimation();
    rotate.stopAnimation();
    scale.stopAnimation();

    if (mood === 'idle') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounce, { toValue: -12, duration: 1000, useNativeDriver: true }),
          Animated.timing(bounce, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else if (mood === 'happy') {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scale, { toValue: 1.3, friction: 3, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.timing(rotate, { toValue: -1, duration: 200, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
    } else if (mood === 'excited') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounce, { toValue: -25, duration: 300, useNativeDriver: true }),
          Animated.timing(bounce, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ).start();
    } else if (mood === 'sad') {
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.85, duration: 200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    } else if (mood === 'encouraging') {
      // 🔥 NEW: gentle nod — not as big as happy, says "you got this!"
      Animated.sequence([
        Animated.timing(bounce, { toValue: -8, duration: 200, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: -8, duration: 200, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [mood]);

  const getEmoji = () => '🦉';

  const rotateInterpolated = rotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-20deg', '20deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: bounce },
            { scale },
            { rotate: rotateInterpolated },
          ],
        },
      ]}
      accessible={true}
      accessibilityLabel={`Mascot owl, ${mood} mood`}
    >
      <Text style={[styles.emoji, { fontSize: size }]}>{getEmoji()}</Text>
      {mood === 'sad' && <Text style={styles.overlay}>💭</Text>}
      {mood === 'excited' && <Text style={styles.overlay}>✨</Text>}
      {mood === 'encouraging' && <Text style={styles.overlay}>💪</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: -10,
    right: -20,
    fontSize: 30,
  },
});