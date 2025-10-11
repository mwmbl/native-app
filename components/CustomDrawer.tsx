import { StyleSheet, View, Pressable } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme-context';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const { colorScheme, themeMode, setThemeMode } = useTheme();
  const colors = Colors[colorScheme];

  const handleThemeToggle = (mode: 'light' | 'dark' | 'system') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThemeMode(mode);
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement login functionality
    console.log('Login pressed');
  };

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText type="title" style={styles.title}>mwmbl</ThemedText>
      </ThemedView>

      {/* Menu Items */}
      <View style={styles.menuItems}>
        {/* Login Option */}
        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.menuItem,
            {
              backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons name="person-outline" size={24} color={colors.text} />
          <ThemedText style={styles.menuItemText}>Login</ThemedText>
        </Pressable>

        {/* Theme Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Theme</ThemedText>
          
          {/* System Theme */}
          <Pressable
            onPress={() => handleThemeToggle('system')}
            style={({ pressed }) => [
              styles.themeOption,
              {
                backgroundColor: themeMode === 'system'
                  ? (colorScheme === 'dark' ? '#2C2C2E' : '#E8E8E8')
                  : 'transparent',
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={22}
              color={themeMode === 'system' ? colors.tint : colors.icon}
            />
            <ThemedText
              style={[
                styles.themeOptionText,
                themeMode === 'system' && { color: colors.tint, fontWeight: '600' },
              ]}
            >
              System
            </ThemedText>
            {themeMode === 'system' && (
              <Ionicons name="checkmark" size={22} color={colors.tint} />
            )}
          </Pressable>

          {/* Light Theme */}
          <Pressable
            onPress={() => handleThemeToggle('light')}
            style={({ pressed }) => [
              styles.themeOption,
              {
                backgroundColor: themeMode === 'light'
                  ? (colorScheme === 'dark' ? '#2C2C2E' : '#E8E8E8')
                  : 'transparent',
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons
              name="sunny"
              size={22}
              color={themeMode === 'light' ? colors.tint : colors.icon}
            />
            <ThemedText
              style={[
                styles.themeOptionText,
                themeMode === 'light' && { color: colors.tint, fontWeight: '600' },
              ]}
            >
              Light
            </ThemedText>
            {themeMode === 'light' && (
              <Ionicons name="checkmark" size={22} color={colors.tint} />
            )}
          </Pressable>

          {/* Dark Theme */}
          <Pressable
            onPress={() => handleThemeToggle('dark')}
            style={({ pressed }) => [
              styles.themeOption,
              {
                backgroundColor: themeMode === 'dark'
                  ? (colorScheme === 'dark' ? '#2C2C2E' : '#E8E8E8')
                  : 'transparent',
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons
              name="moon"
              size={22}
              color={themeMode === 'dark' ? colors.tint : colors.icon}
            />
            <ThemedText
              style={[
                styles.themeOptionText,
                themeMode === 'dark' && { color: colors.tint, fontWeight: '600' },
              ]}
            >
              Dark
            </ThemedText>
            {themeMode === 'dark' && (
              <Ionicons name="checkmark" size={22} color={colors.tint} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          A non-profit, ad-free search engine
        </ThemedText>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
    marginBottom: 20,
  },
  logo: {
    width: 36,
    height: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  menuItems: {
    flex: 1,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  themeOptionText: {
    fontSize: 16,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
  },
});

