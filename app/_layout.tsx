import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { ThemeProvider } from '@/hooks/use-theme-context';
import { AuthProvider } from '@/hooks/use-auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import CustomDrawer from '@/components/CustomDrawer';

function RootNavigator() {
  const colorScheme = useColorScheme();

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Drawer
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: 'front',
          swipeEdgeWidth: 50,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Search',
            title: 'Search',
          }}
        />
        <Drawer.Screen
          name="login"
          options={{
            drawerLabel: 'Login',
            title: 'Login',
            drawerItemStyle: { display: 'none' },
          }}
        />
      </Drawer>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
