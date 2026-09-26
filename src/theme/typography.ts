import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
  '5xl': 42,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const LineHeights = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
};

export const Typography = StyleSheet.create({
  // Titres
  hero: {
    fontSize: FontSizes['4xl'],
    fontWeight: FontWeights.black,
    color: Colors.textDark,
    lineHeight: FontSizes['4xl'] * LineHeights.tight,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.extrabold,
    color: Colors.textDark,
    lineHeight: FontSizes['3xl'] * LineHeights.tight,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    lineHeight: FontSizes['2xl'] * LineHeights.snug,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textDark,
    lineHeight: FontSizes.xl * LineHeights.snug,
  },
  h4: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textDark,
    lineHeight: FontSizes.lg * LineHeights.snug,
  },

  // Corps de texte
  bodyLarge: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.regular,
    color: Colors.textBody,
    lineHeight: FontSizes.base * LineHeights.relaxed,
  },
  body: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.regular,
    color: Colors.textBody,
    lineHeight: FontSizes.md * LineHeights.normal,
  },
  bodyMedium: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textBody,
    lineHeight: FontSizes.md * LineHeights.normal,
  },
  bodySemibold: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textBody,
    lineHeight: FontSizes.md * LineHeights.normal,
  },
  bodySmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.regular,
    color: Colors.textSecondary,
    lineHeight: FontSizes.sm * LineHeights.normal,
  },

  // Labels & captions
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    color: Colors.textLight,
    letterSpacing: 0.2,
  },
  overline: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // Boutons
  buttonLarge: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.3,
  },
  button: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.2,
  },
  buttonSmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.2,
  },

  // Champs
  input: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.regular,
    color: Colors.textDark,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
});
