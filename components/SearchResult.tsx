import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTabs } from '@/hooks/use-tabs-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

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
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // On web, open in new tab using native browser
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
      return;
    }
    
    // On mobile, create tab and navigate
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
          borderColor: colorScheme === 'dark' ? '#3A3A3C' : '#E5E5EA',
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
