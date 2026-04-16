import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../constants/api';
import { authService, UserDto } from '../services/authService';
import { webSocketService } from '../services/webSocketService';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserDto) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('pingme_token');
        if (storedToken) {
          const response = await axios.get(
            `${API_BASE_URL}${ENDPOINTS.USERS.PROFILE}`,
            { headers: { Authorization: `Bearer ${storedToken}` } }
          );
          setToken(storedToken);
          setUser(response.data);
          webSocketService.connect(storedToken);
        }
      } catch (e) {
        console.error("Failed to load token", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const login = (newToken: string, newUser: UserDto) => {
    setToken(newToken);
    setUser(newUser);
    webSocketService.connect(newToken);
  };

  const logout = async () => {
    webSocketService.disconnect();
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
