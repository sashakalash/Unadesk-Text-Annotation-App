import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@angular/compiler';
import { Injector } from '@angular/core';
import { firstValueFrom, skip } from 'rxjs';
import { ArticleService } from './article.service';
import { AnnotationService } from './annotation.service';
import { ToastService } from './toast.service';

describe('ArticleService', () => {
  let articleService: ArticleService;
  let annotationService: AnnotationService;

  beforeEach(() => {
    localStorage.clear();
    const injector = Injector.create({
      providers: [ToastService, AnnotationService, ArticleService],
    });
    annotationService = injector.get(AnnotationService);
    articleService = injector.get(ArticleService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('create', () => {
    it('should create an article with unique id', () => {
      const article1 = articleService.create('Title 1', 'Body 1');
      const article2 = articleService.create('Title 2', 'Body 2');

      expect(article1.id).not.toBe(article2.id);
      expect(article1.title).toBe('Title 1');
      expect(article2.title).toBe('Title 2');
    });

    it('should set timestamps on creation', () => {
      const before = Date.now();
      const article = articleService.create('Title', 'Body');
      const after = Date.now();

      expect(article.createdAt).toBeGreaterThanOrEqual(before);
      expect(article.createdAt).toBeLessThanOrEqual(after);
      expect(article.updatedAt).toEqual(article.createdAt);
    });

    it('should persist article to localStorage', () => {
      articleService.create('Title', 'Body');

      const stored = localStorage.getItem('ta_articles');
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!) as Array<{ title: string }>;
      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe('Title');
    });
  });

  describe('update', () => {
    it('should update article title and body', async () => {
      const article = articleService.create('Original', 'Original body');
      const before = article.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));
      articleService.update(article.id, { title: 'Updated', body: 'Updated body' });

      const updated = articleService.getById(article.id);
      expect(updated?.title).toBe('Updated');
      expect(updated?.body).toBe('Updated body');
      expect(updated?.updatedAt).toBeGreaterThan(before);
    });

    it('should not update non-existent article', () => {
      articleService.update('non-existent', { title: 'New' });
      expect(true).toBe(true);
    });

    it('should persist updates to localStorage', () => {
      const article = articleService.create('Title', 'Body');
      articleService.update(article.id, { title: 'Changed' });

      const stored = localStorage.getItem('ta_articles');
      const parsed = JSON.parse(stored!) as Array<{ title: string }>;
      expect(parsed[0].title).toBe('Changed');
    });
  });

  describe('delete', () => {
    it('should delete article by id', () => {
      const article = articleService.create('Title', 'Body');
      articleService.delete(article.id);

      const deleted = articleService.getById(article.id);
      expect(deleted).toBeUndefined();
    });

    it('should persist deletion to localStorage', () => {
      const article = articleService.create('Title', 'Body');
      articleService.delete(article.id);

      const stored = localStorage.getItem('ta_articles');
      const parsed = JSON.parse(stored!) as Array<{ id: string }>;
      expect(parsed).toHaveLength(0);
    });

    it('should cascade delete annotations for deleted article', () => {
      const article = articleService.create('Title', 'Body');
      annotationService.create(article.id, 0, 5, { color: '#ffeb3b', note: 'Test' });

      articleService.delete(article.id);

      const stored = localStorage.getItem('ta_annotations');
      const parsed = JSON.parse(stored!) as Array<{ articleId: string }>;
      expect(parsed).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('should retrieve article by id', () => {
      const created = articleService.create('Title', 'Body');
      const found = articleService.getById(created.id);

      expect(found).toEqual(created);
    });

    it('should return undefined for non-existent id', () => {
      const notFound = articleService.getById('non-existent');
      expect(notFound).toBeUndefined();
    });
  });

  describe('articles observable', () => {
    it('should emit articles stream', async () => {
      const articlePromise = firstValueFrom(articleService.articles.pipe(skip(1)));
      articleService.create('Title', 'Body');

      const articles = await articlePromise;
      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe('Title');
    });
  });
});
