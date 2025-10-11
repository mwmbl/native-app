import { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import SearchResult from '@/components/SearchResult';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth-context';
import { useTheme } from '@/hooks/use-theme-context';
import { useTabs } from '@/hooks/use-tabs-context';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface SearchResultType {
  title: string;
  url: string;
  extract: string;
}

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tabs, switchTab, closeTab } = useTabs();
  const { isAuthenticated, username, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResultType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleOpenTab = (tabId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switchTab(tabId);
    router.push('/browser');
  };

  const handleCloseTab = (tabId: string, e?: any) => {
    e?.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeTab(tabId);
  };

  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.mwmbl.org/api/v1/search/?s=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      const transformedResults = data.map((item: any) => ({
        title: item.title.map((t: any) => t.value).join(''),
        url: item.url,
        extract: item.extract.map((e: any) => e.value).join(''),
      }));
      
      setResults(transformedResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleQueryChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      handleSearch(text);
    } else {
      setResults([]);
    }
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMenu(false);
    router.push('/login');
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await logout();
    setShowMenu(false);
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThemeMode(mode);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        {results.length === 0 ? (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.centeredContent}
            showsVerticalScrollIndicator={false}
          >
            <ThemedView style={styles.header}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logo}
                contentFit="contain"
              />
              <ThemedText type="title" style={styles.title}>mwmbl</ThemedText>
            </ThemedView>

            {/* Open Tabs Section */}
            {tabs.length > 0 && !searchQuery.trim() && (
              <View style={styles.tabsSection}>
                <ThemedText style={styles.tabsSectionTitle}>Open Tabs</ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tabsScroll}
                >
                  {tabs.map((tab) => (
                    <Pressable
                      key={tab.id}
                      onPress={() => handleOpenTab(tab.id)}
                      style={({ pressed }) => [
                        styles.tabCard,
                        {
                          backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <View style={styles.tabCardHeader}>
                        <ThemedText numberOfLines={1} style={styles.tabCardDomain}>
                          {getDomain(tab.url)}
                        </ThemedText>
                        <Pressable
                          onPress={(e) => handleCloseTab(tab.id, e)}
                          style={({ pressed }) => [
                            styles.tabCardCloseButton,
                            { opacity: pressed ? 0.5 : 1 },
                          ]}
                        >
                          <Ionicons name="close-circle" size={20} color={colors.icon} />
                        </Pressable>
                      </View>
                      <ThemedText numberOfLines={2} style={styles.tabCardTitle}>
                        {tab.title || 'Untitled'}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {!searchQuery.trim() && (
              <ThemedView style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>
                  Search the web with mwmbl
                </ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  A non-profit, ad-free search engine
                </ThemedText>
              </ThemedView>
            )}

            {searchQuery.trim() && !isLoading && (
              <ThemedView style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>
                  No results found
                </ThemedText>
              </ThemedView>
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.url}-${index}`}
            renderItem={({ item }) => (
              <SearchResult
                title={item.title}
                url={item.url}
                extract={item.extract}
              />
            )}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Bottom Search Bar */}
        <View style={[styles.bottomSearchBar, {
          backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
          borderTopColor: colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA',
          paddingBottom: insets.bottom || 8,
        }]}>
          <Pressable
            onPress={() => setShowMenu(true)}
            style={({ pressed }) => [
              styles.menuIconButton,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <Ionicons name="ellipsis-horizontal-circle" size={28} color={colors.tint} />
          </Pressable>

          <View style={[styles.searchInputContainer, {
            backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#fff',
          }]}>
            <Ionicons name="search" size={18} color={colors.icon} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search or enter website"
              placeholderTextColor={colors.icon}
              value={searchQuery}
              onChangeText={handleQueryChange}
              onSubmitEditing={() => handleSearch(searchQuery)}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.tint} style={styles.inputIcon} />
            ) : searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')} style={styles.inputIcon}>
                <Ionicons name="close-circle" size={18} color={colors.icon} />
              </Pressable>
            ) : null}
          </View>

          {tabs.length > 0 && (
            <Pressable
              onPress={() => handleOpenTab(tabs[tabs.length - 1].id)}
              style={({ pressed }) => [
                styles.tabCountButton,
                {
                  borderColor: colors.text,
                  opacity: pressed ? 0.5 : 1,
                },
              ]}
            >
              <ThemedText style={styles.tabCountText}>{tabs.length}</ThemedText>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Safari-style Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <Pressable 
            style={[styles.menuModal, {
              backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#fff',
            }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* User Section */}
            {isAuthenticated ? (
              <View style={styles.menuSection}>
                <View style={[styles.menuItem, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7' }]}>
                  <Ionicons name="person" size={24} color={colors.tint} />
                  <ThemedText style={[styles.menuItemText, { color: colors.tint }]}>{username}</ThemedText>
                </View>
                <Pressable
                  onPress={handleLogout}
                  style={({ pressed }) => [
                    styles.menuItem,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Ionicons name="log-out-outline" size={24} color={colors.text} />
                  <ThemedText style={styles.menuItemText}>Logout</ThemedText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.menuSection}>
                <Pressable
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.menuItem,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Ionicons name="log-in-outline" size={24} color={colors.text} />
                  <ThemedText style={styles.menuItemText}>Login</ThemedText>
                </Pressable>
              </View>
            )}

            {/* Theme Section */}
            <View style={styles.menuSection}>
              <ThemedText style={styles.menuSectionTitle}>APPEARANCE</ThemedText>
              <Pressable
                onPress={() => handleThemeChange('system')}
                style={({ pressed }) => [
                  styles.menuItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="phone-portrait-outline" size={24} color={themeMode === 'system' ? colors.tint : colors.text} />
                <ThemedText style={[styles.menuItemText, themeMode === 'system' && { color: colors.tint, fontWeight: '600' }]}>
                  System
                </ThemedText>
                {themeMode === 'system' && <Ionicons name="checkmark" size={24} color={colors.tint} />}
              </Pressable>
              <Pressable
                onPress={() => handleThemeChange('light')}
                style={({ pressed }) => [
                  styles.menuItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="sunny" size={24} color={themeMode === 'light' ? colors.tint : colors.text} />
                <ThemedText style={[styles.menuItemText, themeMode === 'light' && { color: colors.tint, fontWeight: '600' }]}>
                  Light
                </ThemedText>
                {themeMode === 'light' && <Ionicons name="checkmark" size={24} color={colors.tint} />}
              </Pressable>
              <Pressable
                onPress={() => handleThemeChange('dark')}
                style={({ pressed }) => [
                  styles.menuItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="moon" size={24} color={themeMode === 'dark' ? colors.tint : colors.text} />
                <ThemedText style={[styles.menuItemText, themeMode === 'dark' && { color: colors.tint, fontWeight: '600' }]}>
                  Dark
                </ThemedText>
                {themeMode === 'dark' && <Ionicons name="checkmark" size={24} color={colors.tint} />}
              </Pressable>
            </View>

            {/* Cancel Button */}
            <Pressable
              onPress={() => setShowMenu(false)}
              style={({ pressed }) => [
                styles.cancelButton,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
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
  tabsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  tabsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tabsScroll: {
    gap: 12,
    paddingRight: 16,
  },
  tabCard: {
    width: 200,
    height: 120,
    borderRadius: 12,
    padding: 12,
  },
  tabCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tabCardDomain: {
    fontSize: 12,
    opacity: 0.6,
    flex: 1,
  },
  tabCardCloseButton: {
    padding: 4,
  },
  tabCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
  },
  resultsList: {
    padding: 16,
    paddingBottom: 100,
  },
  bottomSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  menuIconButton: {
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  inputIcon: {
    padding: 4,
  },
  tabCountButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  menuModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 8,
    marginLeft: 16,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  menuItemText: {
    fontSize: 17,
    flex: 1,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

