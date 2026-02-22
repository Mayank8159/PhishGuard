import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Globe, Edit, Lock, ShieldCheck, BarChart, Palette, Bell, Moon, LogOut, ChevronRight, UserCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { signOut } from '@/services/authService';
import { getThreatStats } from '@/services/threatAnalysisService';

interface SettingItemProps {
  icon: any;
  label: string;
  hasArrow?: boolean;
  onPress?: () => void;
}

const SettingItem = ({ icon: Icon, label, hasArrow = false, onPress }: SettingItemProps) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingLabelContainer}>
      <Icon size={18} color="#94A3B8" />
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
    {hasArrow && <ChevronRight size={18} color="#64748B" />}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user, refresh } = useApp();
  const [stats, setStats] = useState({ threatsBlocked: 0, safeSites: 0, scansTotal: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (user) {
      try {
        const threatStats = await getThreatStats(user.id);
        setStats(threatStats);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      try {
        await signOut();
        // Refresh will trigger automatic navigation to login in _layout.tsx
        await refresh();
      } catch (error) {
        Alert.alert('Error', 'Failed to logout');
      }
    };

    if (Platform.OS === 'web') {
      await doLogout();
      return;
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: doLogout }
      ]
    );
  };

  const handleScanHistory = () => {
    router.push('/(tabs)/history');
  };

  return (
    <LinearGradient
      colors={['#0A0F1C', '#0F172A', '#1E293B']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0F1C" translucent={false} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <Settings size={24} color="#10B981" />
          <Text style={styles.pageTitle}>Settings</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginVertical: 40 }} />
        ) : (
          <>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileAvatar}>
                <UserCircle size={40} color="#FFFFFF" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'Not logged in'}</Text>
              </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.scansTotal}</Text>
                <Text style={styles.statLabel}>Total Scans</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.threatsBlocked}</Text>
                <Text style={styles.statLabel}>Threats Blocked</Text>
              </View>
            </View>
          </>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Globe size={12} color="#64748B" />
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
          </View>
          <SettingItem icon={Edit} label="Edit Profile" hasArrow />
          <SettingItem icon={Lock} label="Change Password" hasArrow />
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <ShieldCheck size={12} color="#64748B" />
            <Text style={styles.sectionTitle}>SECURITY</Text>
          </View>
          <SettingItem icon={ShieldCheck} label="Two-Factor Authentication" />
          <SettingItem icon={BarChart} label="Scan History" hasArrow onPress={handleScanHistory} />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Palette size={12} color="#64748B" />
            <Text style={styles.sectionTitle}>PREFERENCES</Text>
          </View>
          <SettingItem icon={Bell} label="Notifications" />
          <SettingItem icon={Moon} label="Dark Mode" />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={handleLogout}>
          <LogOut size={18} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: 24, paddingTop: 20, paddingBottom: 140 },
  
  // Header
  headerContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, marginTop: 30 },
  pageTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  
  // Profile Card
  profileCard: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 16, padding: 16, gap: 12, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.15)', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  profileAvatar: { width: 64, height: 64, backgroundColor: '#10B981', borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  profileEmail: { color: '#94A3B8', fontSize: 14 },
  
  // Stats
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.15)' },
  statValue: { color: '#10B981', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  
  // Section
  section: { marginBottom: 20 },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionTitle: { color: '#64748B', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  
  // Setting Item
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 2, borderTopColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(148, 163, 184, 0.15)', shadowColor: 'rgba(0, 0, 0, 0.3)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  settingLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingLabel: { color: '#FFFFFF', fontSize: 15 },
  
  // Logout Button
  logoutButton: { backgroundColor: '#991B1B', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20, marginBottom: 30, flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 2, borderTopColor: 'rgba(255, 255, 255, 0.35)', borderColor: 'rgba(127, 29, 29, 0.4)', shadowColor: 'rgba(153, 27, 27, 0.5)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.7, shadowRadius: 12, elevation: 8 },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});
