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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../services/api';
import { bloodRequestRoutes } from '../config/api';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateBloodRequest'>;

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const URGENCY_LEVELS = [
  { key: 'critical', label: 'Critique',  icon: '🚨', desc: 'Urgence vitale immédiate',    color: Colors.critical, bg: Colors.criticalLight },
  { key: 'urgent',   label: 'Urgent',    icon: '⚡', desc: 'Dans les prochaines heures',  color: Colors.warning,  bg: Colors.warningLight  },
  { key: 'normal',   label: 'Normal',    icon: '✅', desc: 'Besoin planifié',             color: Colors.success,  bg: Colors.successLight  },
];

type FormState = {
  blood_type: string;
  urgency_level: string;
  description: string;
  expires_at: string;
};

export default function CreateBloodRequestScreen({ navigation }: Props) {
  const [form, setForm] = useState<FormState>({
    blood_type: '',
    urgency_level: '',
    description: '',
    expires_at: '',
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isValid = form.blood_type && form.urgency_level && form.description.trim().length >= 10;

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Champs requis', 'Veuillez choisir un groupe sanguin, un niveau d\'urgence et ajouter une description (min. 10 caractères).');
      return;
    }
    try {
      setLoading(true);
      await api.post(bloodRequestRoutes.list, form);
      Alert.alert('✅ Demande créée', 'Votre demande a été publiée. Les donneurs compatibles seront notifiés.', [
        { text: 'Voir mes demandes', onPress: () => navigation.navigate('HospitalRequests') },
        { text: 'Rester ici', style: 'cancel' },
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error?.response?.data?.message || 'Impossible de créer la demande.');
    } finally {
      setLoading(false);
    }
  };

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
                <Text style={styles.backBtnText}>◀️</Text>
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Nouvelle demande</Text>
                <Text style={styles.headerSub}>Publiez un besoin de sang</Text>
              </View>
              <View style={styles.headerRight} />
            </View>
          </SafeAreaView>

          {/* Progression visuelle */}
          <View style={styles.progressStrip}>
            {[
              { step: 1, done: !!form.blood_type,     label: 'Groupe sanguin' },
              { step: 2, done: !!form.urgency_level,  label: 'Urgence' },
              { step: 3, done: form.description.trim().length >= 10, label: 'Description' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.step}>
                <View style={styles.progressItem}>
                  <View style={[styles.progressDot, s.done && styles.progressDotDone]}>
                    <Text style={[styles.progressDotText, s.done && styles.progressDotTextDone]}>
                      {s.done ? '✓' : String(s.step)}
                    </Text>
                  </View>
                  <Text style={[styles.progressLabel, s.done && styles.progressLabelDone]}>
                    {s.label}
                  </Text>
                </View>
                {i < arr.length - 1 && (
                  <View style={[styles.progressLine, arr[i + 1]?.done && styles.progressLineDone]} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Groupe sanguin */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🩸</Text>
              <View>
                <Text style={styles.cardTitle}>Groupe sanguin requis *</Text>
                <Text style={styles.cardSub}>Sélectionnez le groupe dont vous avez besoin</Text>
              </View>
            </View>
            <View style={styles.bloodGrid}>
              {BLOOD_TYPES.map((bt) => {
                const isSelected = form.blood_type === bt;
                return (
                  <TouchableOpacity
                    key={bt}
                    style={[styles.bloodChip, isSelected && styles.bloodChipActive]}
                    onPress={() => setForm({ ...form, blood_type: bt })}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.bloodChipText, isSelected && styles.bloodChipTextActive]}>
                      {bt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Niveau d'urgence */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>⚠️</Text>
              <View>
                <Text style={styles.cardTitle}>Niveau d'urgence *</Text>
                <Text style={styles.cardSub}>Choisissez le niveau de criticité</Text>
              </View>
            </View>
            <View style={styles.urgencyList}>
              {URGENCY_LEVELS.map((u) => {
                const isSelected = form.urgency_level === u.key;
                return (
                  <TouchableOpacity
                    key={u.key}
                    style={[
                      styles.urgencyItem,
                      isSelected && { backgroundColor: u.bg, borderColor: u.color + '50' },
                    ]}
                    onPress={() => setForm({ ...form, urgency_level: u.key })}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.urgencyIconBox, { backgroundColor: isSelected ? u.color + '20' : Colors.gray100 }]}>
                      <Text style={styles.urgencyEmoji}>{u.icon}</Text>
                    </View>
                    <View style={styles.urgencyText}>
                      <Text style={[styles.urgencyLabel, isSelected && { color: u.color }]}>
                        {u.label}
                      </Text>
                      <Text style={styles.urgencyDesc}>{u.desc}</Text>
                    </View>
                    <View style={[
                      styles.urgencyRadio,
                      isSelected && { backgroundColor: u.color, borderColor: u.color },
                    ]}>
                      {isSelected && <View style={styles.urgencyRadioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Description */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📝</Text>
              <View>
                <Text style={styles.cardTitle}>Description *</Text>
                <Text style={styles.cardSub}>Contexte médical et informations utiles</Text>
              </View>
            </View>
            <View style={[styles.textAreaWrapper, focusedField === 'desc' && styles.textAreaFocused]}>
              <TextInput
                style={styles.textArea}
                placeholder="Ex: Patient en post-opératoire, besoin urgent de 2 poches de sang O-. Contact : Dr Martin, service réanimation..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={5}
                value={form.description}
                onChangeText={(v) => setForm({ ...form, description: v })}
                textAlignVertical="top"
                onFocus={() => setFocusedField('desc')}
                onBlur={() => setFocusedField(null)}
              />
              <Text style={styles.charCount}>{form.description.length} / 500</Text>
            </View>
          </View>

          {/* Date d'expiration (optionnel) */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📅</Text>
              <View>
                <Text style={styles.cardTitle}>Date d'expiration</Text>
                <Text style={styles.cardSub}>Optionnel — format : 2026-12-31T12:00:00Z</Text>
              </View>
            </View>
            <View style={[styles.inputWrapper, focusedField === 'exp' && styles.inputFocused]}>
              <TextInput
                style={styles.input}
                placeholder="2026-12-31T12:00:00Z"
                placeholderTextColor={Colors.textMuted}
                value={form.expires_at}
                onChangeText={(v) => setForm({ ...form, expires_at: v })}
                autoCapitalize="none"
                onFocus={() => setFocusedField('exp')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Bouton soumettre */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, (!isValid || loading) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!isValid || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>
                {loading ? 'Publication en cours...' : '🩸  Publier la demande'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.footerNote}>
              Les donneurs compatibles dans votre région seront notifiés instantanément.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingBottom: 40 },

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

  // Progression
  progressStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 4,
  },
  progressItem: { alignItems: 'center', gap: 4 },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  progressDotDone: {
    backgroundColor: Colors.info,
    borderColor: Colors.info,
  },
  progressDotText: { fontSize: 11, fontWeight: '700', color: Colors.textLight },
  progressDotTextDone: { color: Colors.white },
  progressLabel: { fontSize: 10, color: Colors.textLight, fontWeight: '600', textAlign: 'center', maxWidth: 60 },
  progressLabelDone: { color: Colors.info },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginBottom: 16,
    maxWidth: 32,
  },
  progressLineDone: { backgroundColor: Colors.info },

  // Cartes
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    padding: 18,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardIcon: { fontSize: 22, marginTop: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  cardSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },

  // Groupe sanguin
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bloodChip: {
    width: 58,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray100,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  bloodChipActive: {
    backgroundColor: Colors.infoLight,
    borderColor: Colors.info,
  },
  bloodChipText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  bloodChipTextActive: { color: Colors.info },

  // Urgence
  urgencyList: { gap: 8 },
  urgencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.gray50,
  },
  urgencyIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyEmoji: { fontSize: 20 },
  urgencyText: { flex: 1 },
  urgencyLabel: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  urgencyDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  urgencyRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },

  // Description
  textAreaWrapper: {
    backgroundColor: Colors.gray100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    gap: 8,
  },
  textAreaFocused: {
    borderColor: Colors.info,
    backgroundColor: Colors.infoLight,
  },
  textArea: {
    fontSize: 14,
    color: Colors.textDark,
    minHeight: 110,
    lineHeight: 21,
  },
  charCount: { fontSize: 11, color: Colors.textLight, textAlign: 'right', fontWeight: '500' },

  // Date
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputFocused: { borderColor: Colors.info, backgroundColor: Colors.infoLight },
  input: { flex: 1, fontSize: 14, color: Colors.textDark, padding: 0 },

  // Footer
  footer: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  submitBtn: {
    backgroundColor: Colors.info,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.info,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white, letterSpacing: 0.2 },
  footerNote: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
