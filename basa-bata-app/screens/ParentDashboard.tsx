import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CATEGORIES, TOTAL_WORDS } from '../constants/Categories';
import { AllProgress, resetAllProgress, ACHIEVEMENTS } from '../utils/Storage';

interface ParentDashboardProps {
  langDict: any;
  progress: AllProgress;
  totalStars: number;
  dailyStreak: number;
  unlockedAchievements: string[];
  onBack: () => void;
  onViewAchievements: () => void;
}

export default function ParentDashboard({
  langDict,
  progress,
  totalStars,
  dailyStreak,
  unlockedAchievements,
  onBack,
  onViewAchievements,
}: ParentDashboardProps) {

  // ─── Calculate overall stats ──────────────────────────────
  let wordsCompleted = 0;
  let totalAttempts = 0;
  let correctOnFirstTryCount = 0;

  Object.values(progress).forEach((catProgress) => {
    Object.values(catProgress).forEach((word) => {
      if (word.completed) wordsCompleted++;
      totalAttempts += word.attempts;
      if (word.correctOnFirstTry) correctOnFirstTryCount++;
    });
  });

  const overallPercent = TOTAL_WORDS > 0 ? Math.round((wordsCompleted / TOTAL_WORDS) * 100) : 0;
  const firstTryAccuracy = wordsCompleted > 0
    ? Math.round((correctOnFirstTryCount / wordsCompleted) * 100)
    : 0;

  const totalAchievements = Object.keys(ACHIEVEMENTS).length;

  // ─── Reset handler ────────────────────────────────────────
  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      langDict.reset,
      langDict.resetConfirm,
      [
        { text: langDict.no, style: 'cancel' },
        {
          text: langDict.yes,
          style: 'destructive',
          onPress: async () => {
            await resetAllProgress();
            onBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>✖</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{langDict.parentDashboard}</Text>
          <Text style={styles.headerSubtitle}>👨‍👩‍👧 Progreso ng Bata</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ──── BIG STATS CARDS ──── */}
        <View style={styles.bigStatsRow}>
          <View style={[styles.bigStatCard, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
            <Text style={styles.bigStatEmoji}>⭐</Text>
            <Text style={styles.bigStatNumber}>{totalStars}</Text>
            <Text style={styles.bigStatLabel}>{langDict.totalStars}</Text>
          </View>

          <View style={[styles.bigStatCard, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
            <Text style={styles.bigStatEmoji}>🔥</Text>
            <Text style={styles.bigStatNumber}>{dailyStreak}</Text>
            <Text style={styles.bigStatLabel}>{langDict.daysStreak}</Text>
          </View>
        </View>

        {/* ──── OVERALL PROGRESS ──── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📊 {langDict.overallProgress}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${overallPercent}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{overallPercent}%</Text>
          </View>
          <Text style={styles.progressCaption}>
            {wordsCompleted} / {TOTAL_WORDS} words completed
          </Text>

          <View style={styles.miniStatsRow}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatNumber}>{totalAttempts}</Text>
              <Text style={styles.miniStatLabel}>Total {langDict.attempts}</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatNumber, { color: '#16A34A' }]}>{firstTryAccuracy}%</Text>
              <Text style={styles.miniStatLabel}>First-try accuracy</Text>
            </View>
          </View>
        </View>

        {/* ──── CATEGORY BREAKDOWN ──── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📚 {langDict.lessons}</Text>
          {Object.values(CATEGORIES).map((cat) => {
            const catProgress = progress[cat.id] || {};
            const catCompleted = Object.values(catProgress).filter((w) => w.completed).length;
            const catPercent = Math.round((catCompleted / cat.words.length) * 100);
            return (
              <View key={cat.id} style={styles.categoryRow}>
                <View style={[styles.catIconCircle, { backgroundColor: `${cat.color}22` }]}>
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.catTitle}>{cat.title}</Text>
                  <View style={styles.catProgressRow}>
                    <View style={styles.catProgressTrack}>
                      <View
                        style={[
                          styles.catProgressFill,
                          { width: `${catPercent}%`, backgroundColor: cat.color },
                        ]}
                      />
                    </View>
                    <Text style={styles.catProgressText}>
                      {catCompleted}/{cat.words.length}
                    </Text>
                  </View>
                </View>
                {catCompleted === cat.words.length && (
                  <Text style={styles.checkmark}>✅</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* ──── ACHIEVEMENTS PREVIEW ──── */}
        <TouchableOpacity style={styles.achievementsButton} onPress={onViewAchievements} activeOpacity={0.8}>
          <View style={styles.achievementsLeft}>
            <Text style={styles.achievementsEmoji}>🏆</Text>
            <View>
              <Text style={styles.achievementsTitle}>{langDict.achievements}</Text>
              <Text style={styles.achievementsSub}>
                {unlockedAchievements.length} / {totalAchievements} unlocked
              </Text>
            </View>
          </View>
          <Text style={styles.achievementsArrow}>➔</Text>
        </TouchableOpacity>

        {/* ──── RESET BUTTON ──── */}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.8}>
          <Text style={styles.resetButtonText}>🗑️ {langDict.reset}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F0FF',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#B3D4FF',
  },
  backBtnText: { fontSize: 18, color: '#64748B', fontWeight: '900' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 2 },
  bigStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  bigStatCard: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
  },
  bigStatEmoji: { fontSize: 36, marginBottom: 4 },
  bigStatNumber: { fontSize: 36, fontWeight: '900', color: '#1E293B' },
  bigStatLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#B3D4FF',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressTrack: {
    flex: 1,
    height: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 8 },
  progressPercent: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3B82F6',
    minWidth: 50,
    textAlign: 'right',
  },
  progressCaption: { fontSize: 13, color: '#64748B', marginTop: 6, fontWeight: '600' },
  miniStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  miniStat: { flex: 1, alignItems: 'center' },
  miniStatNumber: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
  miniStatLabel: { fontSize: 11, fontWeight: 'bold', color: '#94A3B8', marginTop: 2 },
  miniStatDivider: { width: 1, height: 30, backgroundColor: '#E2E8F0' },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  catIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catIcon: { fontSize: 24 },
  catTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 4 },
  catProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catProgressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  catProgressFill: { height: '100%', borderRadius: 3 },
  catProgressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
    minWidth: 32,
    textAlign: 'right',
  },
  checkmark: { fontSize: 20 },
  achievementsButton: {
    backgroundColor: '#FEF3C7',
    padding: 18,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  achievementsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  achievementsEmoji: { fontSize: 36 },
  achievementsTitle: { fontSize: 18, fontWeight: '900', color: '#78350F' },
  achievementsSub: { fontSize: 13, color: '#92400E', fontWeight: '600' },
  achievementsArrow: { fontSize: 24, color: '#92400E', fontWeight: '900' },
  resetButton: {
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FECACA',
    alignItems: 'center',
  },
  resetButtonText: { fontSize: 14, fontWeight: 'bold', color: '#DC2626' },
});