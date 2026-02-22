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
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  let parsedUrl: URL | null = null;

  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    return {
      url,
      status: 'dangerous',
      riskScore: 85,
      threats: ['Invalid or malformed URL'],
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname.toLowerCase();
  const search = parsedUrl.search.toLowerCase();
  const fullLower = normalizedUrl.toLowerCase();

  let riskScore = 0;
  const threats: string[] = [];

  const suspiciousBrands = [
    'paypal',
    'amazon',
    'apple',
    'google',
    'microsoft',
    'bank',
    'secure',
    'wallet',
    'crypto',
  ];

  const phishingKeywords = [
    'verify',
    'confirm',
    'update',
    'urgent',
    'click',
    'redirect',
    'signin',
    'login',
    'password',
    'account',
  ];

  const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top'];

  const isIpHost = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
  if (isIpHost) {
    riskScore += 30;
    threats.push('Uses an IP address instead of a domain');
  }

  if (!normalizedUrl.startsWith('https://')) {
    riskScore += 15;
    threats.push('No HTTPS encryption');
  }

  if (hostname.split('.').length >= 4) {
    riskScore += 10;
    threats.push('Excessive subdomains');
  }

  if (suspiciousTlds.some((tld) => hostname.endsWith(tld))) {
    riskScore += 20;
    threats.push('Suspicious top-level domain');
  }

  if (suspiciousBrands.some((brand) => hostname.includes(brand))) {
    riskScore += 18;
    threats.push('Possible brand impersonation');
  }

  if (phishingKeywords.some((keyword) => pathname.includes(keyword) || search.includes(keyword))) {
    riskScore += 22;
    threats.push('Contains phishing keywords');
  }

  if (fullLower.includes('@')) {
    riskScore += 25;
    threats.push('URL contains "@" symbol');
  }

  if (fullLower.includes('..') || fullLower.includes('\\')) {
    riskScore += 20;
    threats.push('Suspicious URL structure');
  }

  if (fullLower.includes('%00') || fullLower.includes('%2e%2e')) {
    riskScore += 20;
    threats.push('Encoded traversal patterns');
  }

  const dashCount = (hostname.match(/-/g) || []).length;
  if (dashCount >= 3) {
    riskScore += 12;
    threats.push('Excessive dashes in domain');
  }

  if (hostname.length > 30 || normalizedUrl.length > 75) {
    riskScore += 10;
    threats.push('Unusually long URL');
  }

  if (fullLower.includes('http://') && fullLower.includes('https://')) {
    riskScore += 15;
    threats.push('Multiple protocols in URL');
  }

  if (pathname.includes('//')) {
    riskScore += 10;
    threats.push('Suspicious path structure');
  }

  const riskScoreCapped = Math.min(riskScore, 100);
  let status: 'safe' | 'warning' | 'dangerous';

  if (riskScoreCapped >= 60) {
    status = 'dangerous';
  } else if (riskScoreCapped >= 30) {
    status = 'warning';
  } else {
    status = 'safe';
  }

  return {
    url,
    status,
    riskScore: riskScoreCapped,
    threats: threats.slice(0, 3),
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
