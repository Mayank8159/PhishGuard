/**
 * Backend API Configuration
 * Connects to FastAPI backend which uses PocketBase for data persistence
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Make API calls to the backend
 */
export const api = {
  baseURL: API_BASE_URL,

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, data?: Record<string, any>): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  },
};

// API Response Types
export interface AnalyzeResponse {
  url: string;
  status: 'safe' | 'warning' | 'dangerous';
  riskScore: number;
  threats: string[];
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  database_connected: boolean;
}

export interface SecurityStatsResponse {
  threats_blocked: number;
  safe_sites: number;
  scans_total: number;
  protection_active: boolean;
}

export interface ScanHistoryItem {
  id: string;
  url: string;
  status: 'safe' | 'warning' | 'dangerous';
  created_at: string;
  risk_score?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  total_scans: number;
  threats_blocked: number;
  created_at: string;
}

// User authentication is simplified - just use local storage and user ID
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}
