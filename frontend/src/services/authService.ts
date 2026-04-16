import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, ENDPOINTS } from '../constants/api';

export interface UserDto {
  id: number;
  username: string;
  displayName: string;
  avatarColor: string;
  status: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

const api = axios.create({ baseURL: API_BASE_URL });

export const authService = {
  async register(username: string, email: string,
      password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
        ENDPOINTS.AUTH.REGISTER,
        { username, email, password });
    await SecureStore.setItemAsync(
        'pingme_token', response.data.token);
    return response.data;
  },

  async login(username: string,
      password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
        ENDPOINTS.AUTH.LOGIN,
        { username, password });
    await SecureStore.setItemAsync(
        'pingme_token', response.data.token);
    return response.data;
  },

  async getToken(): Promise<string | null> {
    return await SecureStore
        .getItemAsync('pingme_token');
  },

  async logout(): Promise<void> {
    await SecureStore
        .deleteItemAsync('pingme_token');
  }
};
