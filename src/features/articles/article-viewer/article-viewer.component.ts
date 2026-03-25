import {
  Component,
  inject,
  signal,
  computed,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { AnnotationService } from '../../../services/annotation.service';
import { ToastService } from '../../../services/toast.service';
import { buildSegments } from '../../../lib/annotation-renderer';
import { Annotation, AnnotationDraft } from '../../../types/annotation.types';
import { AnnotationTooltipComponent } from '../../annotations/annotation-tooltip/annotation-tooltip.component';
import { AnnotationColorPickerComponent } from '../../annotations/annotation-color-picker/annotation-color-picker.component';
import { ROUTES } from '../../../app/routes.constant';

@Component({
  selector: 'app-article-viewer',
  standalone: true,
  imports: [CommonModule, AnnotationTooltipComponent, AnnotationColorPickerComponent],
  templateUrl: './article-viewer.component.html',
  styleUrl: './article-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleViewerComponent {
  @ViewChild('textContainer', { read: ElementRef }) textContainerRef!: ElementRef;

  private articleService = inject(ArticleService);
  private annotationService = inject(AnnotationService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private articleId = this.route.snapshot.paramMap.get('id');
  article = signal(this.articleService.getById(this.articleId || ''));
  articleAnnotations = signal<Annotation[]>([]);

  constructor() {
    effect(() => {
      this.annotationService
        .forArticle$(this.articleId || '')
        .subscribe((annotations: Annotation[]) => {
          this.articleAnnotations.set(annotations);
        });
    });
  }
  segments = computed(() => buildSegments(this.article()?.body || '', this.articleAnnotations()));

  pendingSelection = signal<{ start: number; end: number } | null>(null);
  pickerPosition = signal<{ x: number; y: number } | null>(null);
  hoveredAnnotation = signal<Annotation | null>(null);
  tooltipPosition = signal<{ x: number; y: number } | null>(null);

  onTextMouseUp(): void {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    const start = this.domOffsetToTextOffset(range.startContainer, range.startOffset);
    const end = this.domOffsetToTextOffset(range.endContainer, range.endOffset);

    if (start >= end) return;

    this.pendingSelection.set({ start, end });
    const rect = range.getBoundingClientRect();
    this.pickerPosition.set({
      x: rect.right + 10,
      y: rect.bottom + 10,
    });
    sel.removeAllRanges();
  }

  onAnnotationHover(event: MouseEvent, annotation: Annotation): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.hoveredAnnotation.set(annotation);
    this.tooltipPosition.set({
      x: rect.left,
      y: rect.top - 8,
    });
  }

  onAnnotationLeave(): void {
    this.hoveredAnnotation.set(null);
    this.tooltipPosition.set(null);
  }

  onPickerConfirm(draft: AnnotationDraft): void {
    const sel = this.pendingSelection();
    if (!sel) return;

    this.annotationService.create(this.articleId || '', sel.start, sel.end, draft);
    this.resetSelection();
  }

  onPickerCancel(): void {
    this.resetSelection();
  }

  goBack(): void {
    this.router.navigateByUrl(ROUTES.ARTICLES);
  }

  private resetSelection(): void {
    this.pendingSelection.set(null);
    this.pickerPosition.set(null);
  }

  private domOffsetToTextOffset(node: Node, domOffset: number): number {
    if (!this.textContainerRef) return domOffset;

    const container = this.textContainerRef.nativeElement as Element;
    const range = document.createRange();

    try {
      range.selectNodeContents(container);
      range.setEnd(node, domOffset);
      return range.toString().length;
    } catch {
      this.toastService.error('Failed to process text selection');
      return domOffset;
    }
  }

  getAnnotationStyle(annotations: Annotation[]): Record<string, string> {
    if (!annotations.length) return {};
    const shadows = annotations.map((a, i) => `0 ${2 + i * 3}px 0 ${a.color}`).join(', ');
    return { 'box-shadow': shadows };
  }
}
