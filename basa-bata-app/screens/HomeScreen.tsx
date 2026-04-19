import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface HomeScreenProps {
  onStart: () => void;
}

export default function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.homeCenter}>
        <View style={styles.logoCard}>
          <Text style={styles.logoIcon}>📖</Text>
          <Text style={styles.logoTitle}>Basa-Bata</Text>
          <Text style={styles.logoSubtitle}>Matutong Magbasa!</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onStart}>
        <Text style={styles.primaryButtonText}>Magsimula ➔</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F0FF', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, justifyContent: 'space-between' },
  homeCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoCard: { backgroundColor: '#FFFFFF', width: '100%', paddingVertical: 60, borderRadius: 40, alignItems: 'center', borderWidth: 5, borderColor: '#B3D4FF', transform: [{ rotate: '2deg' }], shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
  logoIcon: { fontSize: 100, marginBottom: 10 },
  logoTitle: { fontSize: 60, fontWeight: '900', color: '#3B82F6', letterSpacing: 2, textAlign: 'center' },
  logoSubtitle: { fontSize: 24, fontWeight: 'bold', color: '#64748B', marginTop: 10 },
  primaryButton: { backgroundColor: '#22C55E', width: '100%', paddingVertical: 24, borderRadius: 100, borderBottomWidth: 8, borderBottomColor: '#16A34A', alignItems: 'center', marginBottom: 20 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', letterSpacing: 2 },
});