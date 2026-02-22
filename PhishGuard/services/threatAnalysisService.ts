import {
  api,
  AnalyzeResponse,
  ScanHistoryItem,
  SecurityStatsResponse,
  HealthResponse,
  ProtectionStatusResponse,
  BackgroundScanResponse,
} from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AnalysisResult {
  url: string;
  status: 'safe' | 'warning' | 'dangerous';
  riskScore: number;
  threats: string[];
  timestamp: string;
  id?: string;
  created_at?: string; // For compatibility with backend responses
}

const LOCAL_SCANS_KEY_PREFIX = 'phishguard_local_scans_';
const LOCAL_BG_SCAN_KEY_PREFIX = 'phishguard_local_bg_scans_';
const MAX_LOCAL_SCANS = 50;

const getLocalScanKey = (userId?: string) => {
  return `${LOCAL_SCANS_KEY_PREFIX}${userId ?? 'guest'}`;
};

const loadLocalScans = async (userId?: string): Promise<AnalysisResult[]> => {
  try {
    const stored = await AsyncStorage.getItem(getLocalScanKey(userId));
    if (!stored) return [];
    return JSON.parse(stored) as AnalysisResult[];
  } catch (error) {
    console.warn('Failed to load local scans:', error);
    return [];
  }
};

const saveLocalScan = async (userId: string | undefined, scan: AnalysisResult) => {
  try {
    const existing = await loadLocalScans(userId);
    const updated = [scan, ...existing].slice(0, MAX_LOCAL_SCANS);
    await AsyncStorage.setItem(getLocalScanKey(userId), JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to store local scan:', error);
  }
};

const getLocalBgScanKey = (userId?: string) => {
  return `${LOCAL_BG_SCAN_KEY_PREFIX}${userId ?? 'guest'}`;
};

const loadLocalBackgroundCount = async (userId?: string): Promise<number> => {
  try {
    const stored = await AsyncStorage.getItem(getLocalBgScanKey(userId));
    if (!stored) return 0;
    const parsed = Number.parseInt(stored, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.warn('Failed to load background scan count:', error);
    return 0;
  }
};

const incrementLocalBackgroundCount = async (userId?: string, count: number = 1) => {
  try {
    const current = await loadLocalBackgroundCount(userId);
    const nextValue = current + count;
    await AsyncStorage.setItem(getLocalBgScanKey(userId), String(nextValue));
  } catch (error) {
    console.warn('Failed to save background scan count:', error);
  }
};

const computeLocalStats = async (scans: AnalysisResult[], userId?: string) => {
  let threatsBlocked = 0;
  let safeSites = 0;

  for (const scan of scans) {
    if (scan.status === 'dangerous') {
      threatsBlocked += 1;
    } else if (scan.status === 'safe') {
      safeSites += 1;
    }
  }

  const backgroundScans = await loadLocalBackgroundCount(userId);

  return {
    threatsBlocked,
    safeSites,
    scansTotal: scans.length + backgroundScans,
  };
};

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

    const result = {
      url: response.url,
      status: response.status,
      riskScore: response.riskScore,
      threats: response.threats,
      timestamp: response.timestamp,
    };

    if (!userId) {
      await saveLocalScan(userId, result);
    }

    return result;
  } catch (error) {
    console.error('Analysis error:', error);

    // Fallback: Local analysis if backend is down
    const result = await fallbackAnalysis(url);
    await saveLocalScan(userId, result);
    return result;
  }
};

/**
 * Scrape webpage content for phishing analysis
 */
const scrapeWebpage = async (url: string): Promise<{
  html: string;
  title: string;
  forms: number;
  externalLinks: number;
  suspiciousScripts: boolean;
} | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Failed to scrape ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const htmlLower = html.toLowerCase();

    // Extract title
    const titleMatch = htmlLower.match(/<title[^>]*>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Count forms (phishing sites often have login forms)
    const formMatches = htmlLower.match(/<form/g);
    const forms = formMatches ? formMatches.length : 0;

    // Count external links (suspicious if excessive)
    const linkMatches = html.match(/<a[^>]+href\s*=\s*["']https?:\/\//gi);
    const externalLinks = linkMatches ? linkMatches.length : 0;

    // Check for suspicious scripts
    const suspiciousScripts =
      htmlLower.includes('eval(') ||
      htmlLower.includes('atob(') ||
      htmlLower.includes('document.write(') ||
      htmlLower.includes('fromcharcode') ||
      htmlLower.includes('unescape(');

    return {
      html: htmlLower,
      title,
      forms,
      externalLinks,
      suspiciousScripts,
    };
  } catch (error) {
    console.warn('Scraping failed:', error);
    return null;
  }
};

/**
 * Analyze scraped content for phishing indicators
 */
const analyzeScrapedContent = (
  scraped: {
    html: string;
    title: string;
    forms: number;
    externalLinks: number;
    suspiciousScripts: boolean;
  },
  url: string
): { score: number; threats: string[] } => {
  let score = 0;
  const threats: string[] = [];

  const html = scraped.html;

  // Check for password/login forms
  if (html.includes('type="password"') || html.includes("type='password'")) {
    if (scraped.forms >= 2) {
      score += 20;
      threats.push('Multiple password forms detected');
    } else if (scraped.forms === 1) {
      score += 8;
      // Additional check: login form on suspicious domain
      const suspiciousDomains = ['ngrok', 'loca.lt', 'serveo', 'localhost.run'];
      if (suspiciousDomains.some((d) => url.toLowerCase().includes(d))) {
        score += 25;
        threats.push('Login form on tunneling service');
      }
    }
  }

  // Check for email/username input fields (common in phishing)
  const hasEmailInput =
    html.includes('type="email"') ||
    html.includes('name="email"') ||
    html.includes('name="username"') ||
    html.includes('id="email"') ||
    html.includes('id="username"');

  if (hasEmailInput && html.includes('type="password"')) {
    score += 15;
    threats.push('Credential harvesting form detected');
  }

  // Suspicious scripts
  if (scraped.suspiciousScripts) {
    score += 25;
    threats.push('Suspicious JavaScript detected');
  }

  // Check for excessive external links (content scraping)
  if (scraped.externalLinks > 20) {
    score += 12;
    threats.push('Excessive external links');
  }

  // Hidden iframes (common in phishing)
  if (html.includes('<iframe') && (html.includes('hidden') || html.includes('display:none'))) {
    score += 18;
    threats.push('Hidden iframe detected');
  }

  // Check for common phishing phrases
  const phishingPhrases = [
    'verify your account',
    'suspended account',
    'unusual activity',
    'confirm your identity',
    'update payment',
    'claim your prize',
    'urgent action required',
    'click here immediately',
    'limited time offer',
    'account will be closed',
    'security alert',
    'action required',
    'review your account',
    'unauthorized access',
  ];

  const foundPhrases = phishingPhrases.filter((phrase) => html.includes(phrase));
  if (foundPhrases.length >= 2) {
    score += 20;
    threats.push('Phishing language detected');
  } else if (foundPhrases.length === 1) {
    score += 10;
  }

  // Check for brand cloning (zphisher specialty)
  const brandIndicators = [
    { name: 'facebook', patterns: ['facebook', 'fb', 'meta'] },
    { name: 'instagram', patterns: ['instagram', 'insta'] },
    { name: 'google', patterns: ['google', 'gmail'] },
    { name: 'paypal', patterns: ['paypal'] },
    { name: 'netflix', patterns: ['netflix'] },
    { name: 'microsoft', patterns: ['microsoft', 'outlook', 'office'] },
    { name: 'apple', patterns: ['apple', 'icloud'] },
    { name: 'amazon', patterns: ['amazon'] },
    { name: 'twitter', patterns: ['twitter', 'x.com'] },
    { name: 'linkedin', patterns: ['linkedin'] },
  ];

  for (const brand of brandIndicators) {
    const brandInContent = brand.patterns.some((pattern) => 
      html.includes(pattern) || scraped.title.includes(pattern)
    );
    const brandInUrl = brand.patterns.some((pattern) => url.toLowerCase().includes(pattern));

    // Brand mentioned in page but NOT in legitimate domain
    if (brandInContent && !brandInUrl) {
      score += 25;
      threats.push(`Cloned ${brand.name} page detected`);
      break;
    }
  }

  // Check for misleading title
  const suspiciousBrands = [
    'paypal',
    'amazon',
    'apple',
    'google',
    'microsoft',
    'bank',
    'netflix',
    'facebook',
  ];

  const titleLower = scraped.title.toLowerCase();
  const hasBrandInTitle = suspiciousBrands.some((brand) => titleLower.includes(brand));
  const hasBrandInUrl = suspiciousBrands.some((brand) => url.toLowerCase().includes(brand));

  if (hasBrandInTitle && !hasBrandInUrl) {
    score += 22;
    threats.push('Title mimics trusted brand');
  }

  // Check for no SSL but collecting sensitive data
  if (!url.startsWith('https://') && html.includes('type="password"')) {
    score += 30;
    threats.push('Password form without HTTPS');
  }

  // Homograph/lookalike detection in title
  const homographs = ['раypal', 'g00gle', 'αpple', 'micr0soft', 'facebοok', 'instαgram'];
  if (homographs.some((h) => titleLower.includes(h))) {
    score += 20;
    threats.push('Lookalike brand name');
  }

  // Check for cloned page indicators (CSS/images from real sites)
  const externalResources = [
    'facebook.com',
    'instagram.com',
    'google.com',
    'paypal.com',
    'netflix.com',
    'microsoft.com',
    'apple.com',
  ];

  const hasExternalBrandResources = externalResources.some((domain) => 
    html.includes(`src="https://${domain}`) || 
    html.includes(`href="https://${domain}`) ||
    html.includes(`url(https://${domain}`)
  );

  if (hasExternalBrandResources && !externalResources.some((d) => url.includes(d))) {
    score += 30;
    threats.push('Stealing content from legitimate sites');
  }

  // Check for form action pointing to non-HTTPS or suspicious domains
  if (html.includes('<form') && html.includes('action=')) {
    const formActionMatch = html.match(/action\s*=\s*["']([^"']+)["']/i);
    if (formActionMatch) {
      const actionUrl = formActionMatch[1];
      if (actionUrl.startsWith('http://') || actionUrl.includes('.php') || actionUrl === '#') {
        score += 15;
        threats.push('Suspicious form submission target');
      }
    }
  }

  return { score, threats };
};

/**
 * Fallback local analysis when backend is unavailable
 */
const fallbackAnalysis = async (url: string): Promise<AnalysisResult> => {
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

  const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top', '.gq', '.pw'];

  // Zphisher/tunneling service detection (CRITICAL for phishing)
  const tunnelingServices = [
    'ngrok.io',
    'ngrok-free.app',
    'ngrok.app',
    'loca.lt',
    'serveo.net',
    'localhost.run',
    'pagekite.me',
    'tunnelto.dev',
    'localtunnel.me',
    'trycloudflare.com',
    'tunnel.me',
  ];

  const isTunnelingService = tunnelingServices.some((service) => hostname.includes(service));
  
  if (isTunnelingService) {
    riskScore += 50; // Increased from 40 - tunneling = almost always phishing
    threats.push('Tunneling service (high phishing risk)');
    
    // Extra penalty if it's a random subdomain (common zphisher pattern)
    const subdomain = hostname.split('.')[0];
    if (subdomain.includes('-') && subdomain.split('-').length >= 3) {
      riskScore += 20; // Increased from 15
      threats.push('Suspicious subdomain pattern');
    }
  }

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

  const hostSegments = hostname.split('.').filter(Boolean);
  const wordlikeSegments = hostSegments.filter((segment) => segment.length >= 4);
  if (hostname.length > 30 || normalizedUrl.length > 75) {
    riskScore += 10;
    threats.push('Unusually long URL');
  }

  if (hostname.length >= 24 && wordlikeSegments.length >= 3) {
    riskScore += 15;
    threats.push('Long multi-word domain');
  }

  if (fullLower.includes('http://') && fullLower.includes('https://')) {
    riskScore += 15;
    threats.push('Multiple protocols in URL');
  }

  if (pathname.includes('//')) {
    riskScore += 10;
    threats.push('Suspicious path structure');
  }

  // **Scrape webpage content for deeper analysis**
  const scraped = await scrapeWebpage(normalizedUrl);
  if (scraped) {
    const contentAnalysis = analyzeScrapedContent(scraped, normalizedUrl);
    riskScore += contentAnalysis.score;
    threats.push(...contentAnalysis.threats);
  }

  const riskScoreCapped = Math.min(riskScore, 100);
  let status: 'safe' | 'warning' | 'dangerous';

  if (riskScoreCapped >= 50) {
    status = 'dangerous';
  } else if (riskScoreCapped >= 25) {
    status = 'warning';
  } else {
    status = 'safe';
  }

  return {
    url,
    status,
    riskScore: riskScoreCapped,
    threats: threats.slice(0, 4), // Increased from 3 to 4 to show more threats
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
    const localScans = await loadLocalScans(userId);
    return localScans.slice(0, limit);
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
    const localScans = await loadLocalScans(userId);
    return computeLocalStats(localScans, userId);
  }
};

export const recordLocalScan = async (
  userId: string | undefined,
  scan: AnalysisResult
): Promise<void> => {
  await saveLocalScan(userId, scan);
};

export const getProtectionStatus = async (
  userId: string
): Promise<boolean | null> => {
  try {
    const response = await api.get<ProtectionStatusResponse>(`/user/${userId}/protection`);
    return response.protection_active;
  } catch (error) {
    console.warn('Error fetching protection status:', error);
    return null;
  }
};

export const setProtectionStatus = async (
  userId: string,
  enabled: boolean
): Promise<boolean> => {
  try {
    const response = await api.post<ProtectionStatusResponse>(
      `/user/${userId}/protection`,
      { enabled }
    );
    return response.protection_active === enabled;
  } catch (error) {
    console.warn('Error updating protection status:', error);
    return false;
  }
};

export const recordBackgroundScan = async (
  userId: string | undefined,
  count: number = 1
): Promise<void> => {
  if (!userId) {
    await incrementLocalBackgroundCount(userId, count);
    return;
  }

  try {
    await api.post<BackgroundScanResponse>(`/user/${userId}/background-scan`, {
      count,
    });
  } catch (error) {
    console.warn('Error recording background scan:', error);
    await incrementLocalBackgroundCount(userId, count);
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
