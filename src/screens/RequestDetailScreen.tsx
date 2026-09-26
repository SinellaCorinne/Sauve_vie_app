import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../services/api';
import { bloodRequestRoutes } from '../config/api';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import BloodTypeBadge from '../components/BloodTypeBadge';
import UrgencyBadge from '../components/UrgencyBadge';

type Props = NativeStackScreenProps<RootStackParamList, 'RequestDetail'>;

type RequestItem = {
  id: number;
  blood_type: string;
  urgency_level: string;
  description?: string;
  city?: string;
  status: string;
  donor_responses_count?: number;
  confirmed_donors_count?: number;
  expires_at?: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  open:      { label: 'Ouvert',    color: Colors.success,  bg: Colors.successLight },
  fulfilled: { label: 'Satisfait', color: Colors.info,     bg: Colors.infoLight    },
  expired:   { label: 'Expiré',    color: Colors.gray500,  bg: Colors.gray100      },
};

export default function RequestDetailScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const [request, setRequest] = useState<RequestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await api.get(bloodRequestRoutes.detail(requestId));
        setRequest(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Impossible de charger les détails.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [requestId]);

  const handleRespond = async () => {
    try {
      setResponding(true);
      await api.post(bloodRequestRoutes.respond(requestId), { note: 'Disponible immédiatement.' });
      setResponded(true);
      Alert.alert('✅ Réponse envoyée', 'Votre disponibilité a bien été enregistrée. L\'hôpital vous contactera.');
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Impossible de répondre.');
    } finally {
      setResponding(false);
    }
  };

  if (loading) return <LoadingState label="Chargement des détails..." />;
  if (error) return <ErrorState message={error} onRetry={() => navigation.goBack()} />;
  if (!request) return null;

  const statusInfo = STATUS_MAP[request.status] ?? STATUS_MAP.open;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détail de la demande</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <BloodTypeBadge bloodType={request.blood_type} size="xl" />
            <View style={styles.heroMeta}>
              <UrgencyBadge level={request.urgency_level} size="md" />
              <View style={[styles.statusPill, { backgroundColor: statusInfo.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
              </View>
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>{request.city || 'Ville non précisée'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        {request.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{request.description}</Text>
          </View>
        ) : null}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{request.donor_responses_count ?? '—'}</Text>
            <Text style={styles.statLabel}>Réponses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>
              {request.confirmed_donors_count ?? '—'}
            </Text>
            <Text style={styles.statLabel}>Confirmés</Text>
          </View>
          {request.expires_at ? (
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { fontSize: 13 }]}>
                {new Date(request.expires_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              </Text>
              <Text style={styles.statLabel}>Expiration</Text>
            </View>
          ) : null}
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🩸</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Groupe sanguin requis</Text>
              <Text style={styles.infoValue}>{request.blood_type}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⚡</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Niveau d'urgence</Text>
              <Text style={styles.infoValue}>{request.urgency_level}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer action */}
      <SafeAreaView style={styles.footerSafe}>
        <View style={styles.footer}>
          {responded ? (
            <View style={styles.respondedBanner}>
              <Text style={styles.respondedText}>✅ Vous avez signalé votre disponibilité</Text>
            </View>
          ) : request.status === 'open' ? (
            <TouchableOpacity
              style={[styles.respondButton, responding && styles.respondButtonDisabled]}
              onPress={handleRespond}
              disabled={responding}
              activeOpacity={0.85}
            >
              <Text style={styles.respondButtonText}>
                {responding ? 'Envoi en cours...' : '🩸  Je suis disponible'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.closedBanner}>
              <Text style={styles.closedText}>Cette demande n'est plus active</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  headerSafe: { backgroundColor: Colors.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: Colors.primary,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 20, color: Colors.white, fontWeight: '600' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  headerRight: { width: 38 },

  // Scroll
  scroll: { paddingBottom: 20, gap: 14, paddingTop: 6 },

  // Hero card
  heroCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  heroMeta: { flex: 1, gap: 8 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: 12, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationIcon: { fontSize: 13 },
  locationText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

  // Section
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.textBody,
    lineHeight: 23,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textLight,
    textAlign: 'center',
  },

  // Info box
  infoBox: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  infoIcon: { fontSize: 20 },
  infoContent: { flex: 1, gap: 2 },
  infoLabel: { fontSize: 12, color: Colors.textLight, fontWeight: '600' },
  infoValue: { fontSize: 15, color: Colors.textDark, fontWeight: '700' },
  infoDivider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: 16 },

  // Footer
  footerSafe: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footer: { padding: 16 },
  respondButton: {
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
  respondButtonDisabled: { opacity: 0.6 },
  respondButtonText: { fontSize: 16, fontWeight: '700', color: Colors.white, letterSpacing: 0.2 },
  respondedBanner: {
    backgroundColor: Colors.successLight,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  respondedText: { fontSize: 15, fontWeight: '600', color: Colors.success },
  closedBanner: {
    backgroundColor: Colors.gray100,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closedText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
});
