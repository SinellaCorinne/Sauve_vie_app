import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface UrgencyBadgeProps {
  level: string;
  size?: 'sm' | 'md';
}

const URGENCY_MAP: Record<string, { label: string; icon: string; bg: string; text: string; border: string }> = {
  critical: {
    label: 'Critique',
    icon: '🚨',
    bg: Colors.criticalLight,
    text: Colors.critical,
    border: Colors.critical + '30',
  },
  urgent: {
    label: 'Urgent',
    icon: '⚡',
    bg: Colors.urgentLight,
    text: Colors.urgent,
    border: Colors.urgent + '30',
  },
  normal: {
    label: 'Normal',
    icon: '✓',
    bg: Colors.normalLight,
    text: Colors.normal,
    border: Colors.normal + '30',
  },
};

export default function UrgencyBadge({ level, size = 'md' }: UrgencyBadgeProps) {
  const config = URGENCY_MAP[level] ?? URGENCY_MAP.normal;
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 3 : 5,
          gap: isSmall ? 3 : 4,
        },
      ]}
    >
      <Text style={{ fontSize: isSmall ? 10 : 12 }}>{config.icon}</Text>
      <Text
        style={[
          styles.label,
          {
            color: config.text,
            fontSize: isSmall ? 10 : 12,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
