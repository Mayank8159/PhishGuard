import { api, AnalyzeResponse, ScanHistoryItem, SecurityStatsResponse, HealthResponse } from '../config/api';

export interface AnalysisResult {
  url: string;
  status: 'safe' | 'warning' | 'dangerous';
  riskScore: number;
  threats: string[];
  timestamp: string;
  id?: string;
  created_at?: string; // For compatibility with backend responses
}

/**
 * Analyze a URL for phishing threats via backend API
 */
export const analyzeUrl = async (
  url: string,
  userId?: string
): Promise<AnalysisResult> => {
  try {
    // Call backend API for analysis
    const response = await api.post<AnalyzeResponse>('/analyze', {
      url,
      user_id: userId,
    });

    return {
      url: response.url,
      status: response.status,
      riskScore: response.riskScore,
      threats: response.threats,
      timestamp: response.timestamp,
    };
  } catch (error) {
    console.error('Analysis error:', error);

    // Fallback: Local analysis if backend is down
    return fallbackAnalysis(url);
  }
};

/**
 * Fallback local analysis when backend is unavailable
 */
const fallbackAnalysis = (url: string): AnalysisResult => {
  const suspiciousPatterns = [
    'paypal',
    'amazon',
    'apple',
    'google',
    'microsoft',
    'bank',
  ];

  const phishingIndicators = [
    'verify',
    'confirm',
    'update',
    'urgent',
    'click',
    'redirect',
    'phishing',
  ];

  const urlLower = url.toLowerCase();
  let riskScore = 0;
  const threats: string[] = [];

  // Check for suspicious patterns
  if (suspiciousPatterns.some((p) => urlLower.includes(p))) {
    riskScore += 20;
    threats.push('Mimics legitimate service');
  }

  // Check for phishing indicators
  if (phishingIndicators.some((p) => urlLower.includes(p))) {
    riskScore += 30;
    threats.push('Contains phishing keywords');
  }

  // Check URL structure
  if (urlLower.includes('..') || urlLower.includes('//')) {
    riskScore += 25;
    threats.push('Suspicious URL structure');
  }

  // Check for HTTPS
  if (!urlLower.startsWith('https')) {
    riskScore += 15;
    threats.push('No HTTPS encryption');
  }

  // Determine status
  let status: 'safe' | 'warning' | 'dangerous';
  if (riskScore >= 60) {
    status = 'dangerous';
  } else if (riskScore >= 30) {
    status = 'warning';
  } else {
    status = 'safe';
  }

  return {
    url,
    status,
    riskScore: Math.min(riskScore, 100),
    threats: threats.slice(0, 3), // Limit to 3 threats
    timestamp: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

/**
 * Get recent scans for a user
 */
export const getRecentScans = async (
  userId: string,
  limit: number = 5
): Promise<AnalysisResult[]> => {
  try {
    const response = await api.get<ScanHistoryItem[]>(
      `/user/${userId}/scans?limit=${limit}&offset=0`
    );

    return response.map((scan) => ({
      url: scan.url,
      status: scan.status,
      riskScore: scan.risk_score || 0,
      threats: scan.status === 'safe' ? [] : ['Analysis completed'],
      timestamp: new Date(scan.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      id: scan.id,
    }));
  } catch (error) {
    console.error('Error fetching scans:', error);
    return [];
  }
};

/**
 * Delete a scan
 */
export const deleteScan = async (userId: string, scanId: string): Promise<boolean> => {
  try {
    await api.delete(`/user/${userId}/scans/${scanId}`);
    return true;
  } catch (error) {
    console.error('Error deleting scan:', error);
    return false;
  }
};

/**
 * Get threat statistics for a user
 */
export const getThreatStats = async (
  userId: string
): Promise<{ threatsBlocked: number; safeSites: number; scansTotal: number }> => {
  try {
    const response = await api.get<SecurityStatsResponse>(`/user/${userId}/stats`);

    return {
      threatsBlocked: response.threats_blocked,
      safeSites: response.safe_sites,
      scansTotal: response.scans_total,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      threatsBlocked: 0,
      safeSites: 0,
      scansTotal: 0,
    };
  }
};

/**
 * Check if backend is available
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get<HealthResponse>('/health');
    return response.status === 'ok';
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
};
