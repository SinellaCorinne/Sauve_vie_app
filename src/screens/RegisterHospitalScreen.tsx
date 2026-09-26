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
import { authRoutes } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';
import { useApiError } from '../hooks/useApiError';

type Props = NativeStackScreenProps<RootStackParamList, 'RegisterHospital'>;

type FormState = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  institution_name: string;
  city: string;
  address: string;
  phone: string;
};

type FormField = {
  key: keyof FormState;
  label: string;
  icon: string;
  placeholder: string;
  keyboard?: 'email-address' | 'phone-pad';
  secure?: boolean;
};

const SECTIONS: Array<{ title: string; fields: FormField[] }> = [
  {
    title: '👤  Responsable du compte',
    fields: [
      { key: 'name', label: 'Nom du responsable', icon: '👤', placeholder: 'Nom et prénom' },
      { key: 'email', label: 'Adresse e-mail', icon: '✉️', placeholder: 'admin@hopital.dz', keyboard: 'email-address' },
      { key: 'password', label: 'Mot de passe', icon: '🔒', placeholder: '••••••••', secure: true },
      { key: 'password_confirmation', label: 'Confirmer le mot de passe', icon: '🔒', placeholder: '••••••••', secure: true },
    ],
  },
  {
    title: '🏥  Informations de l\'établissement',
    fields: [
      { key: 'institution_name' as keyof FormState, label: "Nom de l'établissement", icon: '🏥', placeholder: 'CHU Mustapha Bacha...' },
      { key: 'city' as keyof FormState, label: 'Ville', icon: '📍', placeholder: 'Alger, Oran...' },
      { key: 'address' as keyof FormState, label: 'Adresse complète', icon: '🗺️', placeholder: '1 rue des Martyrs...' },
      { key: 'phone' as keyof FormState, label: 'Téléphone', icon: '📞', placeholder: '021 000 000', keyboard: 'phone-pad' as const },
    ],
  },
];

export default function RegisterHospitalScreen({ navigation }: Props) {
  const { setSession } = useAuth();
  const { fieldErrors, setFieldErrors, globalError, clearErrors, handleApiError } = useApiError();
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    institution_name: '',
    city: '',
    address: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async () => {
    const nextFieldErrors: Record<string, string> = {};

    if (!form.name.trim()) nextFieldErrors.name = 'Le nom du responsable est requis.';
    if (!form.email.trim()) nextFieldErrors.email = 'L’email est requis.';
    if (!form.password.trim()) nextFieldErrors.password = 'Le mot de passe est requis.';
    if (!form.institution_name.trim()) nextFieldErrors.institution_name = 'Le nom de l’établissement est requis.';

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    clearErrors();

    try {
      setLoading(true);
      const response = await api.post(authRoutes.registerHospital, form);
      await setSession(response.data.token, response.data.user);
    } catch (error: any) {
      console.log('RegisterHospitalScreen -> error object', JSON.stringify(error, null, 2));
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <SafeAreaView style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>◀️</Text>
            </TouchableOpacity>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>🏥 Hôpital</Text>
            </View>
          </SafeAreaView>

          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Créer un compte établissement</Text>
            <Text style={styles.heroSubtitle}>Gérez vos besoins en sang et connectez-vous aux donneurs compatibles.</Text>
          </View>

          {globalError ? (
            <View style={styles.globalErrorBanner}>
              <Text style={styles.globalErrorText}>{globalError}</Text>
              {__DEV__ && <Text style={styles.technicalErrorText}>{globalError}</Text>}
            </View>
          ) : null}

          {/* Sections de champs */}
          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.card}>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <View style={styles.fieldsContainer}>
                {section.fields.map((field) => (
                  <View key={field.key} style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <View style={[styles.inputWrapper, focusedField === field.key && styles.inputFocused, fieldErrors[field.key] ? styles.inputError : null]}>
                      <Text style={styles.fieldIcon}>{field.icon}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder={field.placeholder}
                        placeholderTextColor={Colors.textMuted}
                        value={form[field.key]}
                        onChangeText={(v) => {
                          setForm({ ...form, [field.key]: v });
                          if (fieldErrors[field.key]) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next[field.key];
                              return next;
                            });
                          }
                        }}
                        autoCapitalize={field.keyboard === 'email-address' ? 'none' : 'words'}
                        keyboardType={field.keyboard ?? 'default'}
                        secureTextEntry={Boolean(field.secure)}
                        onFocus={() => setFocusedField(field.key)}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                    {fieldErrors[field.key] ? <Text style={styles.fieldErrorText}>{fieldErrors[field.key]}</Text> : null}
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.submitText}>
                {loading ? 'Inscription en cours...' : "S'inscrire comme hôpital"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
              <Text style={styles.loginLinkText}>
                Déjà un compte ?{'  '}
                <Text style={{ color: Colors.info, fontWeight: '700' }}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backArrow: { fontSize: 20, color: Colors.textDark, fontWeight: '600' },
  headerBadge: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.info },

  // Hero
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Cartes de section
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  fieldsContainer: { gap: 14 },

  // Champs
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: '#FFF5F5',
  },
  fieldErrorText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  globalErrorBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FEC2C9',
    borderRadius: 12,
    padding: 12,
  },
  globalErrorText: {
    color: '#9F1239',
    fontSize: 13,
    fontWeight: '600',
  },
  technicalErrorText: {
    color: '#7F1D1D',
    fontSize: 11,
    marginTop: 6,
  },
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
  inputFocused: {
    borderColor: Colors.info,
    backgroundColor: Colors.infoLight,
  },
  fieldIcon: { fontSize: 15 },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
    padding: 0,
  },

  // Footer
  footer: { paddingHorizontal: 20, paddingTop: 8, gap: 14 },
  submitButton: {
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
  submitDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '700', color: Colors.white, letterSpacing: 0.2 },
  loginLink: { alignItems: 'center' },
  loginLinkText: { fontSize: 14, color: Colors.textSecondary },
});
