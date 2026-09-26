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
import { Colors } from '../theme/colors';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import BloodTypeBadge from '../components/BloodTypeBadge';
import BottomTabs from '../components/BottomTabs';

type Props = NativeStackScreenProps<RootStackParamList, 'DonorHistory'>;

type HistoryItem = {
  id: number;
  blood_request?: { blood_type?: string; city?: string; urgency_level?: string };
  status?: string;
  created_at?: string;
};

const RESPONSE_STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:   { label: 'En attente',   color: Colors.warning,  bg: Colors.warningLight,  icon: '⏳' },
  confirmed: { label: 'Confirmé',     color: Colors.success,  bg: Colors.successLight,  icon: '✅' },
  rejected:  { label: 'Non retenu',   color: Colors.gray500,  bg: Colors.gray100,       icon: '○'  },
  default:   { label: 'Répondu',      color: Colors.info,     bg: Colors.infoLight,     icon: '📋' },
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function DonorHistoryScreen({ navigation }: Props) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const response = await api.get(donorRoutes.history);
      setHistory(response.data.data || response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Impossible de charger l\'historique.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState label="Chargement de l'historique..." />;
  if (error) return <ErrorState message={error} onRetry={() => load()} />;

  const ListHeader = (
    <SafeAreaView style={styles.headerSafe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>◀️</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Mes dons</Text>
          <Text style={styles.headerSub}>{history.length} réponse{history.length !== 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>
    </SafeAreaView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <FlatList
        data={history}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(true); }}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        renderItem={({ item, index }) => {
          const statusKey = item.status ?? 'default';
          const statusInfo = RESPONSE_STATUS_MAP[statusKey] ?? RESPONSE_STATUS_MAP.default;
          const bloodType = item.blood_request?.blood_type;

          return (
            <View style={styles.card}>
              {/* Indicateur de timeline */}
              <View style={styles.timelineCol}>
                <View style={[styles.timelineDot, { backgroundColor: statusInfo.color }]} />
                {index < history.length - 1 && <View style={styles.timelineLine} />}
              </View>

              {/* Contenu */}
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  {bloodType ? (
                    <BloodTypeBadge bloodType={bloodType} size="md" />
                  ) : (
                    <View style={styles.unknownBadge}>
                      <Text style={styles.unknownText}>?</Text>
                    </View>
                  )}
                  <View style={styles.cardInfo}>
                    <View style={[styles.statusChip, { backgroundColor: statusInfo.bg }]}>
                      <Text style={styles.statusChipIcon}>{statusInfo.icon}</Text>
                      <Text style={[styles.statusChipText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                      </Text>
                    </View>
                    {item.blood_request?.city && (
                      <View style={styles.cityRow}>
                        <Text style={styles.cityIcon}>📍</Text>
                        <Text style={styles.cityText}>{item.blood_request.city}</Text>
                      </View>
                    )}
                  </View>
                </View>
                {item.created_at && (
                  <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Aucun don pour le moment</Text>
            <Text style={styles.emptyText}>
              Répondez à des demandes compatibles pour voir votre historique apparaître ici.
            </Text>
            <TouchableOpacity
              style={styles.emptyAction}
              onPress={() => navigation.navigate('CompatibleRequests')}
            >
              <Text style={styles.emptyActionText}>Voir les demandes →</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <BottomTabs
        tabs={[
          { key: 'home', label: 'Accueil', icon: '🏠', onPress: () => navigation.navigate('DonorHome') },
          { key: 'requests', label: 'Demandes', icon: '🩸', onPress: () => navigation.navigate('CompatibleRequests') },
          { key: 'history', label: 'Historique', icon: '📋', active: true, onPress: () => navigation.navigate('DonorHistory') },
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: Colors.primary,
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

  // Cartes timeline
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 6,
    gap: 12,
  },
  timelineCol: {
    alignItems: 'center',
    paddingTop: 18,
    width: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  cardBody: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
    marginBottom: 8,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardInfo: { flex: 1, gap: 5 },
  unknownBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  unknownText: { fontSize: 18, color: Colors.textLight, fontWeight: '700' },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusChipIcon: { fontSize: 11 },
  statusChipText: { fontSize: 12, fontWeight: '700' },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cityIcon: { fontSize: 11 },
  cityText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  dateText: { fontSize: 11, color: Colors.textLight, fontWeight: '500' },

  // État vide
  emptyState: {
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  emptyAction: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  emptyActionText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
