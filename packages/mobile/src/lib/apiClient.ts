import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { TokenPairSchema } from '@healthcare/shared/schemas';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3001';
const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (config) => {
  const accessToken = await SecureStore.getItemAsync(ACCESS_KEY);
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let pending: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => pending.push(resolve));
        return api(original);
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
        if (!refreshToken) throw new Error('no refresh token');
        const resp = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        const pair = TokenPairSchema.safeParse({ ...resp.data, refreshToken });
        if (!pair.success) throw new Error('invalid token pair');
        await SecureStore.setItemAsync(ACCESS_KEY, pair.data.accessToken);
        pending.forEach((fn) => fn());
        pending = [];
        return api(original);
      } catch (e) {
        await SecureStore.deleteItemAsync(ACCESS_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);
        throw e;
      } finally {
        isRefreshing = false;
      }
    }
    throw error;
  }
);

export async function saveTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}


