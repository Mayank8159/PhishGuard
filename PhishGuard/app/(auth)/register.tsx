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
import { Shield, User, Mail, Lock, KeyRound, ArrowRight, LogIn } from 'lucide-react-native';
import { signUp } from '@/services/authService';
import { useApp } from '@/contexts/AppContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { refresh } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to the Terms & Privacy Policy');
      return;
    }

    setIsLoading(true);
    try {
      const user = await signUp(email, password, name);
      if (user) {
        await refresh();
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join PhishGuard and protect yourself from phishing threats</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

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
                placeholder="Minimum 6 characters"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <KeyRound size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor="#64748B"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Terms Checkbox */}
        <TouchableOpacity 
          style={styles.termsContainer}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
            {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>I agree to Terms & Privacy Policy</Text>
        </TouchableOpacity>

        {/* Register Button */}
        <TouchableOpacity 
          style={styles.registerButton} 
          activeOpacity={0.8}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.registerButtonText}>Create Account</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
        <TouchableOpacity 
          style={styles.signInButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <View style={styles.buttonContent}>
            <LogIn size={18} color="#10B981" />
            <Text style={styles.signInText}>Already have an account? </Text>
            <Text style={styles.signInLink}>Sign In</Text>
          </View>
        </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: 24, paddingTop: 30 },
  
  // Logo
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(16, 185, 129, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: 'rgba(16, 185, 129, 0.3)' },
  logoText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', letterSpacing: 1 },
  
  // Header
  header: { marginBottom: 28, gap: 8 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold' },
  subtitle: { color: '#94A3B8', fontSize: 14, lineHeight: 20 },
  
  // Form
  formSection: { marginBottom: 20, gap: 16 },
  inputContainer: { gap: 8 },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)' },
  inputIcon: { marginLeft: 16 },
  input: { flex: 1, padding: 16, color: '#FFFFFF', fontSize: 14 },
  
  // Terms
  termsContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#64748B', justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  checkmark: { color: '#0A0F1C', fontSize: 14, fontWeight: 'bold' },
  termsText: { color: '#94A3B8', fontSize: 13, flex: 1 },
  
  // Buttons
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  registerButton: { backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  registerButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  
  // Sign In Link
  signInButton: { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  signInText: { color: '#94A3B8', fontSize: 14 },
  signInLink: { color: '#10B981', fontSize: 14, fontWeight: '600' }
});
