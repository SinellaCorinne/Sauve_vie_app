import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { donorRoutes } from '../config/api';
import { Colors } from '../theme/colors';
import BottomTabs from '../components/BottomTabs';
import BloodTypeBadge from '../components/BloodTypeBadge';

type Props = NativeStackScreenProps<RootStackParamList, 'DonorProfile'>;

export default function DonorProfileScreen({ navigation }: Props) {
  const { user, token, setSession, signOut } = useAuth();
  const [available, setAvailable] = useState(Boolean(user?.is_available));
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingAvail, setTogglingAvail] = useState(false);

  const handleToggleAvailability = async () => {
    try {
      setTogglingAvail(true);
      const response = await api.patch(donorRoutes.availability);
      const newVal = Boolean(response.data.is_available);
      setAvailable(newVal);
      if (user && token) {
        await setSession(token, { ...user, is_available: newVal });
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour la disponibilité.');
    } finally {
      setTogglingAvail(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch(donorRoutes.profile, { phone, city });
      if (user && token) {
        await setSession(token, { ...user, phone, city });
      }
      Alert.alert('✅ Profil mis à jour', 'Vos informations ont été enregistrées.');
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil.');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <SafeAreaView style={styles.headerSafe}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backBtnText}>◀️</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Mon profil</Text>
              <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                <Text style={styles.logoutBtnText}>Quitter</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Avatar + nom */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {user?.blood_type && (
              <View style={styles.bloodTypeRow}>
                <BloodTypeBadge bloodType={user.blood_type} size="sm" />
                <Text style={styles.bloodTypeLabel}>Groupe sanguin</Text>
              </View>
            )}
          </View>

          {/* Disponibilité */}
          <View style={styles.card}>
            <View style={styles.availabilityRow}>
              <View style={styles.availabilityLeft}>
                <View style={[styles.availIcon, { backgroundColor: available ? Colors.successLight : Colors.gray100 }]}>
                  <Text style={styles.availIconText}>{available ? '✅' : '⏸️'}</Text>
                </View>
                <View>
                  <Text style={styles.availLabel}>Disponible pour donner</Text>
                  <Text style={[styles.availStatus, { color: available ? Colors.success : Colors.textSecondary }]}>
                    {available ? 'Vous êtes disponible' : 'Non disponible'}
                  </Text>
                </View>
              </View>
              <Switch
                value={available}
                onValueChange={handleToggleAvailability}
                disabled={togglingAvail}
                trackColor={{ false: Colors.gray200, true: Colors.success + '80' }}
                thumbColor={available ? Colors.success : Colors.gray400}
                ios_backgroundColor={Colors.gray200}
              />
            </View>
            <Text style={styles.availHint}>
              Activez cette option pour apparaître dans les recherches de donneurs compatibles.
            </Text>
          </View>

          {/* Informations modifiables */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informations de contact</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Téléphone</Text>
              <View style={[styles.inputWrapper, focusedField === 'phone' && styles.inputFocused]}>
                <Text style={styles.fieldIcon}>📞</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="0555 000 000"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Ville</Text>
              <View style={[styles.inputWrapper, focusedField === 'city' && styles.inputFocused]}>
                <Text style={styles.fieldIcon}>📍</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Alger, Oran..."
                  placeholderTextColor={Colors.textMuted}
                  onFocus={() => setFocusedField('city')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
          </View>

          {/* Infos non modifiables */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Compte</Text>
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>Nom</Text>
              <Text style={styles.readOnlyValue}>{user?.name}</Text>
            </View>
            <View style={styles.readOnlyDivider} />
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>Email</Text>
              <Text style={styles.readOnlyValue}>{user?.email}</Text>
            </View>
            <View style={styles.readOnlyDivider} />
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>Rôle</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>🩸 Donneur</Text>
              </View>
            </View>
          </View>

          {/* Boutons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signOutButton} onPress={signOut} activeOpacity={0.75}>
              <Text style={styles.signOutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomTabs
        tabs={[
          { key: 'home', label: 'Accueil', icon: '🏠', onPress: () => navigation.navigate('DonorHome') },
          { key: 'requests', label: 'Demandes', icon: '🩸', onPress: () => navigation.navigate('CompatibleRequests') },
          { key: 'history', label: 'Historique', icon: '📋', onPress: () => navigation.navigate('DonorHistory') },
          { key: 'profile', label: 'Profil', icon: '👤', active: true, onPress: () => navigation.navigate('DonorProfile') },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingBottom: 24 },

  // Header
  headerSafe: { backgroundColor: Colors.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  logoutBtnText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingBottom: 28,
    gap: 4,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: Colors.white },
  profileName: { fontSize: 20, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.72)', fontWeight: '500' },
  bloodTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bloodTypeLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  // Carte générique
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 18,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Disponibilité
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  availIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  availIconText: { fontSize: 20 },
  availLabel: { fontSize: 15, fontWeight: '600', color: Colors.textDark },
  availStatus: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  availHint: { fontSize: 12, color: Colors.textLight, lineHeight: 18 },

  // Champs
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  inputFocused: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  fieldIcon: { fontSize: 15 },
  input: { flex: 1, fontSize: 15, color: Colors.textDark, padding: 0 },

  // Infos lecture seule
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  readOnlyLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  readOnlyValue: { fontSize: 14, color: Colors.textDark, fontWeight: '600', maxWidth: '65%', textAlign: 'right' },
  readOnlyDivider: { height: 1, backgroundColor: Colors.borderLight },
  roleBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  // Footer
  footer: { paddingHorizontal: 16, paddingTop: 20, gap: 10 },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: Colors.white, letterSpacing: 0.2 },
  signOutButton: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
});
