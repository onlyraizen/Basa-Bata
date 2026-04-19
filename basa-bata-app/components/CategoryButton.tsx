import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface CategoryButtonProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  color?: string;
  completedCount?: number;
  totalCount?: number;
}

export default function CategoryButton({
  title,
  subtitle,
  icon,
  onPress,
  color = '#B3D4FF',
  completedCount = 0,
  totalCount = 0,
}: CategoryButtonProps) {
  const isComplete = completedCount === totalCount && totalCount > 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <TouchableOpacity
      style={[styles.categoryCard, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${color}22` }]}>
        <Text style={styles.categoryIcon}>{icon}</Text>
      </View>
      <View style={styles.categoryTextContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.categoryTitle}>{title}</Text>
          {isComplete && <Text style={styles.completeBadge}>✓</Text>}
        </View>
        <Text style={styles.categorySub}>{subtitle}</Text>
        {totalCount > 0 && (
          <View style={styles.progressRow}>
            <View style={styles.miniProgressTrack}>
              <View
                style={[
                  styles.miniProgressFill,
                  { width: `${progressPercent}%`, backgroundColor: color },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {completedCount}/{totalCount}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.arrowIcon, { color }]}>➔</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  categoryCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 3,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  categoryIcon: { fontSize: 32 },
  categoryTextContainer: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryTitle: { fontSize: 22, fontWeight: 'bold', color: '#334155' },
  completeBadge: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  categorySub: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  miniProgressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniProgressFill: { height: '100%', borderRadius: 3 },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
    minWidth: 32,
    textAlign: 'right',
  },
  arrowIcon: { fontSize: 24 },
});