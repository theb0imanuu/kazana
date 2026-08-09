import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  login: (token, user) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ accessToken: token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
  initialize: () => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ accessToken: token, user, isAuthenticated: true });
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        set({ accessToken: null, user: null, isAuthenticated: false });
      }
    }
  },
}));
