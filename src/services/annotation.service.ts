import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Annotation, AnnotationDraft } from '../types/annotation.types';
import { storage } from '../lib/storage';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AnnotationService {
  private toastService = inject(ToastService);
  private readonly annotations$ = new BehaviorSubject<Annotation[]>(
    storage.read(storage.KEYS.ANNOTATIONS, [])
  );

  readonly annotations = this.annotations$.asObservable();

  forArticle$(articleId: string): Observable<Annotation[]> {
    return this.annotations$.pipe(map((all) => all.filter((a) => a.articleId === articleId)));
  }

  create(articleId: string, start: number, end: number, draft: AnnotationDraft): Annotation {
    const annotation: Annotation = {
      id: crypto.randomUUID(),
      articleId,
      start,
      end,
      color: draft.color,
      note: draft.note ?? '',
      createdAt: Date.now(),
    };
    const current = this.annotations$.value;
    const updated = [...current, annotation];
    this.persist(updated);
    return annotation;
  }

  delete(id: string): void {
    const current = this.annotations$.value;
    const updated = current.filter((a) => a.id !== id);
    this.persist(updated);
  }

  deleteByArticle(articleId: string): void {
    const current = this.annotations$.value;
    const updated = current.filter((a) => a.articleId !== articleId);
    this.persist(updated);
  }

  update(id: string, patch: Partial<AnnotationDraft>): void {
    const current = this.annotations$.value;
    const index = current.findIndex((a) => a.id === id);
    if (index === -1) return;

    const updated = [...current];
    updated[index] = { ...updated[index], ...patch };
    this.persist(updated);
  }

  private persist(annotations: Annotation[]): void {
    this.annotations$.next(annotations);
    storage.write(storage.KEYS.ANNOTATIONS, annotations, this.toastService);
  }
}
