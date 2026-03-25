import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Article } from '../types/article.types';
import { storage } from '../lib/storage';
import { AnnotationService } from './annotation.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private annotationService = inject(AnnotationService);
  private toastService = inject(ToastService);

  private readonly articles$ = new BehaviorSubject<Article[]>(
    storage.read(storage.KEYS.ARTICLES, [])
  );

  readonly articles = this.articles$.asObservable();

  create(title: string, body: string): Article {
    const article: Article = {
      id: crypto.randomUUID(),
      title,
      body,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const current = this.articles$.value;
    const updated = [...current, article];
    this.persist(updated);
    return article;
  }

  update(id: string, patch: Partial<Pick<Article, 'title' | 'body'>>): void {
    const current = this.articles$.value;
    const index = current.findIndex((a: Article) => a.id === id);
    if (index === -1) return;

    const updated = [...current];
    updated[index] = { ...updated[index], ...patch, updatedAt: Date.now() };
    this.persist(updated);
  }

  delete(id: string): void {
    this.annotationService.deleteByArticle(id);
    const current = this.articles$.value;
    const updated = current.filter((a: Article) => a.id !== id);
    this.persist(updated);
  }

  getById(id: string): Article | undefined {
    return this.articles$.value.find((a: Article) => a.id === id);
  }

  private persist(articles: Article[]): void {
    this.articles$.next(articles);
    storage.write(storage.KEYS.ARTICLES, articles, this.toastService);
  }
}
