import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../services/api';
import { donorRoutes } from '../config/api';
import { RootStackParamList } from '../navigation/AppNavigator';
import BottomTabs from '../components/BottomTabs';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import BloodTypeBadge from '../components/BloodTypeBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import { Colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'CompatibleRequests'>;

type RequestItem = {
  id: number;
  blood_type: string;
  urgency_level: string;
  description?: string;
  city?: string;
  status: string;
};

const FILTERS = [
  { key: 'Tous', label: 'Tous', icon: '📋' },
  { key: 'Critique', label: 'Critique', icon: '🚨' },
  { key: 'Urgent', label: 'Urgent', icon: '⚡' },
  { key: 'Normal', label: 'Normal', icon: '✅' },
];

const STATUS_COLORS: Record<string, string> = {
  open: Colors.success,
  fulfilled: Colors.info,
  expired: Colors.gray400,
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Ouvert',
  fulfilled: 'Satisfait',
  expired: 'Expiré',
};

export default function CompatibleRequestsScreen({ navigation }: Props) {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('Tous');

  const loadRequests = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const response = await api.get(donorRoutes.compatibility);
      const requestsData = response?.data?.requests?.data ?? response?.data?.data ?? response?.data ?? [];
      setRequests(requestsData);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Impossible de charger les demandes compatibles.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const filteredRequests = requests.filter((item) => {
    if (selectedFilter === 'Tous') return true;
    if (selectedFilter === 'Critique') return item.urgency_level === 'critical';
    if (selectedFilter === 'Urgent') return item.urgency_level === 'urgent';
    return item.urgency_level === 'normal';
  });

  if (loading) return <LoadingState label="Recherche de demandes compatibles..." />;
  if (error) return <ErrorState message={error} onRetry={() => loadRequests()} />;

  const ListHeader = (
    <>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Demandes compatibles</Text>
            <Text style={styles.headerSub}>Correspondant à votre profil</Text>
          </View>
          <View style={styles.countCircle}>
            <Text style={styles.countNumber}>{filteredRequests.length}</Text>
            <Text style={styles.countLabel}>résultats</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Filtres */}
      <View style={styles.filterSection}>
        {FILTERS.map((f) => {
          const isActive = selectedFilter === f.key;
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
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

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
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}
            activeOpacity={0.82}
          >
            {/* Top */}
            <View style={styles.cardTop}>
              <BloodTypeBadge bloodType={item.blood_type} size="lg" />
              <View style={styles.cardInfo}>
                <UrgencyBadge level={item.urgency_level} />
                <View style={styles.metaRow}>
                  <Text style={styles.metaIcon}>📍</Text>
                  <Text style={styles.metaText}>{item.city || 'Ville inconnue'}</Text>
                  <View style={styles.dot} />
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] ?? Colors.gray400 }]} />
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] ?? Colors.gray400 }]}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </View>

            {/* Description */}
            {item.description ? (
              <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'Tous'
                ? 'Aucune demande compatible pour le moment.'
                : `Aucune demande de niveau "${selectedFilter}" pour le moment.`}
            </Text>
            {selectedFilter !== 'Tous' && (
              <TouchableOpacity onPress={() => setSelectedFilter('Tous')} style={styles.resetFilter}>
                <Text style={styles.resetFilterText}>Voir toutes les demandes</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <BottomTabs
        tabs={[
          { key: 'home', label: 'Accueil', icon: '🏠', onPress: () => navigation.navigate('DonorHome') },
          { key: 'requests', label: 'Demandes', icon: '🩸', active: true, onPress: () => navigation.navigate('CompatibleRequests') },
          { key: 'history', label: 'Historique', icon: '📋', onPress: () => navigation.navigate('DonorHistory') },
          { key: 'profile', label: 'Profil', icon: '👤', onPress: () => navigation.navigate('DonorProfile') },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingBottom: 24 },

  // Header
  headerSafe: { backgroundColor: Colors.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
    marginTop: 2,
  },
  countCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  countNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 22,
  },
  countLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.3,
  },

  // Filtres
  filterSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterChipIcon: { fontSize: 13 },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

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
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardInfo: {
    flex: 1,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  metaIcon: { fontSize: 11 },
  metaText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.border,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardArrow: {
    fontSize: 22,
    color: Colors.gray300,
    fontWeight: '300',
  },
  cardDescription: {
    fontSize: 13,
    color: Colors.textBody,
    lineHeight: 19,
  },

  // État vide
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  resetFilter: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
  },
  resetFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
