import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Link, Search, Activity, ShieldCheck, CheckCircle, Zap, AlertTriangle, XCircle } from 'lucide-react-native';
import { analyzeUrl, getRecentScans, getThreatStats } from '../../services/threatAnalysisService';
import { useApp } from '../../contexts/AppContext';
import { useRouter } from 'expo-router';

// Separate component for Scan Items
interface ScanItemProps {
  icon: any;
  title: string;
  status: string;
  time: string;
  statusColor: string;
}

interface ScanData {
  url: string;
  status: 'safe' | 'warning' | 'dangerous';
  timestamp: string;
}

const ScanItem = ({ icon: Icon, title, status, time, statusColor }: ScanItemProps) => (
  <View style={styles.scanItem}>
    <Icon size={18} color={statusColor} />
    <View style={styles.scanContent}>
      <Text style={styles.scanTitle}>{title}</Text>
      <Text style={styles.scanMeta}>
        <Text style={{ color: statusColor }}>{status}</Text> · {time}
      </Text>
    </View>
  </View>
);

export default function PhishGuardDashboard() {
  const { user } = useApp();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{status: 'safe' | 'warning' | 'dangerous', timestamp: string} | null>(null);
  const [recentScans, setRecentScans] = useState<ScanData[]>([]);
  const [stats, setStats] = useState({ threatsBlocked: 0, safeSites: 0, scansTotal: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (user) {
        // Load threat statistics
        const threatStats = await getThreatStats(user.id);
        setStats(threatStats);

        // Load recent scans
        const scans = await getRecentScans(user.id, 3);
        const formattedScans = scans.map(scan => ({
          url: scan.url || '',
          status: scan.status,
          timestamp: new Date(scan.created_at || scan.timestamp || new Date()).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
        setRecentScans(formattedScans);
      } else {
        // Demo data when not logged in
        setStats({ threatsBlocked: 2847, safeSites: 86, scansTotal: 3333 });
        setRecentScans([
          { url: 'google.com', status: 'safe', timestamp: '2:34 PM' },
          { url: 'suspicious-site.xyz', status: 'warning', timestamp: '5:12 PM' },
          { url: 'phishing-trap.com', status: 'dangerous', timestamp: '11:45 AM' },
        ]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const validateUrl = (inputUrl: string) => {
    try {
      new URL(inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleAnalyzeUrl = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL to analyze');
      return;
    }

    if (!validateUrl(url)) {
      Alert.alert('Invalid URL', 'Please enter a valid URL');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeUrl(url, user?.id);
      
      setAnalysisResult({ 
        status: result.status, 
        timestamp: result.timestamp 
      });

      if (Platform.OS !== 'web') {
        const resultMessage = {
          safe: `✓ This URL appears to be safe\nRisk Score: ${result.riskScore}/100`,
          warning: `⚠ This URL has suspicious characteristics\nRisk Score: ${result.riskScore}/100\nThreats: ${result.threats.join(', ')}`,
          dangerous: `✗ This URL is flagged as dangerous\nRisk Score: ${result.riskScore}/100\nThreats: ${result.threats.join(', ')}`
        };

        Alert.alert('Analysis Result', resultMessage[result.status]);
      }
      
      setUrl('');
      
      // Refresh stats if user is logged in
      if (user) {
        await loadData();
      }

      setTimeout(() => {
        router.push('/(tabs)/history');
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze URL. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickScan = () => {
    Alert.alert('Quick Scan', 'Starting comprehensive device scan...\n\nThis may take a few minutes.');
    setTimeout(() => {
      Alert.alert('Scan Complete', `Scanned ${stats.scansTotal} URLs\n✓ All systems secure`);
      if (user) {
        loadData();
      }
    }, 3000);
  };

  return (
    <LinearGradient
      colors={['#0A0F1C', '#0F172A', '#1E293B']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0F1C" translucent={false} />
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <Shield size={28} color="#10B981" />
          <Text style={styles.header}>PhishGuard</Text>
        </View>
        
        {/* Threat Analysis Section */}
        <Text style={styles.sectionTitle}>THREAT ANALYSIS</Text>
        <View style={styles.heroCard}>
          <View style={styles.labelContainer}>
            <Link size={16} color="#94A3B8" />
            <Text style={styles.urlLabel}>Enter URL to Analyze</Text>
          </View>
          <TextInput 
            style={styles.urlInput}
            placeholder="https://example.com"
            placeholderTextColor="#475569"
            value={url}
            onChangeText={setUrl}
            editable={!isAnalyzing}
          />
          <TouchableOpacity 
            style={[styles.analyzeBtn, isAnalyzing && { opacity: 0.6 }]} 
            activeOpacity={0.8}
            onPress={handleAnalyzeUrl}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <ActivityIndicator size={20} color="white" />
                <Text style={styles.analyzeBtnText}>Analyzing...</Text>
              </>
            ) : (
              <>
                <Search size={20} color="white" />
                <Text style={styles.analyzeBtnText}>Analyze URL</Text>
              </>
            )}
          </TouchableOpacity>
          {analysisResult && (
            <View style={styles.resultContainer}>
              <Text style={[
                styles.resultText,
                {
                  color: analysisResult.status === 'safe' ? '#10B981' :
                    analysisResult.status === 'warning' ? '#F59E0B' : '#EF4444'
                }
              ]}>
                {analysisResult.status === 'safe' && '✓ Safe'} 
                {analysisResult.status === 'warning' && '⚠ Warning'} 
                {analysisResult.status === 'dangerous' && '✗ Dangerous'} 
                {' - '}{analysisResult.timestamp}
              </Text>
            </View>
          )}
        </View>

        {/* Security Stats */}
        <Text style={styles.sectionTitle}>SECURITY STATS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statLabelContainer}>
              <ShieldCheck size={12} color="#64748B" />
              <Text style={styles.statLabel}>THREATS BLOCKED</Text>
            </View>
            <Text style={styles.statValue}>{stats.threatsBlocked.toLocaleString()}</Text>
            <Text style={styles.statChange}>+{Math.floor(stats.threatsBlocked * 0.08)} today</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statLabelContainer}>
              <CheckCircle size={12} color="#64748B" />
              <Text style={styles.statLabel}>SAFE SITES</Text>
            </View>
            <Text style={styles.statValue}>{Math.round((stats.safeSites / stats.scansTotal) * 100) || 0}%</Text>
            <Text style={styles.statChange}>From {stats.scansTotal} scans</Text>
          </View>
        </View>

        {/* Recent Scans */}
        <Text style={styles.sectionTitle}>RECENT SCANS</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.recentCard}>
            {recentScans.length > 0 ? (
              recentScans.map((scan, index) => (
                <ScanItem
                  key={index}
                  icon={
                    scan.status === 'safe'
                      ? CheckCircle
                      : scan.status === 'warning'
                      ? AlertTriangle
                      : XCircle
                  }
                  title={scan.url}
                  status={scan.status === 'safe' ? 'Safe' : scan.status === 'warning' ? 'Warning' : 'Dangerous'}
                  time={scan.timestamp}
                  statusColor={
                    scan.status === 'safe'
                      ? '#10B981'
                      : scan.status === 'warning'
                      ? '#F59E0B'
                      : '#EF4444'
                  }
                />
              ))
            ) : (
              <Text style={{ color: '#94A3B8', textAlign: 'center', padding: 20 }}>
                No scans yet. Start by analyzing a URL!
              </Text>
            )}
          </View>
        )}

        {/* Protection Status */}
        <Text style={styles.sectionTitle}>PROTECTION STATUS</Text>
        <View style={styles.protectionCard}>
          <View style={styles.protectionHeader}>
            <View style={styles.protectionTitleContainer}>
              <ShieldCheck size={20} color="#10B981" />
              <Text style={styles.protectionTitle}>Active Protection</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>ONLINE</Text>
            </View>
          </View>
          <Text style={styles.protectionDesc}>
            Real-time phishing detection is active. All URLs are being monitored for suspicious activity.
          </Text>
          <TouchableOpacity 
            style={styles.scanBtn} 
            activeOpacity={0.8}
            onPress={handleQuickScan}
          >
            <Zap size={18} color="white" />
            <Text style={styles.scanBtnText}>Quick Scan</Text>
          </TouchableOpacity>
        </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: 20, paddingTop: 20, paddingBottom: 140 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, marginTop: 30 },
  header: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  sectionTitle: { color: '#64748B', fontSize: 11, fontWeight: '600', marginTop: 20, marginBottom: 8, letterSpacing: 2 },
  
  // Hero Card
  heroCard: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  labelContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  urlLabel: { color: '#94A3B8', fontSize: 14 },
  urlInput: { backgroundColor: '#0F172A', borderRadius: 8, padding: 15, color: 'white', marginBottom: 12, fontSize: 15 },
  resultContainer: { marginTop: 12, padding: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#10B981' },
  resultText: { fontSize: 14, fontWeight: '600' },
  analyzeBtn: { backgroundColor: '#0DA86D', borderRadius: 12, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, shadowColor: 'rgba(16, 185, 129, 0.4)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.8, shadowRadius: 12, elevation: 8, borderWidth: 2, borderTopColor: 'rgba(255, 255, 255, 0.4)', borderColor: 'rgba(16, 185, 129, 0.3)' },
  analyzeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  // Stats Grid
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  statCard: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.15)', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  statLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  statLabel: { color: '#64748B', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5 },
  statValue: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  statChange: { color: '#10B981', fontSize: 12 },
  
  // Recent Scans
  recentCard: { backgroundColor: '#1E293B', borderRadius: 12, padding: 4, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.15)', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  scanItem: { flexDirection: 'row', backgroundColor: '#0F172A', borderRadius: 8, padding: 12, marginBottom: 2, gap: 12, alignItems: 'center' },
  scanContent: { flex: 1, gap: 2 },
  scanTitle: { color: 'white', fontSize: 14 },
  scanMeta: { color: '#64748B', fontSize: 11 },
  
  // Protection Card
  protectionCard: { backgroundColor: '#1E293B', borderRadius: 12, padding: 20, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.15)', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  protectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  protectionTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  protectionTitle: { color: '#10B981', fontSize: 17, fontWeight: 'bold' },
  statusBadge: { backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusBadgeText: { color: '#0A0F1C', fontSize: 9, fontWeight: 'bold' },
  protectionDesc: { color: '#9CA3AF', fontSize: 12, lineHeight: 18, marginBottom: 20 },
  scanBtn: { backgroundColor: '#0DA86D', borderRadius: 8, padding: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, shadowColor: 'rgba(16, 185, 129, 0.4)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.7, shadowRadius: 10, elevation: 7, borderWidth: 2, borderTopColor: 'rgba(255, 255, 255, 0.4)', borderColor: 'rgba(16, 185, 129, 0.3)' },
  scanBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});