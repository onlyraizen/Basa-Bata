import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';

interface ScrapbookCardProps {
  word: string;
  icon: string;
  onReplay: () => void;
  cardOpacity: Animated.Value;
  cardScale: Animated.Value;
}

export default function ScrapbookCard({ word, icon, onReplay, cardOpacity, cardScale }: ScrapbookCardProps) {
  return (
    <Animated.View style={[
      styles.scrapbookCard, 
      { opacity: cardOpacity, transform: [{ scale: cardScale }, { rotate: '-2deg' }] }
    ]}>
      <Text style={styles.iconText}>{icon}</Text>
      <Text style={styles.promptText}>{word.toUpperCase()}</Text>
      
      <TouchableOpacity style={styles.replayButton} onPress={onReplay}>
        <Text style={styles.replayButtonText}>🔊 Pakinggan</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrapbookCard: { backgroundColor: '#FFFFFF', width: '90%', paddingVertical: 25, borderRadius: 30, alignItems: 'center', borderWidth: 4, borderColor: '#B3D4FF', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  iconText: { fontSize: 65, marginBottom: 5 }, 
  promptText: { fontSize: 44, fontWeight: '900', color: '#334155', letterSpacing: 2 }, 
  replayButton: { marginTop: 15, backgroundColor: '#EFF6FF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 2, borderColor: '#BFDBFE' },
  replayButtonText: { fontSize: 16, fontWeight: 'bold', color: '#3B82F6' },
});