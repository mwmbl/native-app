import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Favorite {
  id: string;
  url: string;
  title: string;
  domain: string;
  addedAt: number;
}

interface FavoritesContextType {
  favorites: Favorite[];
  addFavorite: (url: string, title: string) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (url: string) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = '@mwmbl_favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async (newFavorites: Favorite[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const getDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const addFavorite = async (url: string, title: string) => {
    const newFavorite: Favorite = {
      id: Date.now().toString(),
      url,
      title,
      domain: getDomain(url),
      addedAt: Date.now(),
    };

    const newFavorites = [newFavorite, ...favorites];
    await saveFavorites(newFavorites);
  };

  const removeFavorite = async (id: string) => {
    const newFavorites = favorites.filter((fav) => fav.id !== id);
    await saveFavorites(newFavorites);
  };

  const isFavorite = (url: string): boolean => {
    return favorites.some((fav) => fav.url === url);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        isLoading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

