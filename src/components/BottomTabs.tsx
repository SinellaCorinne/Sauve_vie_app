import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors } from '../theme/colors';

export interface TabItem {
  key: string;
  label: string;
  icon: string;
  active?: boolean;
  onPress: () => void;
}

interface BottomTabsProps {
  tabs: TabItem[];
}

export default function BottomTabs({ tabs }: BottomTabsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={tab.onPress}
            activeOpacity={0.7}
          >
            {/* Indicateur actif */}
            {tab.active && <View style={styles.activePill} />}

            {/* Icône */}
            <View style={[styles.iconBox, tab.active && styles.iconBoxActive]}>
              <Text style={[styles.icon, tab.active && styles.iconActive]}>
                {tab.icon}
              </Text>
            </View>

            {/* Label */}
            <Text
              style={[styles.label, tab.active && styles.labelActive]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 12,
  },
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    position: 'relative',
    paddingVertical: 4,
  },
  activePill: {
    position: 'absolute',
    top: -8,
    width: 32,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  iconBox: {
    width: 40,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: Colors.primaryLight,
  },
  icon: {
    fontSize: 20,
    opacity: 0.45,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textLight,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
