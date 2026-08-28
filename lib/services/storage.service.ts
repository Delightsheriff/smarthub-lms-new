class StorageService {
  private get available(): boolean {
    return typeof window !== "undefined" && !!window.localStorage;
  }

  get(key: string): string | null {
    if (!this.available) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    if (!this.available) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  }

  remove(key: string): void {
    if (!this.available) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  getJSON<T>(key: string): T | undefined {
    const raw = this.get(key);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }

  setJSON<T>(key: string, value: T): void {
    try {
      this.set(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }
}

export const storageService = new StorageService();
