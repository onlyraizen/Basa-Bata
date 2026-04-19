import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface CategoryButtonProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
}

export default function CategoryButton({ title, subtitle, icon, onPress }: CategoryButtonProps) {
  return (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
      <Text style={styles.categoryIcon}>{icon}</Text>
      <View style={styles.categoryTextContainer}>
        <Text style={styles.categoryTitle}>{title}</Text>
        <Text style={styles.categorySub}>{subtitle}</Text>
      </View>
      <Text style={styles.arrowIcon}>➔</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  categoryCard: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 3, borderColor: '#B3D4FF', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  categoryIcon: { fontSize: 40, marginRight: 15 },
  categoryTextContainer: { flex: 1 },
  categoryTitle: { fontSize: 24, fontWeight: 'bold', color: '#334155' },
  categorySub: { fontSize: 16, color: '#94A3B8', fontWeight: '600' },
  arrowIcon: { fontSize: 24, color: '#CBD5E1' },
});