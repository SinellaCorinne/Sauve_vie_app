import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface LogoProps {
  size?: number;
  showText?: boolean;
  style?: ViewStyle;
  variant?: 'default' | 'white' | 'compact';
}

export default function Logo({ size = 80, showText = true, style, variant = 'default' }: LogoProps) {
  const iconSize = size;
  const isWhite = variant === 'white';
  const isCompact = variant === 'compact';

  return (
    <View style={[styles.container, style]}>
      {/* Icône avec halo */}
      <View style={[styles.iconWrapper, { width: iconSize, height: iconSize, borderRadius: iconSize * 0.22 }]}>
        <View
          style={[
            styles.iconHalo,
            {
              width: iconSize + 12,
              height: iconSize + 12,
              borderRadius: (iconSize + 12) * 0.25,
              opacity: isWhite ? 0.25 : 0.12,
            },
          ]}
        />
        <Image
          source={require('../../assets/icon.png')}
          style={{ width: iconSize, height: iconSize, borderRadius: iconSize * 0.22 }}
          resizeMode="cover"
        />
      </View>

      {/* Texte */}
      {showText && !isCompact && (
        <View style={styles.textWrapper}>
          <Text
            style={[
              styles.brandName,
              {
                fontSize: size * 0.3,
                color: isWhite ? Colors.white : Colors.primary,
              },
            ]}
          >
            Sauve
            <Text style={{ color: isWhite ? 'rgba(255,255,255,0.75)' : Colors.primaryDark }}>-Vie</Text>
          </Text>
          <Text
            style={[
              styles.tagline,
              {
                fontSize: size * 0.1,
                color: isWhite ? 'rgba(255,255,255,0.65)' : Colors.textSecondary,
              },
            ]}
          >
            DON DE SANG
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconHalo: {
    position: 'absolute',
    backgroundColor: Colors.primary,
  },
  textWrapper: {
    alignItems: 'center',
    gap: 2,
  },
  brandName: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    fontWeight: '700',
    letterSpacing: 3,
  },
});
