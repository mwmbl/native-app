import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAdBlocker } from '@/hooks/use-ad-blocker';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFavorites } from '@/hooks/use-favorites-context';
import { useTabs } from '@/hooks/use-tabs-context';
import { getDomain } from '@/utils/url';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

export default function BrowserScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { tabs, activeTab, createTab, closeTab, switchTab, updateTab, closeAllTabs } = useTabs();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { shouldBlockRequest } = useAdBlocker();

  const url = typeof params.url === 'string' ? params.url : '';
  const title = typeof params.title === 'string' ? params.title : '';

  const webViewRefs = useRef<{ [key: string]: WebView | null }>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [showTabSwitcher, setShowTabSwitcher] = useState(false);

  // Create initial tab if coming from search results
  useEffect(() => {
    if (url && tabs.length === 0) {
      createTab(url, title);
    }
  }, []);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeAllTabs();
    navigation.goBack();
  };

  const handleGoBack = () => {
    if (activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      webViewRefs.current[activeTab.id]?.goBack();
    }
  };

  const handleGoForward = () => {
    if (activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      webViewRefs.current[activeTab.id]?.goForward();
    }
  };

  const handleRefresh = () => {
    if (activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const isCurrentlyLoading = isLoading[activeTab.id];
      if (isCurrentlyLoading) {
        webViewRefs.current[activeTab.id]?.stopLoading();
      } else {
        webViewRefs.current[activeTab.id]?.reload();
      }
    }
  };

  const handleShare = async () => {
    if (activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      try {
        await Share.share({
          message: activeTab.url,
          url: activeTab.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (isFavorite(activeTab.url)) {
        // Find and remove the favorite
        const favorites = await AsyncStorage.getItem('@mwmbl_favorites');
        if (favorites) {
          const parsed = JSON.parse(favorites);
          const fav = parsed.find((f: any) => f.url === activeTab.url);
          if (fav) {
            await removeFavorite(fav.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      } else {
        await addFavorite(activeTab.url, activeTab.title);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleNewTab = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTabSwitcher(false);
    navigation.goBack(); // Return to search/index view
  };

  const handleCloseTab = (tabId: string, e?: any) => {
    e?.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeTab(tabId);
    if (tabs.length === 1) {
      // Last tab being closed, go back to search
      handleBack();
    }
  };

  const handleSwitchTab = (tabId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switchTab(tabId);
    setShowTabSwitcher(false);
  };

  const handleToggleTabSwitcher = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTabSwitcher(!showTabSwitcher);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.iconButton,
            { opacity: pressed ? 0.5 : 1 },
          ]}
        >
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </Pressable>

        <View style={styles.titleContainer}>
          <ThemedText numberOfLines={1} style={styles.titleText}>
            {activeTab?.title || 'Browser'}
          </ThemedText>
          <ThemedText numberOfLines={1} style={styles.urlText}>
            {activeTab ? getDomain(activeTab.url) : ''}
          </ThemedText>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={handleToggleFavorite}
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <Ionicons 
              name={activeTab && isFavorite(activeTab.url) ? "star" : "star-outline"} 
              size={24} 
              color={activeTab && isFavorite(activeTab.url) ? colors.tint : colors.text} 
            />
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* WebViews Container */}
      <View style={styles.webviewContainer}>
        {tabs.map((tab) => (
          <View
            key={tab.id}
            style={[
              styles.webviewWrapper,
              { display: tab.id === activeTab?.id ? 'flex' : 'none' },
            ]}
          >
            <WebView
              ref={(ref) => {
                webViewRefs.current[tab.id] = ref;
              }}
              source={{ uri: tab.url }}
              style={styles.webview}
              onLoadStart={() => setIsLoading((prev) => ({ ...prev, [tab.id]: true }))}
              onLoadEnd={() => setIsLoading((prev) => ({ ...prev, [tab.id]: false }))}
              onNavigationStateChange={(navState) => {
                updateTab(tab.id, {
                  canGoBack: navState.canGoBack,
                  canGoForward: navState.canGoForward,
                  url: navState.url,
                  title: navState.title,
                });
              }}
              onShouldStartLoadWithRequest={(request) => {
                const blocked = shouldBlockRequest(request.url);
                if (blocked) {
                  console.log('[Ad Blocker] Blocked:', request.url);
                }
                return !blocked;
              }}
              allowsBackForwardNavigationGestures
              startInLoadingState
              renderLoading={() => (
                <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                  <ActivityIndicator size="large" color={colors.tint} />
                </View>
              )}
            />
          </View>
        ))}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomBar, { 
        backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
        borderTopColor: colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA',
      }]}>
        <Pressable
          onPress={handleGoBack}
          disabled={!activeTab?.canGoBack}
          style={({ pressed }) => [
            styles.navButton,
            { opacity: !activeTab?.canGoBack ? 0.3 : pressed ? 0.5 : 1 },
          ]}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={colors.text} 
          />
        </Pressable>

        <Pressable
          onPress={handleGoForward}
          disabled={!activeTab?.canGoForward}
          style={({ pressed }) => [
            styles.navButton,
            { opacity: !activeTab?.canGoForward ? 0.3 : pressed ? 0.5 : 1 },
          ]}
        >
          <Ionicons 
            name="arrow-forward" 
            size={24} 
            color={colors.text} 
          />
        </Pressable>

        <Pressable
          onPress={handleRefresh}
          style={({ pressed }) => [
            styles.navButton,
            { opacity: pressed ? 0.5 : 1 },
          ]}
        >
          <Ionicons 
            name={activeTab && isLoading[activeTab.id] ? "close" : "reload"} 
            size={24} 
            color={colors.text} 
          />
        </Pressable>

        <Pressable
          onPress={handleToggleTabSwitcher}
          style={({ pressed }) => [
            styles.tabButton,
            { 
              borderColor: colors.text,
              opacity: pressed ? 0.5 : 1,
            },
          ]}
        >
          <ThemedText style={styles.tabButtonText}>{tabs.length}</ThemedText>
        </Pressable>
      </View>

      {/* Tab Switcher Modal */}
      <Modal
        visible={showTabSwitcher}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTabSwitcher(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]} edges={['top']}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}>
            <ThemedText type="title" style={styles.modalTitle}>
              {tabs.length} {tabs.length === 1 ? 'Tab' : 'Tabs'}
            </ThemedText>
            <Pressable
              onPress={() => setShowTabSwitcher(false)}
              style={({ pressed }) => [
                styles.modalCloseButton,
                { opacity: pressed ? 0.5 : 1 },
              ]}
            >
              <ThemedText style={styles.modalDoneText}>Done</ThemedText>
            </Pressable>
          </View>

          {/* Tabs Grid */}
          <ScrollView 
            contentContainerStyle={styles.tabsGrid}
            showsVerticalScrollIndicator={false}
          >
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                onPress={() => handleSwitchTab(tab.id)}
                style={({ pressed }) => [
                  styles.tabCard,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                    borderColor: tab.id === activeTab?.id ? colors.tint : 'transparent',
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
                      styles.tabCloseButton,
                      { opacity: pressed ? 0.5 : 1 },
                    ]}
                  >
                    <Ionicons name="close" size={20} color={colors.text} />
                  </Pressable>
                </View>
                <ThemedText numberOfLines={2} style={styles.tabCardTitle}>
                  {tab.title || 'Untitled'}
                </ThemedText>
              </Pressable>
            ))}

            {/* New Tab Button */}
            <Pressable
              onPress={handleNewTab}
              style={({ pressed }) => [
                styles.newTabCard,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons name="add" size={48} color={colors.tint} />
              <ThemedText style={[styles.newTabText, { color: colors.tint }]}>New Tab</ThemedText>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  urlText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  webviewContainer: {
    flex: 1,
  },
  webviewWrapper: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  navButton: {
    padding: 12,
  },
  tabButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalDoneText: {
    fontSize: 17,
    fontWeight: '600',
  },
  tabsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tabCard: {
    width: (width - 48) / 2,
    height: 160,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
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
  tabCloseButton: {
    padding: 4,
  },
  tabCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  newTabCard: {
    width: (width - 48) / 2,
    height: 160,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  newTabText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
