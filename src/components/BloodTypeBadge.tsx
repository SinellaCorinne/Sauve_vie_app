import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface BloodTypeBadgeProps {
  bloodType: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const BLOOD_TYPE_COLORS: Record<string, string> = {
  'O+': Colors.bloodTypeO,
  'O-': Colors.bloodTypeO,
  'A+': Colors.bloodTypeA,
  'A-': Colors.bloodTypeA,
  'B+': Colors.bloodTypeB,
  'B-': Colors.bloodTypeB,
  'AB+': Colors.bloodTypeAB,
  'AB-': Colors.bloodTypeAB,
};

const SIZES = {
  sm: { box: 36, font: 12, radius: 8 },
  md: { box: 48, font: 16, radius: 12 },
  lg: { box: 64, font: 22, radius: 16 },
  xl: { box: 88, font: 30, radius: 20 },
};

export default function BloodTypeBadge({ bloodType, size = 'md' }: BloodTypeBadgeProps) {
  const color = BLOOD_TYPE_COLORS[bloodType] ?? Colors.primary;
  const dim = SIZES[size];

  return (
    <View
      style={[
        styles.badge,
        {
          width: dim.box,
          height: dim.box,
          borderRadius: dim.radius,
          backgroundColor: color + '18',
          borderColor: color + '40',
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: dim.font, color }]}>{bloodType}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  text: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
