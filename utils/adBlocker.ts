import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_BLOCKLIST_KEY = '@mwmbl_custom_blocklist';

/**
 * Comprehensive list of common ad and tracking domains
 * Based on popular ad blocking lists
 */
const DEFAULT_BLOCKLIST = [
  // Google Ads
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'google-analytics.com',
  'googletagmanager.com',
  'googletagservices.com',
  'adservice.google.com',
  
  // Facebook/Meta
  'facebook.com/tr',
  'connect.facebook.net',
  'facebook-hardware.com',
  
  // Amazon
  'amazon-adsystem.com',
  'amazonclix.com',
  
  // Microsoft
  'ads.microsoft.com',
  'bat.bing.com',
  
  // Twitter/X
  'ads-twitter.com',
  't.co',
  'analytics.twitter.com',
  
  // Popular ad networks
  'adnxs.com',
  'advertising.com',
  'outbrain.com',
  'taboola.com',
  'criteo.com',
  'scorecardresearch.com',
  'serving-sys.com',
  'adsrvr.org',
  'adsafeprotected.com',
  'moatads.com',
  'rubiconproject.com',
  'pubmatic.com',
  'openx.net',
  'adtech.de',
  'adzerk.net',
  'advertising.com',
  'admob.com',
  'inmobi.com',
  'chartbeat.com',
  'quantserve.com',
  'quantcast.com',
  '2mdn.net',
  
  // Analytics
  'hotjar.com',
  'mouseflow.com',
  'segment.com',
  'segment.io',
  'newrelic.com',
  'nr-data.net',
  'mixpanel.com',
  'amplitude.com',
  'fullstory.com',
  
  // Ad exchanges
  'adform.net',
  'smartadserver.com',
  'indexww.com',
  'casalemedia.com',
  'bluekai.com',
  'exelator.com',
  'krxd.net',
  'everesttech.net',
  'adroll.com',
  'rlcdn.com',
  'agkn.com',
  
  // Video ads
  'videoplaza.com',
  'videoplaza.tv',
  'imasdk.googleapis.com',
  'fwmrm.net',
  
  // Social widgets (tracking)
  'addtoany.com',
  'addthis.com',
  'sharethis.com',
  
  // Tracking pixels
  'pixel.mathtag.com',
  'pixel.advertising.com',
  'pixel.quantserve.com',
  
  // RTB and DMPs
  'contextweb.com',
  'advertising.com',
  'turn.com',
  'mathtag.com',
  'mookie1.com',
  'demdex.net',
  'eyeota.net',
  'adsymptotic.com',
  
  // CDN for ads
  'ad.doubleclick.net',
  'pubads.g.doubleclick.net',
  'securepubads.g.doubleclick.net',
  'tpc.googlesyndication.com',
  'pagead2.googlesyndication.com',
  'afs.googlesyndication.com',
  
  // Popular trackers
  'cloudflare.com/cdn-cgi/zaraz',
  'clarity.ms',
  'bing.com/sa',
  'media.net',
  'yandex.ru/metrika',
  
  // Push notification services
  'onesignal.com',
  'pushwoosh.com',
  'pusher.com',
  
  // Affiliate networks
  'cj.com',
  'dpbolvw.net',
  'jdoqocy.com',
  'anrdoezrs.net',
  'kqzyfj.com',
  'apmebf.com',
  'linksynergy.com',
  'shareasale.com',
  'pjatr.com',
  'pjtra.com',
  'clickbank.net',
  'clkbank.com',
  
  // More ad servers
  'advertising.com',
  'yieldmanager.com',
  'xiti.com',
  'webtrekk.net',
  'atdmt.com',
  'adserver.com',
  'adbrite.com',
  'adbureau.net',
  'admarvel.com',
  'admeld.com',
  'admob.com',
  'adserver.com',
  'advertising.com',
  'tribalfusion.com',
  'valueclick.com',
  'burstnet.com',
  'fastclick.net',
  'revcontent.com',
  'mgid.com',
  
  // Additional trackers
  'optimizely.com',
  'omtrdc.net',
  'omniture.com',
  'siteintercept.qualtrics.com',
  'surveymonkey.com',
  'qualtrics.com',
  'uservoice.com',
  'usabilla.com',
  
  // Pop-ups and redirects
  'popads.net',
  'popcash.net',
  'propellerads.com',
  'adcash.com',
  'hilltopads.net',
  'plugrush.com',
  'exoclick.com',
  'juicyads.com',
  'trafficjunky.net',
];

/**
 * Extracts the hostname from a URL
 */
function extractHostname(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Checks if a hostname matches a blocked domain (including subdomains)
 * 
 * @param hostname - The hostname to check (e.g., 'ads.example.com')
 * @param blockedDomain - The blocked domain (e.g., 'example.com')
 * @returns true if the hostname matches the blocked domain or is a subdomain
 */
function matchesDomain(hostname: string, blockedDomain: string): boolean {
  // Exact match
  if (hostname === blockedDomain) {
    return true;
  }
  
  // Subdomain match (e.g., ads.example.com matches example.com)
  if (hostname.endsWith('.' + blockedDomain)) {
    return true;
  }
  
  return false;
}

/**
 * Checks if a URL should be blocked based on the default and custom blocklists
 * 
 * @param url - The URL to check
 * @param customDomains - Additional custom domains to block
 * @returns true if the URL should be blocked
 */
export function shouldBlockRequest(url: string, customDomains: string[] = []): boolean {
  const hostname = extractHostname(url);
  if (!hostname) {
    return false;
  }
  
  // Check against default blocklist
  for (const domain of DEFAULT_BLOCKLIST) {
    if (matchesDomain(hostname, domain)) {
      return true;
    }
  }
  
  // Check against custom blocklist
  for (const domain of customDomains) {
    if (matchesDomain(hostname, domain.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

/**
 * Loads custom blocked domains from AsyncStorage
 */
export async function loadCustomBlocklist(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(CUSTOM_BLOCKLIST_KEY);
    if (json) {
      return JSON.parse(json);
    }
  } catch (error) {
    console.error('[Ad Blocker] Error loading custom blocklist:', error);
  }
  return [];
}

/**
 * Saves custom blocked domains to AsyncStorage
 */
export async function saveCustomBlocklist(domains: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CUSTOM_BLOCKLIST_KEY, JSON.stringify(domains));
  } catch (error) {
    console.error('[Ad Blocker] Error saving custom blocklist:', error);
  }
}

/**
 * Adds a domain to the custom blocklist
 */
export async function addCustomDomain(domain: string): Promise<string[]> {
  const domains = await loadCustomBlocklist();
  const normalizedDomain = domain.toLowerCase().trim();
  
  if (!domains.includes(normalizedDomain)) {
    domains.push(normalizedDomain);
    await saveCustomBlocklist(domains);
  }
  
  return domains;
}

/**
 * Removes a domain from the custom blocklist
 */
export async function removeCustomDomain(domain: string): Promise<string[]> {
  const domains = await loadCustomBlocklist();
  const normalizedDomain = domain.toLowerCase().trim();
  const filtered = domains.filter(d => d !== normalizedDomain);
  
  await saveCustomBlocklist(filtered);
  return filtered;
}

/**
 * Gets the default blocklist (for display/debugging purposes)
 */
export function getDefaultBlocklist(): readonly string[] {
  return DEFAULT_BLOCKLIST;
}

