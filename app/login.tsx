import { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth-context';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

type TabType = 'login' | 'register';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const navigation = useNavigation();
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Login form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleTabChange = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async () => {
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await login(loginUsername, loginPassword);

    setIsLoading(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error || 'Login failed');
    }
  };

  const handleRegister = async () => {
    if (!registerEmail.trim() || !registerUsername.trim() || !registerPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await register(registerEmail, registerUsername, registerPassword);

    setIsLoading(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess('Account created! Please check your email to verify your account, then log in.');
      setActiveTab('login');
      setRegisterEmail('');
      setRegisterUsername('');
      setRegisterPassword('');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Account</ThemedText>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <ThemedText type="title" style={styles.title}>mwmbl</ThemedText>
          </View>

          {/* Error/Success Message */}
          {error && (
            <View style={[styles.message, styles.errorMessage]}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          {success && (
            <View style={[styles.message, styles.successMessage]}>
              <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
              <ThemedText style={styles.successText}>{success}</ThemedText>
            </View>
          )}

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <Pressable
              onPress={() => handleTabChange('login')}
              style={[
                styles.tab,
                {
                  borderColor: activeTab === 'login' ? colors.tint : 'transparent',
                  borderBottomWidth: activeTab === 'login' ? 2 : 0,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { 
                    color: activeTab === 'login' ? colors.tint : colors.text,
                    fontWeight: activeTab === 'login' ? '600' : '400',
                  },
                ]}
              >
                Log in
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => handleTabChange('register')}
              style={[
                styles.tab,
                {
                  borderColor: activeTab === 'register' ? colors.tint : 'transparent',
                  borderBottomWidth: activeTab === 'register' ? 2 : 0,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { 
                    color: activeTab === 'register' ? colors.tint : colors.text,
                    fontWeight: activeTab === 'register' ? '600' : '400',
                  },
                ]}
              >
                Register
              </ThemedText>
            </Pressable>
          </View>

          {/* Login Form */}
          {activeTab === 'login' && (
            <View style={styles.formContainer}>
              <ThemedText style={styles.formDescription}>
                Log in to your existing account.
              </ThemedText>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                    color: colors.text,
                    borderColor: colors.tint,
                  },
                ]}
                placeholder="Username"
                placeholderTextColor={colors.icon}
                value={loginUsername}
                onChangeText={setLoginUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                    color: colors.text,
                    borderColor: colors.tint,
                  },
                ]}
                placeholder="Password"
                placeholderTextColor={colors.icon}
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />

              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.submitButton,
                  {
                    borderColor: colors.tint,
                    opacity: pressed || isLoading ? 0.7 : 1,
                  },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.tint} />
                ) : (
                  <ThemedText style={[styles.submitButtonText, { color: colors.tint }]}>Log in</ThemedText>
                )}
              </Pressable>
            </View>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <View style={styles.formContainer}>
              <ThemedText style={styles.formDescription}>
                Create a new account.
              </ThemedText>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                    color: colors.text,
                    borderColor: colors.tint,
                  },
                ]}
                placeholder="Username"
                placeholderTextColor={colors.icon}
                value={registerUsername}
                onChangeText={setRegisterUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                    color: colors.text,
                    borderColor: colors.tint,
                  },
                ]}
                placeholder="Email"
                placeholderTextColor={colors.icon}
                value={registerEmail}
                onChangeText={setRegisterEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                    color: colors.text,
                    borderColor: colors.tint,
                  },
                ]}
                placeholder="Password"
                placeholderTextColor={colors.icon}
                value={registerPassword}
                onChangeText={setRegisterPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />

              <Pressable
                onPress={handleRegister}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.submitButton,
                  {
                    borderColor: colors.tint,
                    opacity: pressed || isLoading ? 0.7 : 1,
                  },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.tint} />
                ) : (
                  <ThemedText style={[styles.submitButtonText, { color: colors.tint }]}>Register</ThemedText>
                )}
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorMessage: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  errorText: {
    color: '#DC2626',
    flex: 1,
  },
  successMessage: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  successText: {
    color: '#16A34A',
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    gap: 16,
  },
  formDescription: {
    opacity: 0.6,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

