import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    // In cache-manager v5, reset is store-specific
    const store = (this.cacheManager as any).store;
    if (store && typeof store.reset === 'function') {
      await store.reset();
    } else {
      // Fallback: clear all keys by getting all keys and deleting them
      // Note: This is a workaround if reset is not available
      const keys = await this.getAllKeys();
      await Promise.all(keys.map(key => this.del(key)));
    }
  }

  private async getAllKeys(): Promise<string[]> {
    // This is a helper method to get all keys
    // Implementation depends on the store type
    const store = (this.cacheManager as any).store;
    if (store && typeof store.keys === 'function') {
      return await store.keys();
    }
    // If keys method is not available, return empty array
    // In production, you might want to track keys separately
    return [];
  }

  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    return this.cacheManager.wrap(key, fn, ttl);
  }
}

