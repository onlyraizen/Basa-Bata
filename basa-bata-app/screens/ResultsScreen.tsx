import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface SessionResult {
  word: string;
  correct: boolean;
}

interface ResultsScreenProps {
  score: number;
  maxScore: number;
  onContinue: () => void;
  isPracticeMode: boolean;
  langDict: any;
  sessionResults?: SessionResult[]; // 🔥 NEW
}

export default function ResultsScreen({
  score,
  maxScore,
  onContinue,
  isPracticeMode,
  langDict,
  sessionResults = [],
}: ResultsScreenProps) {
  const isPerfect = score === maxScore && !isPracticeMode;
  const correctCount = sessionResults.filter((r) => r.correct).length;
  const totalCount = sessionResults.length;
  const accuracyPercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const scoreScale = useRef(new Animated.Value(0)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const breakdownSlide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Fade in card
      Animated.timing(cardFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      // 2. Pop in score
      Animated.spring(scoreScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
      // 3. Slide up breakdown
      Animated.spring(breakdownSlide, { toValue: 0, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  // Performance message based on accuracy
  const getPerformanceMessage = () => {
    if (isPracticeMode) return langDict.finish;
    if (isPerfect) return langDict.perfect;
    if (accuracyPercent >= 80) return langDict.feedbackGood;
    if (accuracyPercent >= 50) return 'Magaling pa rin!';
    return 'Subukan muli!';
  };

  const getPerformanceEmoji = () => {
    if (isPracticeMode) return '🎉';
    if (isPerfect) return '🏆';
    if (accuracyPercent >= 80) return '⭐';
    if (accuracyPercent >= 50) return '💪';
    return '🌱';
  };

  return (
    <View style={styles.container}>
      {/* Confetti only for perfect or 80%+ */}
      {(isPerfect || accuracyPercent >= 80 || isPracticeMode) && (
        <ConfettiCannon
          count={150}
          origin={{ x: -10, y: 0 }}
          fallSpeed={2500}
          fadeOut={true}
          colors={['#3B82F6', '#22C55E', '#FDE047', '#EF4444', '#A855F7']}
        />
      )}

      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main results card */}
        <Animated.View style={[styles.resultsCard, { opacity: cardFade }]}>
          <Text style={styles.logoIcon}>{getPerformanceEmoji()}</Text>
          <Text style={styles.resultsTitle}>{getPerformanceMessage()}</Text>

          {!isPracticeMode && (
            <Animated.View style={[styles.scoreContainer, { transform: [{ scale: scoreScale }] }]}>
              <Text style={styles.resultsScore}>
                {score} <Text style={styles.scoreDivider}>/</Text> {maxScore}
              </Text>
              <Text style={styles.scoreLabel}>{langDict.score}</Text>
            </Animated.View>
          )}

          {/* Accuracy ring */}
          {totalCount > 0 && (
            <View style={styles.accuracyRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{correctCount}</Text>
                <Text style={styles.statLabel}>{langDict.wordsCorrect}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{totalCount}</Text>
                <Text style={styles.statLabel}>{langDict.wordsTotal}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: accuracyPercent >= 80 ? '#22C55E' : accuracyPercent >= 50 ? '#F59E0B' : '#EF4444' }]}>
                  {accuracyPercent}%
                </Text>
                <Text style={styles.statLabel}>accuracy</Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* 🔥 Word-by-word breakdown */}
        {sessionResults.length > 0 && (
          <Animated.View style={[styles.breakdownCard, { transform: [{ translateY: breakdownSlide }] }]}>
            <Text style={styles.breakdownTitle}>📋 {langDict.resultsBreakdown}</Text>
            {sessionResults.map((result, index) => (
              <View key={index} style={styles.breakdownRow}>
                <View style={styles.breakdownLeft}>
                  <View style={[
                    styles.breakdownIcon,
                    { backgroundColor: result.correct ? '#DCFCE7' : '#FEE2E2' },
                  ]}>
                    <Text style={styles.breakdownEmoji}>
                      {result.correct ? '✅' : '❌'}
                    </Text>
                  </View>
                  <Text style={styles.breakdownWord}>{result.word.toUpperCase()}</Text>
                </View>
                <Text style={[
                  styles.breakdownStatus,
                  { color: result.correct ? '#16A34A' : '#DC2626' },
                ]}>
                  {result.correct ? langDict.correct : langDict.incorrect}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.primaryButton} onPress={onContinue} activeOpacity={0.8}>
        <Text style={styles.primaryButtonText}>{langDict.back} ➔</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F0FF',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FDE047',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 20,
  },
  logoIcon: { fontSize: 80, marginBottom: 5 },
  resultsTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#EAB308',
    textAlign: 'center',
  },
  scoreContainer: { alignItems: 'center', marginVertical: 15 },
  resultsScore: {
    fontSize: 56,
    fontWeight: '900',
    color: '#3B82F6',
  },
  scoreDivider: { color: '#94A3B8', fontSize: 40 },
  scoreLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  accuracyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    borderRadius: 16,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  statLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  statDivider: { width: 1, height: 30, backgroundColor: '#E2E8F0' },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 20,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#B3D4FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  breakdownTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  breakdownEmoji: { fontSize: 18 },
  breakdownWord: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
    letterSpacing: 1,
  },
  breakdownStatus: {
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  primaryButton: {
    backgroundColor: '#22C55E',
    width: '100%',
    paddingVertical: 22,
    borderRadius: 100,
    borderBottomWidth: 8,
    borderBottomColor: '#16A34A',
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
});