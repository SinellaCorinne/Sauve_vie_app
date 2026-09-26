import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
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
import { hospitalRoutes } from '../config/api';
import { Colors } from '../theme/colors';
import BottomTabs from '../components/BottomTabs';

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalProfile'>;

export default function HospitalProfileScreen({ navigation }: Props) {
  const { user, token, setSession, signOut } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch(hospitalRoutes.profile, { name, phone, city });
      if (user && token) {
        await setSession(token, { ...user, name, phone, city });
      }
      Alert.alert('✅ Profil mis à jour', 'Vos informations ont été enregistrées.');
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil.');
    } finally {
      setSaving(false);
    }
  };

  const initials = name
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.info} />
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
                <Text style={styles.backBtnText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Mon profil</Text>
              <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                <Text style={styles.logoutBtnText}>Quitter</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Avatar section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.profileName}>{user?.name || 'Hôpital'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>🏥 Établissement de santé</Text>
            </View>
          </View>

          {/* Informations modifiables */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informations de l'établissement</Text>

            {[
              { key: 'name', label: 'Nom du responsable', icon: '👤', value: name, setter: setName, placeholder: 'Nom et prénom' },
              { key: 'phone', label: 'Téléphone', icon: '📞', value: phone, setter: setPhone, placeholder: '021 000 000', keyboard: 'phone-pad' as const },
              { key: 'city', label: 'Ville', icon: '📍', value: city, setter: setCity, placeholder: 'Alger, Oran...' },
            ].map((field) => (
              <View key={field.key} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <View style={[styles.inputWrapper, focusedField === field.key && styles.inputFocused]}>
                  <Text style={styles.fieldIcon}>{field.icon}</Text>
                  <TextInput
                    style={styles.input}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType={field.keyboard ?? 'default'}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Infos lecture seule */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Compte</Text>
            <View style={styles.readRow}>
              <Text style={styles.readLabel}>Email</Text>
              <Text style={styles.readValue} numberOfLines={1}>{user?.email}</Text>
            </View>
            <View style={styles.readDivider} />
            <View style={styles.readRow}>
              <Text style={styles.readLabel}>Rôle</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>🏥 Hôpital</Text>
              </View>
            </View>
          </View>

          {/* Stats rapides */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Votre espace</Text>
            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => navigation.navigate('HospitalRequests')}
              >
                <Text style={styles.statIcon}>📋</Text>
                <Text style={styles.statLabel}>Mes demandes</Text>
                <Text style={styles.statCta}>Voir →</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => navigation.navigate('HospitalDashboard')}
              >
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statLabel}>Tableau de bord</Text>
                <Text style={styles.statCta}>Voir →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Boutons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signOutBtn} onPress={signOut} activeOpacity={0.75}>
              <Text style={styles.signOutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomTabs
        tabs={[
          { key: 'home',     label: 'Accueil',  icon: '🏠', onPress: () => navigation.navigate('HospitalHome') },
          { key: 'requests', label: 'Demandes', icon: '📋', onPress: () => navigation.navigate('HospitalRequests') },
          { key: 'create',   label: 'Créer',    icon: '➕', onPress: () => navigation.navigate('CreateBloodRequest') },
          { key: 'profile',  label: 'Profil',   icon: '🏥', active: true, onPress: () => navigation.navigate('HospitalProfile') },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingBottom: 24 },

  // Header
  headerSafe: { backgroundColor: Colors.info },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: Colors.info,
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

  // Avatar
  avatarSection: {
    alignItems: 'center',
    backgroundColor: Colors.info,
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
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
  },
  roleBadgeText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.95)' },

  // Cartes
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
  inputFocused: { borderColor: Colors.info, backgroundColor: Colors.infoLight },
  fieldIcon: { fontSize: 15 },
  input: { flex: 1, fontSize: 15, color: Colors.textDark, padding: 0 },

  // Lecture seule
  readRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  readLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  readValue: { fontSize: 14, color: Colors.textDark, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  readDivider: { height: 1, backgroundColor: Colors.borderLight },
  roleTag: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleTagText: { fontSize: 12, fontWeight: '700', color: Colors.info },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statItem: {
    flex: 1,
    backgroundColor: Colors.gray50,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: { fontSize: 22 },
  statLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },
  statCta: { fontSize: 12, fontWeight: '700', color: Colors.info },

  // Footer
  footer: { paddingHorizontal: 16, paddingTop: 20, gap: 10 },
  saveBtn: {
    backgroundColor: Colors.info,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.info,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white, letterSpacing: 0.2 },
  signOutBtn: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
});
