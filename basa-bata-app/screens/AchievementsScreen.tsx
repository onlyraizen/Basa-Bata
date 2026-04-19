import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { ACHIEVEMENTS } from '../utils/Storage';

interface AchievementsScreenProps {
  langDict: any;
  unlockedAchievements: string[];
  onBack: () => void;
}

export default function AchievementsScreen({
  langDict,
  unlockedAchievements,
  onBack,
}: AchievementsScreenProps) {
  const allAchievements = Object.values(ACHIEVEMENTS);
  const unlockedCount = unlockedAchievements.length;
  const totalCount = allAchievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>✖</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>🏆 {langDict.achievements}</Text>
          <Text style={styles.headerSubtitle}>
            {unlockedCount} / {totalCount} unlocked
          </Text>
        </View>
      </View>

      {/* Overall progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>{progressPercent}% Complete</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {allAchievements.map((ach) => {
            const isUnlocked = unlockedAchievements.includes(ach.id);
            return (
              <View
                key={ach.id}
                style={[
                  styles.achievementCard,
                  isUnlocked ? styles.achievementUnlocked : styles.achievementLocked,
                ]}
              >
                <View style={[
                  styles.iconCircle,
                  { backgroundColor: isUnlocked ? '#FEF3C7' : '#E2E8F0' },
                ]}>
                  <Text style={[styles.achievementIcon, !isUnlocked && styles.iconLocked]}>
                    {isUnlocked ? ach.icon : '🔒'}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.achievementTitle,
                    !isUnlocked && styles.textLocked,
                  ]}>
                    {ach.title}
                  </Text>
                  <Text style={[
                    styles.achievementSubtitle,
                    !isUnlocked && styles.textLocked,
                  ]}>
                    {ach.subtitle}
                  </Text>
                </View>

                {isUnlocked && <Text style={styles.unlockedBadge}>✓</Text>}
              </View>
            );
          })}
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
  progressCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#B3D4FF',
    marginBottom: 20,
  },
  progressTrack: {
    height: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 8,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 3,
    gap: 14,
  },
  achievementUnlocked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FDE68A',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  achievementLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.7,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIcon: { fontSize: 32 },
  iconLocked: { fontSize: 24 },
  achievementTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  achievementSubtitle: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 2 },
  textLocked: { color: '#94A3B8' },
  unlockedBadge: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    backgroundColor: '#22C55E',
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
    overflow: 'hidden',
  },
    emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
    textAlign: 'center',
  },
});
