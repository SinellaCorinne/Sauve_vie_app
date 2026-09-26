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
import BottomTabs from '../components/BottomTabs';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import BloodTypeBadge from '../components/BloodTypeBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import { Colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalRequests'>;

type RequestItem = {
  id: number;
  blood_type: string;
  urgency_level: string;
  status: string;
  city?: string;
  description?: string;
  donor_responses_count?: number;
};

const FILTERS = [
  { key: 'Tous',     label: 'Tous',     icon: '📋' },
  { key: 'Ouvert',   label: 'Ouverts',  icon: '🟢' },
  { key: 'Satisfait',label: 'Satisfaits',icon: '✅' },
  { key: 'Expiré',   label: 'Expirés',  icon: '⏰' },
];

const STATUS_MAP: Record<string, { color: string; bg: string; label: string; dot: string }> = {
  open:      { color: Colors.success,  bg: Colors.successLight, label: 'Ouvert',    dot: '🟢' },
  fulfilled: { color: Colors.info,     bg: Colors.infoLight,    label: 'Satisfait', dot: '✅' },
  expired:   { color: Colors.gray400,  bg: Colors.gray100,      label: 'Expiré',    dot: '⏰' },
};

export default function HospitalRequestsScreen({ navigation }: Props) {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('Tous');

  const loadRequests = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const response = await api.get(hospitalRoutes.myRequests);
      setRequests(response.data.data || response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Impossible de charger les demandes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const filteredRequests = requests.filter((item) => {
    if (selectedFilter === 'Tous')      return true;
    if (selectedFilter === 'Ouvert')    return item.status === 'open';
    if (selectedFilter === 'Satisfait') return item.status === 'fulfilled';
    return item.status === 'expired';
  });

  if (loading) return <LoadingState label="Chargement des demandes..." />;
  if (error)   return <ErrorState message={error} onRetry={() => loadRequests()} />;

  const ListHeader = (
    <>
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Mes demandes</Text>
            <Text style={styles.headerSub}>
              {filteredRequests.length} résultat{filteredRequests.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('CreateBloodRequest')}
            activeOpacity={0.85}
          >
            <Text style={styles.createBtnText}>+ Nouvelle</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Filtres */}
      <View style={styles.filterSection}>
        {FILTERS.map((f) => {
          const isActive = selectedFilter === f.key;
          // Compter par filtre
          const count = f.key === 'Tous'
            ? requests.length
            : requests.filter((r) => {
                if (f.key === 'Ouvert')    return r.status === 'open';
                if (f.key === 'Satisfait') return r.status === 'fulfilled';
                return r.status === 'expired';
              }).length;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedFilter(f.key)}
              activeOpacity={0.75}
            >
              <Text style={styles.filterChipIcon}>{f.icon}</Text>
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {f.label}
              </Text>
              <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.info} />

      <FlatList
        data={filteredRequests}
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
                <View style={styles.cardInfo}>
                  <UrgencyBadge level={item.urgency_level} size="sm" />
                  <View style={styles.metaRow}>
                    <Text style={styles.metaIcon}>📍</Text>
                    <Text style={styles.metaText}>{item.city ?? 'Ville inconnue'}</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                  </View>
                  {(item.donor_responses_count ?? 0) > 0 && (
                    <View style={styles.respBadge}>
                      <Text style={styles.respBadgeText}>{item.donor_responses_count} 👤</Text>
                    </View>
                  )}
                </View>
              </View>
              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
              ) : null}
              <View style={styles.cardFooter}>
                <Text style={styles.cardCta}>Voir les détails →</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Aucune demande</Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'Tous'
                ? 'Aucune demande créée pour le moment.'
                : `Aucune demande avec le filtre "${selectedFilter}".`}
            </Text>
            {selectedFilter !== 'Tous' ? (
              <TouchableOpacity style={styles.resetBtn} onPress={() => setSelectedFilter('Tous')}>
                <Text style={styles.resetBtnText}>Voir toutes les demandes</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.emptyCreateBtn}
                onPress={() => navigation.navigate('CreateBloodRequest')}
              >
                <Text style={styles.emptyCreateBtnText}>Créer une demande</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <BottomTabs
        tabs={[
          { key: 'home',     label: 'Accueil',  icon: '🏠', onPress: () => navigation.navigate('HospitalHome') },
          { key: 'requests', label: 'Demandes', icon: '📋', active: true, onPress: () => navigation.navigate('HospitalRequests') },
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: Colors.info,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.72)', fontWeight: '500', marginTop: 2 },
  createBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  createBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },

  // Filtres
  filterSection: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.infoLight,
    borderColor: Colors.info,
  },
  filterChipIcon: { fontSize: 12 },
  filterChipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.info, fontWeight: '700' },
  filterCount: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
  },
  filterCountActive: { backgroundColor: Colors.info + '25' },
  filterCountText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  filterCountTextActive: { color: Colors.info },

  // Cartes
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 18,
    padding: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardInfo: { flex: 1, gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaIcon: { fontSize: 11 },
  metaText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  respBadge: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  respBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.info },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
  },
  cardCta: { fontSize: 13, fontWeight: '700', color: Colors.info },

  // Vide
  emptyState: { alignItems: 'center', paddingTop: 56, paddingHorizontal: 40, gap: 12 },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21 },
  resetBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.infoLight,
    borderRadius: 20,
  },
  resetBtnText: { fontSize: 13, fontWeight: '700', color: Colors.info },
  emptyCreateBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: Colors.info,
    borderRadius: 20,
  },
  emptyCreateBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
