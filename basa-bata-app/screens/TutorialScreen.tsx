import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function TutorialScreen({ langDict, onBack }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{langDict.tutorial}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.stepText}>👆 {langDict.tutStep1}</Text>
        <Text style={styles.stepText}>🎤 {langDict.tutStep2}</Text>
        <Text style={styles.stepText}>⭐ {langDict.tutStep3}</Text>
      </View>

      <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
        <Text style={styles.secondaryButtonText}>{langDict.back}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F0FF', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, justifyContent: 'space-between' },
  header: { marginBottom: 30, alignItems: 'center' },
  headerTitle: { fontSize: 40, fontWeight: '900', color: '#1E293B' },
  card: { backgroundColor: '#FFFFFF', padding: 30, borderRadius: 24, borderWidth: 3, borderColor: '#B3D4FF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  stepText: { fontSize: 22, fontWeight: 'bold', color: '#334155', marginBottom: 20 },
  secondaryButton: { backgroundColor: '#94A3B8', width: '100%', paddingVertical: 18, borderRadius: 100, borderBottomWidth: 6, borderBottomColor: '#64748B', alignItems: 'center', marginBottom: 10 },
  secondaryButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
});