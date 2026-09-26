import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  onPress: () => void;
  wrapperStyle?: ViewStyle | any;
  iconStyle?: TextStyle | any;
  accessibilityLabel?: string;
}

export default function BackButton({ onPress, wrapperStyle, iconStyle, accessibilityLabel = 'Retour' }: Props) {
  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.button, wrapperStyle]}
    >
      <Text style={[styles.icon, iconStyle]}>◀️</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
