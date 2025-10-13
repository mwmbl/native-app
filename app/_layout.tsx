import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AuthProvider } from '@/hooks/use-auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FavoritesProvider } from '@/hooks/use-favorites-context';
import { TabsProvider } from '@/hooks/use-tabs-context';
import { ThemeProvider } from '@/hooks/use-theme-context';

function RootNavigator() {
  const colorScheme = useColorScheme();

  // Update document color scheme on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.documentElement.style.colorScheme = colorScheme;
      document.documentElement.setAttribute('data-theme', colorScheme);
    }
  }, [colorScheme]);

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" options={{ presentation: 'modal' }} />
        <Stack.Screen name="browser" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <TabsProvider>
              <RootNavigator />
            </TabsProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
