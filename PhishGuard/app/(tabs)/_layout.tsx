import { Tabs } from 'expo-router';
import { Shield, History, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: { 
        backgroundColor: '#1E293B', 
        borderTopWidth: 0,
        borderWidth: 2,
        borderColor: 'rgba(16, 185, 129, 0.4)',
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        marginHorizontal: 20,
        borderRadius: 30,
        height: Platform.OS === 'ios' ? 70 : 65,
        paddingBottom: Platform.OS === 'ios' ? 8 : 10,
        paddingTop: 10,
        paddingLeft: 15,
        paddingRight: 15,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 25,
        // 3D Metal effect
        overflow: 'hidden',
      },
      tabBarActiveTintColor: '#10B981',
      tabBarInactiveTintColor: '#64748B',
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }: { color: string }) => <Shield size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }: { color: string }) => <History size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }: { color: string }) => <Settings size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null, // Hide this tab
        }}
      />
    </Tabs>
  );
}