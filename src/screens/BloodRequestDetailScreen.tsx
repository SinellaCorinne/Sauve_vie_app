import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../services/api';
import { bloodRequestRoutes } from '../config/api';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import BloodTypeBadge from '../components/BloodTypeBadge';
import UrgencyBadge from '../components/UrgencyBadge';

type Props = NativeStackScreenProps<RootStackParamList, 'BloodRequestDetail'>;

type RequestItem = {
  id: number;
  blood_type: string;
  urgency_level: string;
  status: string;
  city?: string;
  description?: string;
  donor_responses_count?: number;
  confirmed_donors_count?: number;
  expires_at?: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  open:      { label: 'Ouvert',    color: Colors.success,  bg: Colors.successLight, icon: '🟢' },
  fulfilled: { label: 'Satisfait', color: Colors.info,     bg: Colors.infoLight,    icon: '✅' },
  expired:   { label: 'Expiré',    color: Colors.gray500,  bg: Colors.gray100,      icon: '⏰' },
};

export default function BloodRequestDetailScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const [request, setRequest] = useState<RequestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'fulfill' | 'expire' | null>(null);

  const loadRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(bloodRequestRoutes.detail(requestId));
      setRequest(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Impossible de charger la demande.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequest(); }, [requestId]);

  const handleAction = async (action: 'fulfill' | 'expire') => {
    const label = action === 'fulfill' ? 'satisfaite' : 'expirée';
    Alert.alert(
      'Confirmer',
      `Marquer cette demande comme ${label} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: action === 'expire' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setActionLoading(action);
              await api.patch(`${bloodRequestRoutes.detail(requestId)}/${action}`);
              setRequest((prev) => prev ? { ...prev, status: action === 'fulfill' ? 'fulfilled' : 'expired' } : prev);
              Alert.alert('✅ Fait', `Demande marquée comme ${label}.`);
            } catch (err: any) {
              Alert.alert('Erreur', err?.response?.data?.message || 'Action impossible.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingState label="Chargement de la demande..." />;
  if (error)   return <ErrorState message={error} onRetry={loadRequest} />;
  if (!request) return <ErrorState message="Demande introuvable." />;

  const st = STATUS_MAP[request.status] ?? STATUS_MAP.open;
  const isClosed = request.status !== 'open';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.info} />

      {/* Header */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détail de la demande</Text>
          <View style={[styles.headerStatus, { backgroundColor: st.bg }]}>
            <Text style={styles.headerStatusIcon}>{st.icon}</Text>
            <Text style={[styles.headerStatusText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <BloodTypeBadge bloodType={request.blood_type} size="xl" />
            <View style={styles.heroMeta}>
              <UrgencyBadge level={request.urgency_level} size="md" />
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>{request.city ?? 'Ville non précisée'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.infoLight }]}>
            <Text style={[styles.statNum, { color: Colors.info }]}>
              {request.donor_responses_count ?? 0}
            </Text>
            <Text style={styles.statLabel}>Réponses</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.successLight }]}>
            <Text style={[styles.statNum, { color: Colors.success }]}>
              {request.confirmed_donors_count ?? 0}
            </Text>
            <Text style={styles.statLabel}>Confirmés</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: st.bg }]}>
            <Text style={[styles.statNum, { color: st.color, fontSize: 15 }]}>{st.icon}</Text>
            <Text style={styles.statLabel}>{st.label}</Text>
          </View>
        </View>

        {/* Description */}
        {request.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionText}>{request.description}</Text>
          </View>
        ) : null}

        {/* Infos */}
        <View style={styles.infoCard}>
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
          {request.expires_at && (
            <>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📅</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Expiration</Text>
                  <Text style={styles.infoValue}>
                    {new Date(request.expires_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Tip si ouvert */}
        {!isClosed && (
          <View style={styles.tipBox}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>
              Clôturez cette demande dès que votre besoin est satisfait pour libérer les donneurs.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer actions */}
      {!isClosed && (
        <SafeAreaView style={styles.footerSafe}>
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.fulfillBtn, actionLoading === 'fulfill' && styles.btnLoading]}
              onPress={() => handleAction('fulfill')}
              disabled={!!actionLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.fulfillBtnText}>
                {actionLoading === 'fulfill' ? 'En cours...' : '✅  Clôturer comme satisfaite'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.expireBtn, actionLoading === 'expire' && styles.btnLoading]}
              onPress={() => handleAction('expire')}
              disabled={!!actionLoading}
              activeOpacity={0.75}
            >
              <Text style={styles.expireBtnText}>
                {actionLoading === 'expire' ? 'En cours...' : '⏰  Marquer expirée'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {isClosed && (
        <SafeAreaView style={styles.footerSafe}>
          <View style={styles.footer}>
            <View style={[styles.closedBanner, { backgroundColor: st.bg }]}>
              <Text style={styles.closedIcon}>{st.icon}</Text>
              <Text style={[styles.closedText, { color: st.color }]}>
                Cette demande est {st.label.toLowerCase()}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  headerSafe: { backgroundColor: Colors.info },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: Colors.info,
    gap: 10,
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
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerStatusIcon: { fontSize: 12 },
  headerStatusText: { fontSize: 12, fontWeight: '700' },

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
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  heroMeta: { flex: 1, gap: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationIcon: { fontSize: 13 },
  locationText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

  // Stats
  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statNum: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },

  // Section description
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
  sectionText: { fontSize: 15, color: Colors.textBody, lineHeight: 23 },

  // Info card
  infoCard: {
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
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  infoIcon: { fontSize: 20 },
  infoContent: { flex: 1, gap: 2 },
  infoLabel: { fontSize: 12, color: Colors.textLight, fontWeight: '600' },
  infoValue: { fontSize: 15, color: Colors.textDark, fontWeight: '700' },
  infoDivider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: 16 },

  // Tip
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.infoLight,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.info + '25',
  },
  tipIcon: { fontSize: 16, marginTop: 1 },
  tipText: { flex: 1, fontSize: 13, color: Colors.infoDark, lineHeight: 19, fontWeight: '500' },

  // Footer
  footerSafe: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footer: { padding: 16, gap: 10 },
  fulfillBtn: {
    backgroundColor: Colors.success,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  fulfillBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white, letterSpacing: 0.1 },
  expireBtn: {
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  expireBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  btnLoading: { opacity: 0.55 },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  closedIcon: { fontSize: 18 },
  closedText: { fontSize: 15, fontWeight: '700' },
});
