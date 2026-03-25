import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@angular/compiler';
import { Injector } from '@angular/core';
import { firstValueFrom, skip } from 'rxjs';
import { AnnotationService } from './annotation.service';
import { ToastService } from './toast.service';

describe('AnnotationService', () => {
  let service: AnnotationService;

  beforeEach(() => {
    localStorage.clear();
    const injector = Injector.create({
      providers: [ToastService, AnnotationService],
    });
    service = injector.get(AnnotationService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('create', () => {
    it('should create annotation with unique id', () => {
      const ann1 = service.create('art-1', 0, 5, { color: '#ffeb3b', note: 'Test 1' });
      const ann2 = service.create('art-1', 6, 10, { color: '#ff9800', note: 'Test 2' });

      expect(ann1.id).not.toBe(ann2.id);
      expect(ann1.note).toBe('Test 1');
      expect(ann2.note).toBe('Test 2');
    });

    it('should preserve article id and range', () => {
      const annotation = service.create('article-123', 5, 15, {
        color: '#f44336',
        note: 'Important',
      });

      expect(annotation.articleId).toBe('article-123');
      expect(annotation.start).toBe(5);
      expect(annotation.end).toBe(15);
    });

    it('should set color and note from draft', () => {
      const annotation = service.create('art-1', 0, 5, {
        color: '#2196f3',
        note: 'My annotation',
      });

      expect(annotation.color).toBe('#2196f3');
      expect(annotation.note).toBe('My annotation');
    });

    it('should set createdAt timestamp', () => {
      const before = Date.now();
      const annotation = service.create('art-1', 0, 5, { color: '#ffeb3b', note: 'Test' });
      const after = Date.now();

      expect(annotation.createdAt).toBeGreaterThanOrEqual(before);
      expect(annotation.createdAt).toBeLessThanOrEqual(after);
    });

    it('should persist to localStorage', () => {
      service.create('art-1', 0, 5, { color: '#ffeb3b', note: 'Test' });

      const stored = localStorage.getItem('ta_annotations');
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!) as Array<{ note: string }>;
      expect(parsed).toHaveLength(1);
      expect(parsed[0].note).toBe('Test');
    });
  });

  describe('delete', () => {
    it('should delete annotation by id', () => {
      const ann = service.create('art-1', 0, 5, { color: '#ffeb3b', note: 'Delete me' });

      service.delete(ann.id);

      const stored = localStorage.getItem('ta_annotations');
      const parsed = JSON.parse(stored!) as Array<{ id: string }>;
      expect(parsed).toHaveLength(0);
    });

    it('should not affect other annotations', () => {
      service.create('art-1', 0, 5, { color: '#ffeb3b', note: 'Keep' });
      const ann = service.create('art-1', 6, 10, { color: '#ff9800', note: 'Delete' });

      service.delete(ann.id);

      const stored = localStorage.getItem('ta_annotations');
      const parsed = JSON.parse(stored!) as Array<{ note: string }>;
      expect(parsed).toHaveLength(1);
      expect(parsed[0].note).toBe('Keep');
    });
  });

  describe('deleteByArticle', () => {
    it('should delete all annotations for article', () => {
      service.create('art-1', 0, 5, { color: '#ffeb3b', note: 'Ann 1' });
      service.create('art-1', 6, 10, { color: '#ff9800', note: 'Ann 2' });
      service.create('art-2', 0, 5, { color: '#f44336', note: 'Ann 3' });

      service.deleteByArticle('art-1');

      const stored = localStorage.getItem('ta_annotations');
      const parsed = JSON.parse(stored!) as Array<{ articleId: string }>;
      expect(parsed).toHaveLength(1);
      expect(parsed[0].articleId).toBe('art-2');
    });

    it('should not affect other articles', () => {
      service.create('art-1', 0, 5, { color: '#ffeb3b', note: 'Delete' });
      service.create('art-2', 0, 5, { color: '#ff9800', note: 'Keep' });

      service.deleteByArticle('art-1');

      const stored = localStorage.getItem('ta_annotations');
      const parsed = JSON.parse(stored!) as Array<{ note: string }>;
      expect(parsed).toHaveLength(1);
      expect(parsed[0].note).toBe('Keep');
    });
  });

  describe('update', () => {
    it('should update color and note', () => {
      const ann = service.create('art-1', 0, 5, { color: '#ffeb3b', note: 'Original' });

      service.update(ann.id, { color: '#f44336', note: 'Updated' });

      const stored = localStorage.getItem('ta_annotations');
      const parsed = JSON.parse(stored!) as Array<{ color: string; note: string }>;
      expect(parsed[0].color).toBe('#f44336');
      expect(parsed[0].note).toBe('Updated');
    });

    it('should not update non-existent annotation', () => {
      service.update('non-existent', { color: '#ffeb3b', note: 'Test' });

      const stored = localStorage.getItem('ta_annotations');
      expect(stored).toBeNull();
    });

    it('should preserve range on update', () => {
      const ann = service.create('art-1', 0, 5, { color: '#ffeb3b', note: 'Original' });

      service.update(ann.id, { note: 'Updated' });

      const stored = localStorage.getItem('ta_annotations');
      const parsed = JSON.parse(stored!) as Array<{ start: number; end: number }>;
      expect(parsed[0].start).toBe(0);
      expect(parsed[0].end).toBe(5);
    });
  });

  describe('forArticle$', () => {
    it('should emit annotations for article', async () => {
      service.create('art-1', 0, 5, { color: '#ffeb3b', note: 'Ann 1' });
      service.create('art-1', 6, 10, { color: '#ff9800', note: 'Ann 2' });
      service.create('art-2', 0, 5, { color: '#f44336', note: 'Ann 3' });

      const annotations = await firstValueFrom(service.forArticle$('art-1'));
      expect(annotations).toHaveLength(2);
      expect(annotations.every((a) => a.articleId === 'art-1')).toBe(true);
    });

    it('should return empty array for article with no annotations', async () => {
      const annotations = await firstValueFrom(service.forArticle$('non-existent'));
      expect(annotations).toEqual([]);
    });

    it('should emit updated list when annotation added', async () => {
      const promise = firstValueFrom(service.forArticle$('art-1').pipe(skip(1)));
      service.create('art-1', 0, 5, { color: '#ffeb3b', note: 'New' });

      const annotations = await promise;
      expect(annotations).toHaveLength(1);
    });

    it('should filter only annotations for specific article', async () => {
      service.create('art-1', 0, 5, { color: '#ffeb3b', note: 'Art 1' });
      service.create('art-2', 0, 5, { color: '#ff9800', note: 'Art 2' });
      service.create('art-1', 6, 10, { color: '#f44336', note: 'Art 1 Again' });

      const annotations = await firstValueFrom(service.forArticle$('art-1'));
      expect(annotations).toHaveLength(2);
      expect(annotations.map((a) => a.note)).toEqual(['Art 1', 'Art 1 Again']);
    });
  });

  describe('persistence', () => {
    it('should restore annotations from localStorage', async () => {
      service.create('art-1', 0, 5, { color: '#ffeb3b', note: 'Persistent' });

      const injector = Injector.create({
        providers: [ToastService, AnnotationService],
      });
      const newService = injector.get(AnnotationService);
      const annotations = (await firstValueFrom(newService.forArticle$('art-1'))) as Array<{
        note: string;
      }>;

      expect(annotations).toHaveLength(1);
      expect(annotations[0].note).toBe('Persistent');
    });
  });
});
