import { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import SearchBar from '@/components/SearchBar';
import SearchResult from '@/components/SearchResult';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface SearchResultType {
  title: string;
  url: string;
  extract: string;
}

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResultType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenDrawer = () => {
    console.log('Menu button pressed, opening drawer...');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      navigation.openDrawer();
      console.log('Drawer opened successfully');
    } catch (error) {
      console.error('Error opening drawer:', error);
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
      
      // Transform the API response to our format
      // API returns: { title: [{value: string, is_bold: boolean}], extract: [...], url: string }
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Menu Button */}
      <Pressable
        onPress={handleOpenDrawer}
        style={({ pressed }) => [
          styles.menuButton,
          {
            top: insets.top + 8,
            backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Ionicons name="menu" size={24} color={Colors[colorScheme ?? 'light'].text} />
      </Pressable>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {results.length === 0 ? (
          <View style={styles.centeredContent}>
            <ThemedView style={styles.header}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logo}
                contentFit="contain"
              />
              <ThemedText type="title" style={styles.title}>mwmbl</ThemedText>
            </ThemedView>

            <SearchBar
              value={searchQuery}
              onChangeText={handleQueryChange}
              onSubmit={() => handleSearch(searchQuery)}
              isLoading={isLoading}
            />

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
          </View>
        ) : (
          <View style={styles.resultsContent}>
            <ThemedView style={styles.headerCompact}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logoSmall}
                contentFit="contain"
              />
              <ThemedText type="title" style={styles.titleCompact}>mwmbl</ThemedText>
            </ThemedView>

            <SearchBar
              value={searchQuery}
              onChangeText={handleQueryChange}
              onSubmit={() => handleSearch(searchQuery)}
              isLoading={isLoading}
            />

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
          </View>
        )}
      </KeyboardAvoidingView>
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
  menuButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1000,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  resultsContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  headerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  logo: {
    width: 40,
    height: 40,
  },
  logoSmall: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  titleCompact: {
    fontSize: 24,
    fontWeight: 'bold',
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
  },
});
