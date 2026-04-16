import { SERVER_HOST, USE_HTTPS } from './config';

const HTTP = USE_HTTPS ? 'https' : 'http';
const WS = USE_HTTPS ? 'wss' : 'ws';

export const API_BASE_URL = `${HTTP}://${SERVER_HOST}`;
export const WS_BASE_URL = `${WS}://${SERVER_HOST}/ws`;

export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
  },
  USERS: {
    LIST: '/api/users',
    PROFILE: '/api/users/me',
  },
  CONVERSATIONS: {
    LIST: '/api/conversations',
    DIRECT: '/api/conversations/direct',
    GROUP: '/api/conversations/group',
    MESSAGES: (id: number) => `/api/conversations/${id}/messages`,
  }
};
