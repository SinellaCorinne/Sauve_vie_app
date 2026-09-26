// 10.0.2.2 = loopback host depuis l'émulateur Android
// Pour un vrai device, remplacer par l'IP LAN de ta machine (ex: 192.168.1.x)
const FALLBACK_API_BASE_URL = 'https://sauve-vieapi-production.up.railway.app/api';

export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL || FALLBACK_API_BASE_URL).replace(/\/+$/, '');

export const authRoutes = {
  login: `${API_BASE_URL}/auth/login`,
  registerDonor: `${API_BASE_URL}/auth/register/donor`,
  registerHospital: `${API_BASE_URL}/auth/register/hospital`,
  me: `${API_BASE_URL}/auth/me`,
};

export const donorRoutes = {
  profile: `${API_BASE_URL}/donor/profile`,
  compatibility: `${API_BASE_URL}/donor/compatible-requests`,
  history: `${API_BASE_URL}/donor/history`,
  availability: `${API_BASE_URL}/donor/availability`,
};

export const hospitalRoutes = {
  profile: `${API_BASE_URL}/hospital/profile`,
  myRequests: `${API_BASE_URL}/hospital/blood-requests`,
};

export const bloodRequestRoutes = {
  list: `${API_BASE_URL}/blood-requests`,
  detail: (id: number | string) => `${API_BASE_URL}/blood-requests/${id}`,
  respond: (id: number | string) => `${API_BASE_URL}/blood-requests/${id}/respond`,
  responses: (id: number | string) => `${API_BASE_URL}/blood-requests/${id}/responses`,
};
