import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../stores/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false });
    localStorage.clear();
  });

  it('should initialize with empty default values', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBe(null);
    expect(state.user).toBe(null);
  });

  it('should login and store token/user details', () => {
    const mockUser = { id: 'user-1', email: 'user1@example.com', name: 'User A' };
    const mockToken = 'mock-jwt-token';

    useAuthStore.getState().login(mockToken, mockUser);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe(mockToken);
    expect(state.user).toEqual(mockUser);
    expect(localStorage.getItem('accessToken')).toBe(mockToken);
  });

  it('should clear stored session on logout', () => {
    const mockUser = { id: 'user-1', email: 'user1@example.com', name: 'User A' };
    const mockToken = 'mock-jwt-token';

    useAuthStore.getState().login(mockToken, mockUser);
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBe(null);
    expect(state.user).toBe(null);
    expect(localStorage.getItem('accessToken')).toBe(null);
  });
});
