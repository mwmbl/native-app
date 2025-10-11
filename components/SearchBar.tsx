import { StyleSheet, TextInput, View, ActivityIndicator, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export default function SearchBar({ value, onChangeText, onSubmit, isLoading }: SearchBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBox, { 
        backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
        borderColor: colors.tint,
      }]}>
        <Ionicons 
          name="search" 
          size={20} 
          color={colors.icon} 
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            Platform.OS === 'web' && { outline: 'none' } as any,
          ]}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder="Search..."
          placeholderTextColor={colors.icon}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.tint} style={styles.loadingIcon} />
        ) : value ? (
          <Pressable onPress={() => onChangeText('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.icon} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 48,
    width: '100%',
    maxWidth: 584,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 6px rgba(32, 33, 36, 0.28)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 3,
        elevation: 3,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  loadingIcon: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
});
