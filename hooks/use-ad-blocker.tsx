import {
    addCustomDomain as addDomain,
    shouldBlockRequest as checkBlockRequest,
    getDefaultBlocklist,
    loadCustomBlocklist,
    removeCustomDomain as removeDomain,
} from '@/utils/adBlocker';
import { useCallback, useEffect, useState } from 'react';

interface AdBlockerHook {
  shouldBlockRequest: (url: string) => boolean;
  addCustomDomain: (domain: string) => Promise<void>;
  removeCustomDomain: (domain: string) => Promise<void>;
  customDomains: string[];
  defaultDomains: readonly string[];
  isLoading: boolean;
}

/**
 * Hook for managing ad blocking functionality
 * 
 * @returns Ad blocker utilities and state
 * 
 * @example
 * const { shouldBlockRequest } = useAdBlocker();
 * 
 * // In WebView:
 * onShouldStartLoadWithRequest={(request) => {
 *   return !shouldBlockRequest(request.url);
 * }}
 */
export function useAdBlocker(): AdBlockerHook {
  const [customDomains, setCustomDomains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load custom domains on mount
  useEffect(() => {
    const loadDomains = async () => {
      setIsLoading(true);
      const domains = await loadCustomBlocklist();
      setCustomDomains(domains);
      setIsLoading(false);
    };

    loadDomains();
  }, []);

  // Check if a request should be blocked
  const shouldBlockRequest = useCallback(
    (url: string): boolean => {
      return checkBlockRequest(url, customDomains);
    },
    [customDomains]
  );

  // Add a custom domain to the blocklist
  const addCustomDomain = useCallback(async (domain: string): Promise<void> => {
    const updatedDomains = await addDomain(domain);
    setCustomDomains(updatedDomains);
  }, []);

  // Remove a custom domain from the blocklist
  const removeCustomDomain = useCallback(async (domain: string): Promise<void> => {
    const updatedDomains = await removeDomain(domain);
    setCustomDomains(updatedDomains);
  }, []);

  return {
    shouldBlockRequest,
    addCustomDomain,
    removeCustomDomain,
    customDomains,
    defaultDomains: getDefaultBlocklist(),
    isLoading,
  };
}

