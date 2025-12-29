/**
 * useAuth Hook
 * Centralized authentication state management
 */

import { useRouter, useSegments } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AuthService, getStoredUser } from '../services';
import type { LoginCredentials, User } from '../types/index';

export interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const segments = useSegments();
  
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStoredUser = useCallback(async () => {
    try {
      const storedUser = await getStoredUser();
      setUser(storedUser);
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user on mount
  useEffect(() => {
    loadStoredUser();
  }, [loadStoredUser]);

  // Handle authentication routing
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(guest)' || segments[0] === 'onboarding';

    if (!user && !inAuthGroup && segments[0] !== 'splash') {
      // User is not authenticated and not on auth screens
      router.replace('/splash');
    } else if (user) {
      // User is authenticated, redirect to appropriate section
      if (inAuthGroup) {
        if (user.role === 'teacher' || user.role === 'admin') {
          router.replace('/(teacher)');
        } else {
          router.replace('/(student)');
        }
      }
    }
  }, [user, segments, isLoading, router]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(credentials);
      setUser(response.user);
      setToken(response.token);
      
      // Navigate based on role
      if (response.user.role === 'teacher' || response.user.role === 'admin') {
        router.replace('/(teacher)');
      } else {
        router.replace('/(student)');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setToken(null);
      router.replace('/splash');
    } catch (error) {
      console.error('Logout error:', error);
      // Force local logout even if API fails
      setUser(null);
      setToken(null);
      router.replace('/splash');
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await AuthService.refreshUser();
      if (freshUser) {
        setUser(freshUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      const updatedUser = await AuthService.updateProfile(updates);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
    updateProfile,
  };
}

/**
 * useUser Hook
 * Quick access to current user without auth operations
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}

export default useAuth;
