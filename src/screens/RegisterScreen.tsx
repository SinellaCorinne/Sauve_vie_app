import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../services/api';
import { authRoutes } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'RegisterDonor'>;

export default function RegisterScreen({ navigation }: Props) {
  const { setSession } = useAuth();
  const [form, setForm] = useState({
    name: 'Donneur Test',
    email: 'donor2@test.com',
    password: 'password',
    password_confirmation: 'password',
    blood_type: 'O-',
    phone: '0555123456',
    city: 'Alger',
    last_donation_date: '2025-01-15',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      const response = await api.post(authRoutes.registerDonor, form);
      await setSession(response.data.token, response.data.user);
      navigation.reset({ index: 0, routes: [{ name: 'DonorHome' }] });
    } catch (error: any) {
      Alert.alert(
        'Inscription impossible',
        error?.response?.data?.message || 'Vérifiez les informations saisies.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Créer un compte</Text>

        {Object.entries({
          name: 'Nom complet',
          email: 'Email',
          password: 'Mot de passe',
          password_confirmation: 'Confirmation',
          blood_type: 'Groupe sanguin',
          phone: 'Téléphone',
          city: 'Ville',
          last_donation_date: 'Dernier don',
        }).map(([key, label]) => (
          <View key={key} style={styles.fieldContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={form[key as keyof typeof form]}
              onChangeText={(value) => setForm((prev) => ({ ...prev, [key]: value }))}
              autoCapitalize={key === 'email' ? 'none' : 'words'}
              secureTextEntry={key.includes('password')}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Création...' : 'S’inscrire'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F4F7FB',
    minHeight: '100%',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#B71C1C',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9E1EC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
  },
  button: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  backText: {
    textAlign: 'center',
    marginTop: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
});
