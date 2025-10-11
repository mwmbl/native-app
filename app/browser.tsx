import { useState, useRef } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

export default function BrowserScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const webViewRef = useRef<WebView>(null);

  const url = typeof params.url === 'string' ? params.url : '';
  const title = typeof params.title === 'string' ? params.title : '';

  const [currentUrl, setCurrentUrl] = useState(url);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    webViewRef.current?.goBack();
  };

  const handleGoForward = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    webViewRef.current?.goForward();
  };

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    webViewRef.current?.reload();
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: currentUrl,
        url: currentUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.iconButton,
            { opacity: pressed ? 0.5 : 1 },
          ]}
        >
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>

        <View style={styles.titleContainer}>
          <ThemedText numberOfLines={1} style={styles.titleText}>
            {currentTitle || getDomain(currentUrl)}
          </ThemedText>
          <ThemedText numberOfLines={1} style={styles.urlText}>
            {getDomain(currentUrl)}
          </ThemedText>
        </View>

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

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
          setCanGoForward(navState.canGoForward);
          setCurrentUrl(navState.url);
          setCurrentTitle(navState.title);
        }}
        allowsBackForwardNavigationGestures
        startInLoadingState
        renderLoading={() => (
          <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        )}
      />

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomBar, { 
        backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
        borderTopColor: colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA',
      }]}>
        <Pressable
          onPress={handleGoBack}
          disabled={!canGoBack}
          style={({ pressed }) => [
            styles.navButton,
            { opacity: !canGoBack ? 0.3 : pressed ? 0.5 : 1 },
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
          disabled={!canGoForward}
          style={({ pressed }) => [
            styles.navButton,
            { opacity: !canGoForward ? 0.3 : pressed ? 0.5 : 1 },
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
            name={isLoading ? "close" : "reload"} 
            size={24} 
            color={colors.text} 
          />
        </Pressable>
      </View>
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
});

