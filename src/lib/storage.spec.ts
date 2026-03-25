import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { storage } from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should write and read data', () => {
    const data = { id: '1', name: 'test' };
    storage.write('test_key', data);
    const result = storage.read('test_key', {});
    expect(result).toEqual(data);
  });

  it('should return fallback when key does not exist', () => {
    const fallback = { default: true };
    const result = storage.read('nonexistent_key', fallback);
    expect(result).toEqual(fallback);
  });

  it('should return fallback on JSON parse error', () => {
    localStorage.setItem('bad_key', 'invalid json {');
    const fallback = { default: true };
    const result = storage.read('bad_key', fallback);
    expect(result).toEqual(fallback);
  });

  it('should handle array data', () => {
    const data = [{ id: 1 }, { id: 2 }];
    storage.write('array_key', data);
    const result = storage.read('array_key', []);
    expect(result).toEqual(data);
  });

  it('should handle write failure gracefully', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full');
    });

    const data = { test: 'data' };
    storage.write('key', data);

    vi.restoreAllMocks();
  });
});
