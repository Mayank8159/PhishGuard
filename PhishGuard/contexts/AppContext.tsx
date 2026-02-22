import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, initializeSecurityStats } from '../services/authService';
import { checkBackendHealth } from '../services/threatAnalysisService';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface AppContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isSignedIn: boolean;
  backendConnected: boolean;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    bootstrapAsync();

    // Check backend health periodically
    const healthCheckInterval = setInterval(async () => {
      const isHealthy = await checkBackendHealth();
      setBackendConnected(isHealthy);
    }, 30000); // Every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Get current user from local storage
      const currentUser = await getCurrentUser();
      setUser(currentUser ?? null);

      // Check backend health (non-blocking - don't wait)
      checkBackendHealth().then(isHealthy => {
        setBackendConnected(isHealthy);
      }).catch(() => {
        setBackendConnected(false);
      });

      // Initialize security stats if user exists (non-blocking)
      if (currentUser) {
        initializeSecurityStats(currentUser.id).catch(err => {
          console.warn('Failed to initialize stats:', err);
        });
      }
    } catch (error) {
      console.error('Bootstrap error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    setIsLoading(true);
    try {
      await bootstrapAsync();
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isSignedIn: !!user,
    backendConnected,
    refresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
