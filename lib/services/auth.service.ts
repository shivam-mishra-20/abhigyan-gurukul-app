/**
 * Auth Service
 * Handles authentication operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LoginCredentials, LoginResponse, RegisterData, User } from '../types/index';
import { api, removeAuthToken, setAuthToken } from './api.service';

const USER_KEY = 'user';

// =============================================================================
// LOCAL STORAGE
// =============================================================================

export const getStoredUser = async (): Promise<User | null> => {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to store user:', error);
  }
};

export const removeStoredUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Failed to remove user:', error);
  }
};

// =============================================================================
// AUTH OPERATIONS
// =============================================================================

export const AuthService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', credentials, {
      skipAuth: true,
    });

    if (response.token) {
      await setAuthToken(response.token);
    }
    if (response.user) {
      await setStoredUser(response.user);
    }

    return response;
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/register', data, {
      skipAuth: true,
    });

    if (response.token) {
      await setAuthToken(response.token);
    }
    if (response.user) {
      await setStoredUser(response.user);
    }

    return response;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Optionally call logout endpoint
      await api.post('/api/auth/logout').catch(() => {});
    } finally {
      await removeAuthToken();
      await removeStoredUser();
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    return getStoredUser();
  },

  /**
   * Refresh user data from server
   */
  async refreshUser(): Promise<User | null> {
    try {
      const user = await api.get<User>('/api/auth/me');
      if (user) {
        await setStoredUser(user);
      }
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/api/auth/forgot-password', { email }, {
      skipAuth: true,
    });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/api/auth/reset-password', {
      token,
      newPassword,
    }, {
      skipAuth: true,
    });
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    const user = await api.patch<User>('/api/auth/profile', updates);
    if (user) {
      await setStoredUser(user);
    }
    return user;
  },

  /**
   * Mark welcome tutorial as completed
   */
  async completeWelcomeTutorial(): Promise<void> {
    const user = await getStoredUser();
    if (user) {
      await setStoredUser({ ...user, welcomeTutorialCompleted: true });
    }
    // Optionally sync with server
    await api.patch('/api/auth/profile', { welcomeTutorialCompleted: true }).catch(() => {});
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await getStoredUser();
    return !!user;
  },

  /**
   * Get all students (for teachers/admins)
   */
  async getStudents(): Promise<any[]> {
    const response = await api.get<{ success: boolean; data: any[] }>('/api/teacher/students');
    return response.data || [];
  },
};

export default AuthService;
