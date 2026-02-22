import React, { useState } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Shield, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react-native';
import { signIn } from '@/services/authService';
import { useApp } from '@/contexts/AppContext';

export default function LoginScreen() {
  const router = useRouter();
  const { refresh } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const user = await signIn(email, password);
      if (user) {
        await refresh();
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Invalid credentials. Please try again or register.');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0A0F1C', '#0F172A', '#1E293B']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header with Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Shield size={48} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.logoText}>PhishGuard</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to protect yourself from cyber threats</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity 
          style={styles.loginButton} 
          activeOpacity={0.8}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.loginButtonText}>Sign In</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Register Button */}
        <TouchableOpacity 
          style={styles.registerButton} 
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/register')}
        >
          <View style={styles.buttonContent}>
            <UserPlus size={20} color="#10B981" />
            <Text style={styles.registerButtonText}>Create Account</Text>
          </View>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: 24, paddingTop: 40 },
  
  // Logo
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(16, 185, 129, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: 'rgba(16, 185, 129, 0.3)' },
  logoText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', letterSpacing: 1 },
  
  // Header
  header: { marginBottom: 32, gap: 8 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#94A3B8', fontSize: 15, lineHeight: 22 },
  
  // Form
  formSection: { marginBottom: 24, gap: 20 },
  inputContainer: { gap: 8 },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)' },
  inputIcon: { marginLeft: 16 },
  input: { flex: 1, padding: 16, color: '#FFFFFF', fontSize: 15 },
  
  // Forgot Password
  forgotPassword: { color: '#10B981', fontSize: 14, marginBottom: 24, fontWeight: '500' },
  
  // Buttons
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loginButton: { backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 20, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  
  // Divider
  dividerContainer: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(148, 163, 184, 0.2)' },
  dividerText: { color: '#64748B', fontSize: 12, textAlign: 'center', fontWeight: '600' },
  
  // Register Button
  registerButton: { backgroundColor: 'transparent', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: '#10B981' },
  registerButtonText: { color: '#10B981', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  
  // Footer
  footer: { color: '#64748B', fontSize: 11, textAlign: 'center' }
});
