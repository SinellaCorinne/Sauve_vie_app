import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { donorRoutes, bloodRequestRoutes } from '../config/api';
import { RootStackParamList } from '../navigation/AppNavigator';
import BottomTabs from '../components/BottomTabs';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import BloodTypeBadge from '../components/BloodTypeBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import { Colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'DonorHome'>;

type BloodRequest = {
  id: number;
  blood_type: string;
  urgency_level: string;
  city?: string;
  description?: string;
  status: string;
};

const DONOR_TABS = (navigation: Props['navigation']) => [
  { key: 'home', label: 'Accueil', icon: '🏠', active: true, onPress: () => navigation.navigate('DonorHome') },
  { key: 'requests', label: 'Demandes', icon: '🩸', onPress: () => navigation.navigate('CompatibleRequests') },
  { key: 'history', label: 'Historique', icon: '📋', onPress: () => navigation.navigate('DonorHistory') },
  { key: 'profile', label: 'Profil', icon: '👤', onPress: () => navigation.navigate('DonorProfile') },
];

export default function DonorHomeScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const response = await api.get(donorRoutes.compatibility);
      setRequests(response.data.data || response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Impossible de charger les demandes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const handleRespond = async (id: number) => {
    try {
      await api.post(bloodRequestRoutes.respond(id), { note: 'Je suis disponible immédiatement.' });
      Alert.alert('✅ Réponse envoyée', 'Votre disponibilité a bien été signalée.');
    } catch (error: any) {
      Alert.alert('Erreur', error?.response?.data?.message || 'Impossible de répondre à cette demande.');
    }
  };

  const criticalCount = requests.filter((r) => r.urgency_level === 'critical').length;

  if (loading) return <LoadingState label="Chargement des demandes..." />;
  if (error) return <ErrorState message={error} onRetry={() => loadRequests()} />;

  const ListHeader = (
    <>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.greetingBadge}>
              <Text style={styles.greetingBadgeText}>🩸 DONNEUR</Text>
            </View>
            <Text style={styles.headerName}>Bonjour, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.headerSub}>{user?.blood_type ? `Groupe ${user.blood_type}` : 'Profil donneur'}</Text>
          </View>
          <TouchableOpacity style={styles.avatarButton} onPress={() => navigation.navigate('DonorProfile')}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? '?'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bannière urgence */}
      {criticalCount > 0 && (
        <TouchableOpacity
          style={styles.urgencyBanner}
          onPress={() => navigation.navigate('UrgencyAlert')}
          activeOpacity={0.85}
        >
          <View style={styles.urgencyBannerLeft}>
            <Text style={styles.urgencyBannerIcon}>🚨</Text>
            <View>
              <Text style={styles.urgencyBannerTitle}>{criticalCount} demande{criticalCount > 1 ? 's' : ''} critique{criticalCount > 1 ? 's' : ''}</Text>
              <Text style={styles.urgencyBannerSub}>Votre aide est urgente !</Text>
            </View>
          </View>
          <Text style={styles.urgencyBannerArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Actions rapides */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionLabel}>Actions rapides</Text>
        <View style={styles.quickActionsGrid}>
          {[
            { icon: '🩸', label: 'Demandes', color: Colors.primary, bg: Colors.primarySoft, onPress: () => navigation.navigate('CompatibleRequests') },
            { icon: '🚨', label: 'Urgence', color: '#E74C3C', bg: '#FDF2F0', onPress: () => navigation.navigate('UrgencyAlert') },
            { icon: '📋', label: 'Historique', color: Colors.info, bg: Colors.infoLight, onPress: () => navigation.navigate('DonorHistory') },
            { icon: '⚙️', label: 'Profil', color: Colors.gray600, bg: Colors.gray100, onPress: () => navigation.navigate('DonorProfile') },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.quickAction, { backgroundColor: action.bg }]}
              onPress={action.onPress}
              activeOpacity={0.75}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <Text style={styles.quickActionEmoji}>{action.icon}</Text>
              </View>
              <Text style={[styles.quickActionLabel, { color: action.color }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Titre section liste */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Demandes compatibles</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{requests.length}</Text>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <FlatList
        data={requests}
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
          <View style={[styles.card, item.urgency_level === 'critical' && styles.cardCritical]}>
            {/* En-tête de carte */}
            <View style={styles.cardTop}>
              <BloodTypeBadge bloodType={item.blood_type} size="lg" />
              <View style={styles.cardTopRight}>
                <UrgencyBadge level={item.urgency_level} />
                <View style={styles.cityRow}>
                  <Text style={styles.cityIcon}>📍</Text>
                  <Text style={styles.cityText}>{item.city || 'Ville inconnue'}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            {item.description ? (
              <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
            ) : null}

            {/* Actions */}
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}
                activeOpacity={0.8}
              >
                <Text style={styles.detailButtonText}>Voir les détails</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.respondButton}
                onPress={() => handleRespond(item.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.respondButtonText}>Je suis dispo ✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>Tout est calme</Text>
            <Text style={styles.emptyText}>Aucune demande compatible pour le moment. Revenez plus tard.</Text>
          </View>
        }
      />

      <BottomTabs tabs={DONOR_TABS(navigation)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingBottom: 24 },

  // Header
  headerSafe: {
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    backgroundColor: Colors.primary,
  },
  headerLeft: { gap: 4, flex: 1 },
  greetingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  greetingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1.5,
  },
  headerName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
  },
  avatarButton: {
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
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },

  // Bannière urgence
  urgencyBanner: {
    backgroundColor: Colors.criticalLight,
    marginHorizontal: 16,
    marginTop: -14,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  urgencyBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  urgencyBannerIcon: { fontSize: 22 },
  urgencyBannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.critical },
  urgencyBannerSub: { fontSize: 12, color: Colors.critical, opacity: 0.75 },
  urgencyBannerArrow: { fontSize: 18, color: Colors.critical, fontWeight: '700' },

  // Quick actions
  quickActionsSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
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
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Section liste
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.2,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },

  // Cartes
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    padding: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  cardCritical: {
    borderWidth: 1.5,
    borderColor: Colors.critical + '35',
    backgroundColor: '#FFFAFA',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  cardTopRight: {
    flex: 1,
    gap: 8,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityIcon: { fontSize: 12 },
  cityText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textBody,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  detailButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.gray100,
  },
  detailButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  respondButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  respondButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
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
});
