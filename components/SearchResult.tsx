import { StyleSheet, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTabs } from '@/hooks/use-tabs-context';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface SearchResultProps {
  title: string;
  url: string;
  extract: string;
}

export default function SearchResult({ title, url, extract }: SearchResultProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { createTab, tabs } = useTabs();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // If no tabs exist, create first tab, otherwise navigate to existing browser
    if (tabs.length === 0) {
      router.push({
        pathname: '/browser',
        params: { url, title },
      });
    } else {
      createTab(url, title);
      router.push('/browser');
    }
  };

  // Extract domain from URL
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <Pressable 
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F9F9F9',
          borderColor: colors.tint,
          opacity: pressed ? 0.7 : 1,
        }
      ]}
    >
      <View style={styles.content}>
        <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={2}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.domain, { color: colors.tint }]}>
          {getDomain(url)}
        </ThemedText>
        {extract ? (
          <ThemedText style={styles.extract} numberOfLines={3}>
            {extract}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  content: {
    gap: 6,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
  domain: {
    fontSize: 13,
  },
  extract: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
