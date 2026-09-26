import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { hospitalRoutes } from '../config/api';
import { RootStackParamList } from '../navigation/AppNavigator';
import BottomTabs from '../components/BottomTabs';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import BloodTypeBadge from '../components/BloodTypeBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import { Colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalHome'>;

type BloodRequest = {
  id: number;
  blood_type: string;
  urgency_level: string;
  status: string;
  description?: string;
  city?: string;
  donor_responses_count?: number;
};

const STATUS_MAP: Record<string, { color: string; bg: string; label: string }> = {
  open:      { color: Colors.success,  bg: Colors.successLight, label: 'Ouvert'    },
  fulfilled: { color: Colors.info,     bg: Colors.infoLight,    label: 'Satisfait' },
  expired:   { color: Colors.gray400,  bg: Colors.gray100,      label: 'Expiré'    },
};

const HOSP_TABS = (nav: Props['navigation']) => [
  { key: 'home',     label: 'Accueil',   icon: '🏠', active: true, onPress: () => nav.navigate('HospitalHome') },
  { key: 'requests', label: 'Demandes',  icon: '📋', onPress: () => nav.navigate('HospitalRequests') },
  { key: 'create',   label: 'Créer',     icon: '➕', onPress: () => nav.navigate('CreateBloodRequest') },
  { key: 'profile',  label: 'Profil',    icon: '🏥', onPress: () => nav.navigate('HospitalProfile') },
];

export default function HospitalHomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const response = await api.get(hospitalRoutes.myRequests);
      setRequests(response.data.data || response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Impossible de charger les demandes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const openCount      = requests.filter((r) => r.status === 'open').length;
  const criticalCount  = requests.filter((r) => r.urgency_level === 'critical' && r.status === 'open').length;
  const totalResponses = requests.reduce((sum, r) => sum + (r.donor_responses_count ?? 0), 0);

  if (loading) return <LoadingState label="Chargement du tableau de bord..." />;
  if (error)   return <ErrorState message={error} onRetry={() => loadRequests()} />;

  const ListHeader = (
    <>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>🏥 HÔPITAL</Text>
            </View>
            <Text style={styles.headerName}>Bonjour, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.headerSub}>{user?.city ?? 'Tableau de bord'}</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('HospitalProfile')}
          >
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? '?'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Stats cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: Colors.info + '12', borderColor: Colors.info + '30' }]}>
          <Text style={[styles.statNumber, { color: Colors.info }]}>{requests.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.successLight, borderColor: Colors.success + '30' }]}>
          <Text style={[styles.statNumber, { color: Colors.success }]}>{openCount}</Text>
          <Text style={styles.statLabel}>Ouverts</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.criticalLight, borderColor: Colors.critical + '30' }]}>
          <Text style={[styles.statNumber, { color: Colors.critical }]}>{criticalCount}</Text>
          <Text style={styles.statLabel}>Critiques</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.warningLight, borderColor: Colors.warning + '30' }]}>
          <Text style={[styles.statNumber, { color: Colors.warning }]}>{totalResponses}</Text>
          <Text style={styles.statLabel}>Réponses</Text>
        </View>
      </View>

      {/* Actions rapides */}
      <View style={styles.quickSection}>
        <Text style={styles.sectionLabel}>Actions rapides</Text>
        <View style={styles.quickGrid}>
          {[
            { icon: '📊', label: 'Dashboard',  color: Colors.info,    bg: Colors.infoLight,     onPress: () => navigation.navigate('HospitalDashboard') },
            { icon: '📋', label: 'Demandes',   color: Colors.primary, bg: Colors.primarySoft,   onPress: () => navigation.navigate('HospitalRequests') },
            { icon: '➕', label: 'Créer',      color: Colors.success, bg: Colors.successLight,  onPress: () => navigation.navigate('CreateBloodRequest') },
            { icon: '⚙️', label: 'Profil',     color: Colors.gray600, bg: Colors.gray100,       onPress: () => navigation.navigate('HospitalProfile') },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.quickAction, { backgroundColor: a.bg }]}
              onPress={a.onPress}
              activeOpacity={0.75}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: a.color + '20' }]}>
                <Text style={styles.quickActionEmoji}>{a.icon}</Text>
              </View>
              <Text style={[styles.quickActionLabel, { color: a.color }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CTA créer une demande */}
      <TouchableOpacity
        style={styles.createCta}
        onPress={() => navigation.navigate('CreateBloodRequest')}
        activeOpacity={0.85}
      >
        <View style={styles.createCtaLeft}>
          <Text style={styles.createCtaIcon}>🩸</Text>
          <View>
            <Text style={styles.createCtaTitle}>Nouvelle demande de sang</Text>
            <Text style={styles.createCtaSub}>Publiez un besoin urgent en 30 secondes</Text>
          </View>
        </View>
        <Text style={styles.createCtaArrow}>→</Text>
      </TouchableOpacity>

      {/* Titre liste */}
      <View style={styles.listTitleRow}>
        <Text style={styles.sectionTitle}>Demandes récentes</Text>
        <TouchableOpacity onPress={() => navigation.navigate('HospitalRequests')}>
          <Text style={styles.seeAll}>Voir tout →</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.info} />

      <FlatList
        data={requests.slice(0, 6)}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadRequests(true); }}
            tintColor={Colors.info}
            colors={[Colors.info]}
          />
        }
        renderItem={({ item }) => {
          const st = STATUS_MAP[item.status] ?? STATUS_MAP.open;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('BloodRequestDetail', { requestId: item.id })}
              activeOpacity={0.82}
            >
              <View style={styles.cardTop}>
                <BloodTypeBadge bloodType={item.blood_type} size="md" />
                <View style={styles.cardMeta}>
                  <UrgencyBadge level={item.urgency_level} size="sm" />
                  <View style={styles.cityRow}>
                    <Text style={styles.cityIcon}>📍</Text>
                    <Text style={styles.cityText}>{item.city ?? 'Ville inconnue'}</Text>
                  </View>
                </View>
                <View style={[styles.statusChip, { backgroundColor: st.bg }]}>
                  <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
              ) : null}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏥</Text>
            <Text style={styles.emptyTitle}>Aucune demande</Text>
            <Text style={styles.emptyText}>Créez votre première demande de sang pour commencer.</Text>
            <TouchableOpacity style={styles.emptyAction} onPress={() => navigation.navigate('CreateBloodRequest')}>
              <Text style={styles.emptyActionText}>Créer une demande</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <BottomTabs tabs={HOSP_TABS(navigation)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingBottom: 24 },

  // Header bleu hôpital
  headerSafe: { backgroundColor: Colors.info },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    backgroundColor: Colors.info,
  },
  headerLeft: { gap: 4, flex: 1 },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  badgePillText: { fontSize: 10, fontWeight: '800', color: Colors.white, letterSpacing: 1.5 },
  headerName: { fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.72)', fontWeight: '500' },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: Colors.white },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: -14,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },

  // Quick actions
  quickSection: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionEmoji: { fontSize: 18 },
  quickActionLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  // CTA créer
  createCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.info,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 18,
    shadowColor: Colors.info,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  createCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  createCtaIcon: { fontSize: 26 },
  createCtaTitle: { fontSize: 15, fontWeight: '700', color: Colors.white },
  createCtaSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  createCtaArrow: { fontSize: 20, color: Colors.white, fontWeight: '700' },

  // Titre liste
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.2 },
  seeAll: { fontSize: 13, fontWeight: '700', color: Colors.info },

  // Cartes
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardMeta: { flex: 1, gap: 5 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cityIcon: { fontSize: 11 },
  cityText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

  // Vide
  emptyState: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 40, gap: 10 },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21 },
  emptyAction: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: Colors.info,
    borderRadius: 20,
  },
  emptyActionText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
