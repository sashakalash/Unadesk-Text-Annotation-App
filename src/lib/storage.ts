import type { ToastService } from '../services/toast.service';

const KEYS = {
  ARTICLES: 'ta_articles',
  ANNOTATIONS: 'ta_annotations',
} as const;

export function read<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write<T>(key: string, value: T, toastService?: ToastService): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    toastService?.error(`Failed to save data to ${key}.`);
  }
}

export const storage = { read, write, KEYS };
