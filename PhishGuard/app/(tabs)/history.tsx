import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, AlertTriangle, XCircle, Trash2 } from 'lucide-react-native';
import { useApp } from '../../contexts/AppContext';
import { getRecentScans, deleteScan } from '../../services/threatAnalysisService';

interface HistoryItemInitials {
  icon: any;
  url: string;
  time: string;
  iconColor: string;
}

const HistoryItem = ({ icon: Icon, url, time, iconColor }: HistoryItemInitials) => (
  <View style={styles.historyItem}>
    <Icon size={20} color={iconColor} />
    <View style={styles.histContent}>
      <Text style={styles.histUrl}>{url}</Text>
      <Text style={styles.histTime}>{time}</Text>
    </View>
  </View>
);

export default function HistoryScreen() {
  const { user } = useApp();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [user, selectedFilter]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      if (user) {
        const scans = await getRecentScans(user.id, 100);
        
        let formattedData = scans.map(item => ({
          id: item.id,
          url: item.url,
          status: item.status,
          time: new Date(item.created_at || item.timestamp || new Date()).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }));

        if (selectedFilter !== 'all') {
          formattedData = formattedData.filter(item => item.status === selectedFilter);
        }

        setHistoryData(formattedData);
      } else {
        // Demo data when not logged in
        setHistoryData([
          { id: '1', url: 'github.com', status: 'safe', time: 'Today at 2:34 PM' },
          { id: '2', url: 'suspicious-link.net', status: 'warning', time: 'Yesterday at 6:12 PM' },
          { id: '3', url: 'phishing-scam.xyz', status: 'dangerous', time: 'Feb 19 at 11:45 AM' },
        ]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Failed to load scan history');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleDeleteScan = async (id: string) => {
    if (!user) return;

    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan record?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteScan(user.id, id);
              await loadHistory();
              Alert.alert('Success', 'Scan deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete scan');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getFilteredData = () => {
    if (selectedFilter === 'all') return historyData;
    return historyData.filter(item => item.status === selectedFilter);
  };

  const filteredData = getFilteredData();

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
        <View style={styles.header}>
          <Text style={styles.title}>Scan History</Text>
          <Text style={styles.subtitle}>View all your past security scans</Text>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={[styles.filterBtn, selectedFilter === 'all' && styles.filterBtnActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, selectedFilter === 'safe' && styles.filterBtnActive]}
            onPress={() => setSelectedFilter('safe')}
          >
            <Text style={[styles.filterText, selectedFilter === 'safe' && styles.filterTextActive]}>
              Safe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, selectedFilter === 'dangerous' && styles.filterBtnActive]}
            onPress={() => setSelectedFilter('dangerous')}
          >
            <Text style={[styles.filterText, selectedFilter === 'dangerous' && styles.filterTextActive]}>
              Threats
            </Text>
          </TouchableOpacity>
        </View>

        {/* History List */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginVertical: 40 }} />
        ) : filteredData.length > 0 ? (
          <View style={styles.historyList}>
            {filteredData.map((item) => (
              <View key={item.id} style={styles.historyItemWrapper}>
                <HistoryItem
                  icon={
                    item.status === 'safe'
                      ? CheckCircle
                      : item.status === 'warning'
                      ? AlertTriangle
                      : XCircle
                  }
                  url={item.url}
                  time={item.time}
                  iconColor={
                    item.status === 'safe'
                      ? '#10B981'
                      : item.status === 'warning'
                      ? '#F59E0B'
                      : '#EF4444'
                  }
                />
                {user && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteScan(item.id)}
                  >
                    <Trash2 size={16} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedFilter === 'all'
                ? 'No scan history yet. Start analyzing URLs!'
                : `No ${selectedFilter} scans found.`}
            </Text>
          </View>
        )}

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
  header: { marginBottom: 32, marginTop: 30, gap: 12 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#94A3B8', fontSize: 14 },
  
  // Filter Section
  filterSection: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  filterBtn: { backgroundColor: '#1E293B', borderRadius: 100, paddingVertical: 10, paddingHorizontal: 20, borderWidth: 2, borderTopColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(148, 163, 184, 0.2)', shadowColor: 'rgba(0, 0, 0, 0.3)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 3 },
  filterBtnActive: { backgroundColor: '#0DA86D', borderColor: 'rgba(16, 185, 129, 0.4)', borderTopColor: 'rgba(255, 255, 255, 0.3)', shadowColor: 'rgba(16, 185, 129, 0.4)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 6 },
  filterText: { color: '#94A3B8', fontSize: 13, textAlign: 'center' },
  filterTextActive: { color: '#0A0F1C', fontWeight: '600' },
  
  // History List
  historyList: { gap: 12 },
  historyItemWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyItem: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 12, padding: 16, gap: 12, alignItems: 'center', flex: 1, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  histContent: { flex: 1, gap: 4 },
  histUrl: { color: '#FFFFFF', fontSize: 14 },
  histTime: { color: '#64748B', fontSize: 12 },
  deleteBtn: { padding: 12, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#94A3B8', fontSize: 16, textAlign: 'center' }
});
