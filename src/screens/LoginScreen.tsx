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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../theme/colors';
import Logo from '../components/Logo';
import { useApiError } from '../hooks/useApiError';

type LoginNavigation = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavigation>();
  const { signIn } = useAuth();
  const { fieldErrors, setFieldErrors, globalError, clearErrors, handleApiError } = useApiError();
  const [email, setEmail] = useState('donor@test.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    const nextFieldErrors: Record<string, string> = {};

    if (!email.trim()) {
      nextFieldErrors.email = 'L’email est requis.';
    }

    if (!password.trim()) {
      nextFieldErrors.password = 'Le mot de passe est requis.';
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    clearErrors();

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error: any) {
      console.log('LoginScreen -> error object', JSON.stringify(error, null, 2));
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero top */}
          <View style={styles.heroSection}>
            <View style={styles.heroBg} />
            <SafeAreaView>
              <View style={styles.heroContent}>
                <Logo size={72} showText />
                <Text style={styles.heroTagline}>
                  Ensemble, sauvons des vies 🩸
                </Text>
              </View>
            </SafeAreaView>
          </View>

          {/* Carte formulaire */}
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Bon retour !</Text>
              <Text style={styles.formSubtitle}>Connectez-vous à votre compte</Text>
            </View>

            {globalError ? (
              <View style={styles.globalErrorBanner}>
                <Text style={styles.globalErrorText}>{globalError}</Text>
                {__DEV__ && (
                  <Text style={styles.technicalErrorText}>{globalError}</Text>
                )}
              </View>
            ) : null}

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Adresse e-mail</Text>
              <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputFocused, fieldErrors.email ? styles.inputError : null]}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="votre@email.com"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.email;
                        return next;
                      });
                    }
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              {fieldErrors.email ? <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text> : null}
            </View>

            {/* Mot de passe */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Mot de passe</Text>
              <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputFocused, fieldErrors.password ? styles.inputError : null]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.password;
                        return next;
                      });
                    }
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {fieldErrors.password ? <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text> : null}
            </View>

            {/* Bouton connexion */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <Text style={styles.submitText}>Connexion en cours...</Text>
              ) : (
                <Text style={styles.submitText}>Se connecter</Text>
              )}
            </TouchableOpacity>

            {/* Séparateur */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>Nouveau sur Sauve-Vie ?</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Bouton inscription */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('RoleChoice')}
              activeOpacity={0.75}
            >
              <Text style={styles.registerText}>Créer un compte →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Hero
  heroSection: {
    backgroundColor: Colors.primarySoft,
    paddingBottom: 32,
    position: 'relative',
  },
  heroBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.primarySoft,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 8,
    gap: 12,
  },
  heroTagline: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primaryDark,
    letterSpacing: 0.2,
  },

  // Carte
  formCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    flex: 1,
    padding: 28,
    paddingTop: 32,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
    gap: 20,
  },
  formHeader: {
    gap: 4,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.4,
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Champs
  fieldGroup: {
    gap: 7,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: '#FFF5F5',
  },
  fieldErrorText: {
    marginTop: 4,
    color: Colors.error,
    fontSize: 12,
    fontWeight: '500',
  },
  globalErrorBanner: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FEC2C9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  globalErrorText: {
    color: '#9F1239',
    fontSize: 13,
    fontWeight: '600',
  },
  technicalErrorText: {
    marginTop: 6,
    color: '#7F1D1D',
    fontSize: 11,
    fontWeight: '500',
  },
  inputIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
    fontWeight: '400',
    padding: 0,
  },
  eyeIcon: {
    fontSize: 16,
  },

  // Bouton principal
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
  },

  // Séparateur
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  separatorText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },

  // Bouton inscription
  registerButton: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  registerText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
});
