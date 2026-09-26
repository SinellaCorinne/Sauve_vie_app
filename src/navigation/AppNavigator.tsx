import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import OnboardingScreen from '../screens/OnboardingScreen';
import RoleChoiceScreen from '../screens/RoleChoiceScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterDonorScreen from '../screens/RegisterDonorScreen';
import RegisterHospitalScreen from '../screens/RegisterHospitalScreen';
import DonorHomeScreen from '../screens/DonorHomeScreen';
import CompatibleRequestsScreen from '../screens/CompatibleRequestsScreen';
import RequestDetailScreen from '../screens/RequestDetailScreen';
import DonorProfileScreen from '../screens/DonorProfileScreen';
import DonorHistoryScreen from '../screens/DonorHistoryScreen';
import UrgencyAlertScreen from '../screens/UrgencyAlertScreen';
import HospitalHomeScreen from '../screens/HospitalHomeScreen';
import HospitalDashboardScreen from '../screens/HospitalDashboardScreen';
import HospitalRequestsScreen from '../screens/HospitalRequestsScreen';
import CreateBloodRequestScreen from '../screens/CreateBloodRequestScreen';
import BloodRequestDetailScreen from '../screens/BloodRequestDetailScreen';
import HospitalProfileScreen from '../screens/HospitalProfileScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  RoleChoice: undefined;
  Login: undefined;
  RegisterDonor: undefined;
  RegisterHospital: undefined;
  DonorHome: undefined;
  CompatibleRequests: undefined;
  RequestDetail: { requestId: number };
  DonorProfile: undefined;
  DonorHistory: undefined;
  UrgencyAlert: undefined;
  HospitalHome: undefined;
  HospitalDashboard: undefined;
  HospitalRequests: undefined;
  CreateBloodRequest: undefined;
  BloodRequestDetail: { requestId: number };
  HospitalProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="RoleChoice" component={RoleChoiceScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="RegisterDonor" component={RegisterDonorScreen} />
            <Stack.Screen name="RegisterHospital" component={RegisterHospitalScreen} />
          </>
        ) : user.role === 'donor' ? (
          <>
            <Stack.Screen name="DonorHome" component={DonorHomeScreen} />
            <Stack.Screen name="CompatibleRequests" component={CompatibleRequestsScreen} />
            <Stack.Screen name="RequestDetail" component={RequestDetailScreen} />
            <Stack.Screen name="DonorProfile" component={DonorProfileScreen} />
            <Stack.Screen name="DonorHistory" component={DonorHistoryScreen} />
            <Stack.Screen name="UrgencyAlert" component={UrgencyAlertScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="HospitalHome" component={HospitalHomeScreen} />
            <Stack.Screen name="HospitalDashboard" component={HospitalDashboardScreen} />
            <Stack.Screen name="HospitalRequests" component={HospitalRequestsScreen} />
            <Stack.Screen name="CreateBloodRequest" component={CreateBloodRequestScreen} />
            <Stack.Screen name="BloodRequestDetail" component={BloodRequestDetailScreen} />
            <Stack.Screen name="HospitalProfile" component={HospitalProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
