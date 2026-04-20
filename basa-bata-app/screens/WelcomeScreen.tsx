import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Floating background star component
function FloatingStar({
  emoji,
  size,
  top,
  left,
  duration,
  delay,
}: {
  emoji: string;
  size: number;
  top: number;
  left: number;
  duration: number;
  delay: number;
}) {
  const float = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in with delay
    Animated.timing(opacity, {
      toValue: 0.6,
      duration: 800,
      delay,
      useNativeDriver: true,
    }).start();

    // Endless floating
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -20,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Gentle rotation
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: duration * 3,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Text
      style={[
        styles.floatingStar,
        {
          top,
          left,
          fontSize: size,
          opacity,
          transform: [{ translateY: float }, { rotate: rotation }],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

export default function WelcomeScreen({ langDict, onEnter }: any) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mascotScale = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(50)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Tap-to-enter pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Mascot pop-in
    Animated.spring(mascotScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Title slide up + fade in
    Animated.parallel([
      Animated.timing(titleSlide, {
        toValue: 0,
        duration: 800,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow pulse behind mascot
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={onEnter}>
      {/* Decorative background circles (gradient-like effect) */}
      <View style={[styles.bgCircle, styles.bgCircle1]} />
      <View style={[styles.bgCircle, styles.bgCircle2]} />
      <View style={[styles.bgCircle, styles.bgCircle3]} />

      {/* Floating stars background */}
      <FloatingStar emoji="⭐" size={30} top={height * 0.1} left={width * 0.15} duration={2800} delay={0} />
      <FloatingStar emoji="✨" size={24} top={height * 0.15} left={width * 0.75} duration={3200} delay={300} />
      <FloatingStar emoji="⭐" size={22} top={height * 0.3} left={width * 0.05} duration={2500} delay={600} />
      <FloatingStar emoji="💫" size={28} top={height * 0.65} left={width * 0.85} duration={3500} delay={900} />
      <FloatingStar emoji="✨" size={26} top={height * 0.75} left={width * 0.1} duration={2700} delay={1200} />
      <FloatingStar emoji="⭐" size={20} top={height * 0.45} left={width * 0.9} duration={3000} delay={1500} />
      <FloatingStar emoji="🌟" size={32} top={height * 0.25} left={width * 0.45} duration={3400} delay={400} />

      {/* Main content */}
      <View style={styles.centerContent}>
        {/* Glow behind mascot */}
        <Animated.View style={[styles.glow, { opacity: glowAnim }]} />

        {/* Mascot + icon */}
        <Animated.View
          style={[
            styles.mascotContainer,
            { transform: [{ scale: mascotScale }] },
          ]}
        >
          <Text style={styles.owlEmoji}>🦉</Text>
          <View style={styles.iconCircle}>
            <Text style={styles.starIcon}>🌟</Text>
          </View>
        </Animated.View>

        {/* Title with slide-up animation */}
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleSlide }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.title}>{langDict.title}</Text>
          <Text style={styles.subtitle}>{langDict.subtitle}</Text>
        </Animated.View>
      </View>

      {/* Tap to enter */}
      <Animated.View style={[styles.bottomContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.tapBadge}>
          <Text style={styles.tapText}>👆 {langDict.tapToEnter}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  // Decorative background circles
  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  bgCircle1: {
    width: 400,
    height: 400,
    backgroundColor: '#60A5FA',
    top: -150,
    left: -100,
    opacity: 0.4,
  },
  bgCircle2: {
    width: 300,
    height: 300,
    backgroundColor: '#2563EB',
    bottom: -80,
    right: -80,
    opacity: 0.5,
  },
  bgCircle3: {
    width: 200,
    height: 200,
    backgroundColor: '#93C5FD',
    top: height * 0.4,
    right: -60,
    opacity: 0.3,
  },
  floatingStar: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    marginBottom: 80,
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#FBBF24',
    top: -40,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  owlEmoji: {
    fontSize: 120,
  },
  iconCircle: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 100,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#FDE68A',
  },
  starIcon: {
    fontSize: 50,
  },
  title: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#DBEAFE',
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 60,
    width: '90%',
    alignItems: 'center',
  },
  tapBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  tapText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
  },
});