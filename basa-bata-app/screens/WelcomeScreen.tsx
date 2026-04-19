import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';

export default function WelcomeScreen({ langDict, onEnter }: any) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={onEnter}>
      <View style={styles.centerContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🌟</Text>
        </View>
        <Text style={styles.title}>{langDict.title}</Text>
        <Text style={styles.subtitle}>{langDict.subtitle}</Text>
      </View>
      
      <Animated.View style={[styles.bottomContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.tapText}>{langDict.tapToEnter}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  centerContent: { alignItems: 'center', marginBottom: 100 },
  iconContainer: { backgroundColor: '#FFFFFF', padding: 30, borderRadius: 100, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 10 },
  icon: { fontSize: 80 },
  title: { fontSize: 64, fontWeight: '900', color: '#FFFFFF', letterSpacing: 3, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10 },
  subtitle: { fontSize: 24, fontWeight: 'bold', color: '#BFDBFE', marginTop: 10 },
  bottomContainer: { position: 'absolute', bottom: 40, width: '90%', alignItems: 'center' }, // Pulled up and gave it width
  tapText: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', opacity: 0.9, letterSpacing: 1, textAlign: 'center' }, // Shrunk slightly and centered
});