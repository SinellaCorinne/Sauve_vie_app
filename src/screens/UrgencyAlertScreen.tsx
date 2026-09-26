import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'UrgencyAlert'>;

export default function UrgencyAlertScreen({ navigation }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Pulsation du badge
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Fond décoratif */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <SafeAreaView style={styles.inner}>
        {/* Bouton fermer */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Badge pulsant */}
          <Animated.View style={[styles.alertBadge, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.alertBadgeIcon}>🚨</Text>
            <Text style={styles.alertBadgeText}>ALERTE URGENTE</Text>
          </Animated.View>

          {/* Illustration */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../assets/Blood donation-amico.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          {/* Texte */}
          <View style={styles.textBlock}>
            <Text style={styles.title}>Besoin critique de sang</Text>
            <Text style={styles.subtitle}>
              Une demande urgente nécessite votre réponse immédiate. Vérifiez la compatibilité et répondez dès maintenant.
            </Text>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⏰</Text>
              <Text style={styles.statLabel}>Temps réel</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>🩸</Text>
              <Text style={styles.statLabel}>Compatible</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>💪</Text>
              <Text style={styles.statLabel}>Impact direct</Text>
            </View>
          </View>
        </Animated.View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CompatibleRequests')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Voir les demandes urgentes →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Text style={styles.secondaryButtonText}>Plus tard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },

  // Fond décoratif
  bgCircle1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: Colors.primarySoft,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primaryLight,
    bottom: 100,
    left: -60,
    opacity: 0.5,
  },

  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // Fermer
  closeBtn: {
    alignSelf: 'flex-end',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  closeBtnText: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },

  content: {
    flex: 1,
    alignItems: 'center',
    gap: 20,
    paddingTop: 8,
  },

  // Badge
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.criticalLight,
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
  },
  alertBadgeIcon: { fontSize: 16 },
  alertBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1.5,
  },

  // Illustration
  imageContainer: {
    width: 220,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 220,
    height: 200,
  },

  // Texte
  textBlock: { alignItems: 'center', gap: 10, paddingHorizontal: 8 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
    maxWidth: 300,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22 },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },

  // Actions
  actions: { gap: 12 },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: Colors.white, letterSpacing: 0.2 },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
});
