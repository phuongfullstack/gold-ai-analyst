/**
 * Simple Cache Manager using localStorage
 */

interface CacheItem<T> {
  value: T;
  expiry: number; // Timestamp in ms
}

export const CacheManager = {
  get: <T>(key: string): T | null => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item: CacheItem<T> = JSON.parse(itemStr);
      const now = Date.now();

      if (now > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch (e) {
      console.warn(`Cache retrieval failed for key: ${key}`, e);
      return null;
    }
  },

  set: <T>(key: string, value: T, ttlSeconds: number): void => {
    try {
      const item: CacheItem<T> = {
        value,
        expiry: Date.now() + (ttlSeconds * 1000),
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.warn(`Cache set failed for key: ${key}`, e);
    }
  },

  clear: (key: string) => {
      localStorage.removeItem(key);
  }
};

/**
 * Higher-order function to wrap async fetchers with caching
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300,
  validator?: (data: T) => boolean
): Promise<T> {
  // 1. Try Cache
  const cached = CacheManager.get<T>(key);
  if (cached) {
    // Optional: Validate cached data (e.g. check for empty objects if that's bad)
    if (!validator || validator(cached)) {
        return cached;
    }
  }

  // 2. Fetch Fresh
  const fresh = await fetcher();

  // 3. Save to Cache (only if valid)
  if (!validator || validator(fresh)) {
      CacheManager.set(key, fresh, ttlSeconds);
  }

  return fresh;
}
