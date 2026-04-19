import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Dimensions } from 'react-native';

interface FlyingStarProps {
  onComplete: () => void;
}

const { width } = Dimensions.get('window');

export default function FlyingStar({ onComplete }: FlyingStarProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Pop in at center
      Animated.spring(scale, { toValue: 1.5, friction: 4, useNativeDriver: true }),
      // Fly to top-right corner (score position)
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: width / 2 - 40,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -280,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.5,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onComplete());
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        { opacity, transform: [{ translateX }, { translateY }, { scale }] },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.starText}>⭐</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    zIndex: 1000,
  },
  starText: {
    fontSize: 60,
  },
});