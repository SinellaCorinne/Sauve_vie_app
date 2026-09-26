import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';
import Logo from '../components/Logo';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleChoice'>;

const { width } = Dimensions.get('window');

const ROLES = [
  {
    key: 'donor',
    icon: '🩸',
    title: 'Je suis donneur',
    subtitle: 'Signalez votre disponibilité et répondez aux appels urgents compatibles avec votre groupe sanguin.',
    tag: 'Donneur de sang',
    tagColor: Colors.primary,
    tagBg: Colors.primaryLight,
    accentBg: Colors.primarySoft,
    border: Colors.primary,
    screen: 'RegisterDonor' as const,
  },
  {
    key: 'hospital',
    icon: '🏥',
    title: 'Je suis hôpital',
    subtitle: 'Publiez des demandes de sang, gérez les réponses des donneurs et suivez vos besoins en temps réel.',
    tag: 'Établissement de santé',
    tagColor: Colors.info,
    tagBg: Colors.infoLight,
    accentBg: '#F0F7FF',
    border: Colors.info,
    screen: 'RegisterHospital' as const,
  },
];

export default function RoleChoiceScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <SafeAreaView style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <Logo size={68} showText={false} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Qui êtes-vous ?</Text>
            <Text style={styles.subtitle}>Choisissez votre profil pour personnaliser votre expérience.</Text>
          </View>
        </View>

        {/* Cartes de rôle */}
        <View style={styles.cardsContainer}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.key}
              style={[styles.card, { borderColor: role.border + '40', backgroundColor: role.accentBg }]}
              onPress={() => navigation.navigate(role.screen)}
              activeOpacity={0.82}
            >
              {/* Tag en haut à droite */}
              <View style={[styles.tagPill, { backgroundColor: role.tagBg }]}>
                <Text style={[styles.tagText, { color: role.tagColor }]}>{role.tag}</Text>
              </View>

              {/* Icône + contenu */}
              <View style={styles.cardBody}>
                <View style={[styles.iconBox, { backgroundColor: role.tagColor + '15' }]}>
                  <Text style={styles.cardIcon}>{role.icon}</Text>
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{role.title}</Text>
                  <Text style={styles.cardSubtitle}>{role.subtitle}</Text>
                </View>
              </View>

              {/* CTA inline */}
              <View style={[styles.cardCta, { borderTopColor: role.border + '20' }]}>
                <Text style={[styles.cardCtaText, { color: role.tagColor }]}>
                    Créer un compte →
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Séparateur */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>ou</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Lien connexion */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.75}
        >
          <Text style={styles.loginText}>J'ai déjà un compte</Text>
          <Text style={[styles.loginTextBold, { color: Colors.primary }]}> Se connecter →</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },

  // Cards
  cardsContainer: {
    gap: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  tagPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    paddingRight: 100,
    gap: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardIcon: {
    fontSize: 26,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  cardCta: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cardCtaText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  // Séparateur
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  separatorText: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500',
  },

  // Login
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  loginText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  loginTextBold: {
    fontSize: 15,
    fontWeight: '700',
  },
});
