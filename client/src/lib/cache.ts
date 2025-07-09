// Sistema de cache simples para acelerar o carregamento das páginas
interface CacheItem {
  data: any;
  timestamp: number;
  expires: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem>();
  private readonly DEFAULT_TTL = 30000; // 30 segundos

  set(key: string, data: any, ttl = this.DEFAULT_TTL) {
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttl,
    };
    this.cache.set(key, item);
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear() {
    this.cache.clear();
  }

  // Limpeza automática de itens expirados
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new SimpleCache();

// Cleanup automático a cada 5 minutos
setInterval(() => cache.cleanup(), 5 * 60 * 1000);

// Helper para cache de queries
export function getCachedQuery(queryKey: string): any | null {
  return cache.get(`query:${queryKey}`);
}

export function setCachedQuery(queryKey: string, data: any, ttl?: number): void {
  cache.set(`query:${queryKey}`, data, ttl);
}

// Helper para cache de produtos
export function getCachedProduct(url: string): any | null {
  return cache.get(`product:${url}`);
}

export function setCachedProduct(url: string, data: any, ttl = 10 * 60 * 1000): void { // 10 minutos
  cache.set(`product:${url}`, data, ttl);
}