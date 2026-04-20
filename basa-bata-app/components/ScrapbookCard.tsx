import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Animated, View } from 'react-native';

interface ScrapbookCardProps {
  word: string;
  icon: string;
  syllables?: string;
  onReplay: () => void;
  onSlowReplay?: () => void;
  cardOpacity: Animated.Value;
  cardScale: Animated.Value;
  a11yLabels?: { listen: string; listenSlow: string }; // 🔥 NEW
}

export default function ScrapbookCard({
  word,
  icon,
  syllables,
  onReplay,
  onSlowReplay,
  cardOpacity,
  cardScale,
  a11yLabels,
}: ScrapbookCardProps) {
  return (
    <Animated.View
      style={[
        styles.scrapbookCard,
        { opacity: cardOpacity, transform: [{ scale: cardScale }, { rotate: '-2deg' }] },
      ]}
      accessible={true}
      accessibilityLabel={`Card showing ${word}`}
    >
      <Text style={styles.iconText}>{icon}</Text>
      <Text
        style={styles.promptText}
        accessibilityRole="header"
        accessibilityLabel={`Word: ${word}`}
      >
        {word.toUpperCase()}
      </Text>

      {syllables && (
        <View style={styles.hintContainer} accessible={true} accessibilityLabel={`Hint: ${syllables}`}>
          <Text style={styles.hintLabel}>💡 Subukan: </Text>
          <Text style={styles.hintText}>{syllables.toUpperCase()}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.replayButton}
          onPress={onReplay}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={a11yLabels?.listen || 'Listen to word'}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.replayButtonText}>🔊 Pakinggan</Text>
        </TouchableOpacity>

        {onSlowReplay && (
          <TouchableOpacity
            style={styles.slowButton}
            onPress={onSlowReplay}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={a11yLabels?.listenSlow || 'Listen slowly'}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.slowButtonText}>🐢 Dahan-dahan</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrapbookCard: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#B3D4FF',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconText: { fontSize: 65, marginBottom: 5 },
  promptText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#334155',
    letterSpacing: 2,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
  },
  hintText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  replayButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 12, // 🔥 bigger tap target (was 10)
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    minHeight: 44, // 🔥 iOS accessibility minimum
  },
  replayButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  slowButton: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 12, // 🔥 bigger tap target
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#BBF7D0',
    minHeight: 44, // 🔥 iOS accessibility minimum
  },
  slowButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#16A34A',
  },
});