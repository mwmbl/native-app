import { useTheme } from './use-theme-context';

export function useColorScheme() {
  const { colorScheme } = useTheme();
  return colorScheme;
}
