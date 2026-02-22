import { api, AuthUser, UserProfile } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEY = 'phishguard_user';
const USER_ID_STORAGE_KEY = 'phishguard_user_id';

/**
 * Generate a simple user ID (in production, use proper authentication)
 */
const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Store user locally
 */
const storeUser = async (user: AuthUser): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(USER_ID_STORAGE_KEY, user.id);
  } catch (error) {
    console.error('Error storing user:', error);
  }
};

/**
 * Remove user from storage
 */
const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    await AsyncStorage.removeItem(USER_ID_STORAGE_KEY);
  } catch (error) {
    console.error('Error removing user:', error);
  }
};

/**
 * Get current authenticated user from local storage
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (!userJson) return null;
    return JSON.parse(userJson) as AuthUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Get current user ID
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_ID_STORAGE_KEY);
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

/**
 * Sign up a new user (creates local user for demo purposes)
 * In production, connect to authentication service
 */
export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<AuthUser> => {
  try {
    // Generate a unique user ID
    const userId = generateUserId();

    // Create user profile via API
    const user: AuthUser = {
      id: userId,
      email,
      name,
    };

    // Store locally
    await storeUser(user);

    console.log('User signed up:', user);
    return user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Sign in user (local authentication for demo)
 * In production, connect to proper authentication service
 */
export const signIn = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  try {
    // For demo purposes, create/retrieve local user
    // In production, validate against authentication service
    const userId = generateUserId();

    const user: AuthUser = {
      id: userId,
      email,
      name: email.split('@')[0],
    };

    await storeUser(user);

    console.log('User signed in:', user);
    return user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Sign out user
 */
export const signOut = async (): Promise<boolean> => {
  try {
    await removeUser();
    console.log('User signed out');
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    return false;
  }
};

/**
 * Get user profile from backend
 */
export const getUserProfile = async (userId: string): Promise<AuthUser | null> => {
  try {
    const response = await api.get<UserProfile>(`/user/${userId}/profile`);
    return {
      id: response.id,
      email: response.email,
      name: response.name,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<AuthUser>
): Promise<AuthUser | null> => {
  try {
    const response = await api.post<UserProfile>(`/user/${userId}/profile`, {
      name: updates.name,
    });

    // Update local storage
    const currentUser = await getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      await storeUser(updatedUser);
    }

    return {
      id: userId,
      email: currentUser?.email || '',
      name: updates.name,
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

/**
 * Initialize security stats for a user (called when user is created)
 */
export const initializeSecurityStats = async (userId: string): Promise<void> => {
  try {
    // Backend creates stats automatically, just verify connection
    const response = await api.get(`/user/${userId}/stats`);
    console.log('Security stats initialized:', response);
  } catch (error) {
    console.log('Security stats already initialized or backend not available');
  }
};
