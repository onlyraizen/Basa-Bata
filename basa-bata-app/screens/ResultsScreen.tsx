import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface ResultsScreenProps {
  score: number;
  maxScore: number;
  onContinue: () => void;
  isPracticeMode: boolean;
  langDict: any;
}

export default function ResultsScreen({ score, maxScore, onContinue, isPracticeMode, langDict }: ResultsScreenProps) {
  const isPerfect = score === maxScore;

  return (
    <View style={styles.container}>
      {/* BOOM! Duolingo-style confetti explosion on load */}
      <ConfettiCannon 
        count={150} 
        origin={{x: -10, y: 0}} 
        fallSpeed={2500} 
        fadeOut={true}
        colors={['#3B82F6', '#22C55E', '#FDE047', '#EF4444', '#A855F7']}
      />

      <View style={styles.homeCenter}>
        <View style={styles.resultsCard}>
          <Text style={styles.logoIcon}>{isPerfect ? '🏆' : '⭐'}</Text>
          <Text style={styles.resultsTitle}>{isPerfect ? langDict.perfect : langDict.feedbackGood}</Text>
          {!isPracticeMode && <Text style={styles.resultsScore}>{score} / {maxScore} {langDict.score}</Text>}
          <Text style={styles.resultsSubtitle}>{langDict.finish}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
        <Text style={styles.primaryButtonText}>{langDict.back} ➔</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F0FF', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, justifyContent: 'space-between' },
  homeCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultsCard: { backgroundColor: '#FFFFFF', width: '100%', paddingVertical: 50, borderRadius: 40, alignItems: 'center', borderWidth: 5, borderColor: '#FDE047', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
  logoIcon: { fontSize: 100, marginBottom: 10 },
  resultsTitle: { fontSize: 48, fontWeight: '900', color: '#EAB308', marginTop: 10, textAlign: 'center' },
  resultsScore: { fontSize: 36, fontWeight: 'bold', color: '#3B82F6', marginVertical: 15 },
  resultsSubtitle: { fontSize: 20, fontWeight: 'bold', color: '#64748B', textAlign: 'center' },
  primaryButton: { backgroundColor: '#22C55E', width: '100%', paddingVertical: 24, borderRadius: 100, borderBottomWidth: 8, borderBottomColor: '#16A34A', alignItems: 'center', marginBottom: 20 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', letterSpacing: 2 },
});