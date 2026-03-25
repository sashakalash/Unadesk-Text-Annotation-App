import { describe, it, expect } from 'vitest';
import { buildSegments } from './annotation-renderer';
import { Annotation } from '../types/annotation.types';

describe('annotation-renderer', () => {
  it('should return single segment with no annotations', () => {
    const text = 'Hello World';
    const result = buildSegments(text, []);
    expect(result).toEqual([{ text: 'Hello World', annotations: [] }]);
  });

  it('should handle empty text', () => {
    const result = buildSegments('', []);
    expect(result).toEqual([]);
  });

  it('should segment single annotation', () => {
    const text = 'Hello World';
    const annotations: Annotation[] = [
      {
        id: '1',
        articleId: 'art1',
        start: 0,
        end: 5,
        color: '#ffeb3b',
        note: 'greeting',
        createdAt: Date.now(),
      },
    ];

    const result = buildSegments(text, annotations);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      text: 'Hello',
      annotations: [annotations[0]],
    });
    expect(result[1]).toEqual({
      text: ' World',
      annotations: [],
    });
  });

  it('should handle adjacent non-overlapping annotations', () => {
    const text = 'Hello World';
    const annotations: Annotation[] = [
      {
        id: '1',
        articleId: 'art1',
        start: 0,
        end: 5,
        color: '#ffeb3b',
        note: 'greeting',
        createdAt: Date.now(),
      },
      {
        id: '2',
        articleId: 'art1',
        start: 6,
        end: 11,
        color: '#ff5722',
        note: 'world',
        createdAt: Date.now(),
      },
    ];

    const result = buildSegments(text, annotations);
    expect(result).toHaveLength(3);
    expect(result[0].text).toBe('Hello');
    expect(result[0].annotations).toHaveLength(1);
    expect(result[1].text).toBe(' ');
    expect(result[1].annotations).toHaveLength(0);
    expect(result[2].text).toBe('World');
    expect(result[2].annotations).toHaveLength(1);
  });

  it('should handle overlapping annotations', () => {
    const text = 'Hello World';
    const ann1: Annotation = {
      id: '1',
      articleId: 'art1',
      start: 0,
      end: 6,
      color: '#ffeb3b',
      note: 'greeting',
      createdAt: Date.now(),
    };
    const ann2: Annotation = {
      id: '2',
      articleId: 'art1',
      start: 3,
      end: 11,
      color: '#ff5722',
      note: 'overlap',
      createdAt: Date.now(),
    };

    const result = buildSegments(text, [ann1, ann2]);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ text: 'Hel', annotations: [ann1] });
    expect(result[1]).toEqual({ text: 'lo ', annotations: [ann1, ann2] });
    expect(result[2]).toEqual({ text: 'World', annotations: [ann2] });
  });

  it('should handle full-text annotation', () => {
    const text = 'Hello World';
    const annotations: Annotation[] = [
      {
        id: '1',
        articleId: 'art1',
        start: 0,
        end: 11,
        color: '#ffeb3b',
        note: 'all',
        createdAt: Date.now(),
      },
    ];

    const result = buildSegments(text, annotations);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      text: 'Hello World',
      annotations: [annotations[0]],
    });
  });

  it('should preserve annotation order in overlapping segments', () => {
    const text = 'test';
    const ann1: Annotation = {
      id: '1',
      articleId: 'art1',
      start: 0,
      end: 4,
      color: '#ffeb3b',
      note: 'first',
      createdAt: Date.now(),
    };
    const ann2: Annotation = {
      id: '2',
      articleId: 'art1',
      start: 0,
      end: 4,
      color: '#ff5722',
      note: 'second',
      createdAt: Date.now(),
    };

    const result = buildSegments(text, [ann1, ann2]);
    expect(result).toHaveLength(1);
    expect(result[0].annotations).toEqual([ann1, ann2]);
  });
});
