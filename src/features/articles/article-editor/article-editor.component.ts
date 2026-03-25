import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { ToastService } from '../../../services/toast.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { ROUTES } from '../../../app/routes.constant';

@Component({
  selector: 'app-article-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './article-editor.component.html',
  styleUrl: './article-editor.component.scss',
})
export class ArticleEditorComponent {
  private articleService = inject(ArticleService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  title = signal('');
  body = signal('');
  isEditMode = signal(false);
  isLoading = signal(true);
  originalTitle = '';
  originalBody = '';
  articleId: string | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.articleId = id;
      const article = this.articleService.getById(id);
      if (article) {
        this.title.set(article.title);
        this.body.set(article.body);
        this.originalTitle = article.title;
        this.originalBody = article.body;
      }
    }
    this.isLoading.set(false);
  }

  isDirty(): boolean {
    return this.title() !== this.originalTitle || this.body() !== this.originalBody;
  }

  onCancel(): void {
    if (this.isDirty()) {
      this.toastService.warning('Unsaved changes will be discarded.');
    }
    this.router.navigateByUrl(ROUTES.ARTICLES);
  }

  onSubmit(): void {
    if (!this.title().trim() || !this.body().trim()) {
      this.toastService.error('Title and body are required.');
      return;
    }

    if (this.isEditMode() && this.articleId) {
      this.articleService.update(this.articleId, {
        title: this.title(),
        body: this.body(),
      });
    } else {
      this.articleService.create(this.title(), this.body());
    }

    this.router.navigateByUrl(ROUTES.ARTICLES);
  }
}
