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
import api from '../services/api';
import { hospitalRoutes } from '../config/api';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import BloodTypeBadge from '../components/BloodTypeBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import BottomTabs from '../components/BottomTabs';

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalDashboard'>;

type RequestItem = {
  id: number;
  blood_type: string;
  urgency_level: string;
  status: string;
  city?: string;
  donor_responses_count?: number;
  confirmed_donors_count?: number;
};

// Comptage des groupes sanguins demandés
function getBloodTypeStats(requests: RequestItem[]) {
  const map: Record<string, number> = {};
  requests.forEach((r) => {
    map[r.blood_type] = (map[r.blood_type] ?? 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
}

export default function HospitalDashboardScreen({ navigation }: Props) {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const response = await api.get(hospitalRoutes.myRequests);
      setRequests(response.data.data || response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Impossible de charger les données.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState label="Chargement du tableau de bord..." />;
  if (error)   return <ErrorState message={error} onRetry={() => load()} />;

  const open      = requests.filter((r) => r.status === 'open').length;
  const fulfilled = requests.filter((r) => r.status === 'fulfilled').length;
  const expired   = requests.filter((r) => r.status === 'expired').length;
  const critical  = requests.filter((r) => r.urgency_level === 'critical' && r.status === 'open').length;
  const totalResp = requests.reduce((s, r) => s + (r.donor_responses_count ?? 0), 0);
  const confirmed = requests.reduce((s, r) => s + (r.confirmed_donors_count ?? 0), 0);
  const bloodStats = getBloodTypeStats(requests);

  const METRICS = [
    { label: 'Total',      value: requests.length, color: Colors.info,    bg: Colors.infoLight    },
    { label: 'Ouverts',    value: open,             color: Colors.success, bg: Colors.successLight },
    { label: 'Satisfaits', value: fulfilled,        color: Colors.primary, bg: Colors.primaryLight },
    { label: 'Expirés',    value: expired,          color: Colors.gray500, bg: Colors.gray100      },
    { label: 'Critiques',  value: critical,         color: Colors.critical,bg: Colors.criticalLight},
    { label: 'Réponses',   value: totalResp,        color: Colors.warning, bg: Colors.warningLight },
  ];

  const ListHeader = (
    <>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Tableau de bord</Text>
            <Text style={styles.headerSub}>Vue d'ensemble de vos demandes</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      {/* Métriques 2x3 */}
      <View style={styles.metricsGrid}>
        {METRICS.map((m) => (
          <View key={m.label} style={[styles.metricCard, { backgroundColor: m.bg, borderColor: m.color + '25' }]}>
            <Text style={[styles.metricNumber, { color: m.color }]}>{m.value}</Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      {/* Groupes sanguins demandés */}
      {bloodStats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Groupes les plus demandés</Text>
          <View style={styles.bloodStatsRow}>
            {bloodStats.map(([type, count]) => (
              <View key={type} style={styles.bloodStatItem}>
                <BloodTypeBadge bloodType={type} size="sm" />
                <Text style={styles.bloodStatCount}>{count}×</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Taux de satisfaction */}
      {requests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taux de satisfaction</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round((fulfilled / requests.length) * 100)}%` as any },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {Math.round((fulfilled / requests.length) * 100)}% satisfait
            </Text>
          </View>
          <View style={styles.progressLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.legendText}>Satisfaites : {fulfilled}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.info }]} />
              <Text style={styles.legendText}>Confirmés : {confirmed}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Titre liste récente */}
      <View style={styles.listTitleRow}>
        <Text style={styles.listTitle}>Demandes récentes</Text>
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
        data={requests.slice(0, 5)}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(true); }}
            tintColor={Colors.info}
            colors={[Colors.info]}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('BloodRequestDetail', { requestId: item.id })}
            activeOpacity={0.82}
          >
            <View style={styles.cardRow}>
              <BloodTypeBadge bloodType={item.blood_type} size="md" />
              <View style={styles.cardInfo}>
                <UrgencyBadge level={item.urgency_level} size="sm" />
                <Text style={styles.cardCity}>📍 {item.city ?? 'Ville inconnue'}</Text>
              </View>
              <View style={styles.cardRespBox}>
                <Text style={styles.cardRespNum}>{item.donor_responses_count ?? 0}</Text>
                <Text style={styles.cardRespLabel}>réponses</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Aucune donnée à afficher.</Text>
          </View>
        }
      />

      <BottomTabs
        tabs={[
          { key: 'home',     label: 'Accueil',  icon: '🏠', onPress: () => navigation.navigate('HospitalHome') },
          { key: 'requests', label: 'Demandes', icon: '📋', onPress: () => navigation.navigate('HospitalRequests') },
          { key: 'create',   label: 'Créer',    icon: '➕', onPress: () => navigation.navigate('CreateBloodRequest') },
          { key: 'profile',  label: 'Profil',   icon: '🏥', onPress: () => navigation.navigate('HospitalProfile') },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingBottom: 24 },

  // Header
  headerSafe: { backgroundColor: Colors.info },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: Colors.info,
    gap: 12,
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
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.72)', fontWeight: '500', marginTop: 1 },
  headerRight: { width: 38 },

  // Métriques
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 8,
  },
  metricCard: {
    width: '30.5%',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  metricNumber: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  metricLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  // Sections
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    padding: 18,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Blood type stats
  bloodStatsRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  bloodStatItem: { alignItems: 'center', gap: 4 },
  bloodStatCount: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },

  // Barre de progression
  progressContainer: { gap: 8 },
  progressBar: {
    height: 10,
    backgroundColor: Colors.gray100,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 5,
  },
  progressLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  progressLegend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  // Titre liste
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  listTitle: { fontSize: 17, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.2 },
  seeAll: { fontSize: 13, fontWeight: '700', color: Colors.info },

  // Cartes
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 14,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardInfo: { flex: 1, gap: 4 },
  cardCity: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  cardRespBox: { alignItems: 'center', backgroundColor: Colors.infoLight, borderRadius: 10, padding: 8, minWidth: 52 },
  cardRespNum: { fontSize: 18, fontWeight: '800', color: Colors.info },
  cardRespLabel: { fontSize: 10, color: Colors.info, fontWeight: '600' },

  // Vide
  emptyState: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
});
