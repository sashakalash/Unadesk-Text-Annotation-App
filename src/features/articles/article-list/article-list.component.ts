import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ArticleService } from '@services/article.service';
import { ToastService } from '@services/toast.service';
import { Article } from '@models/article.types';
import { ROUTES, getArticleViewRoute, getArticleEditRoute } from '@app/routes.constant';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.scss',
})
export class ArticleListComponent {
  private articleService = inject(ArticleService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  articles$ = this.articleService.articles;

  onCreate(): void {
    this.router.navigateByUrl(ROUTES.ARTICLE_NEW);
  }

  onView(id: string): void {
    this.router.navigateByUrl(getArticleViewRoute(id));
  }

  onEdit(id: string): void {
    this.router.navigateByUrl(getArticleEditRoute(id));
  }

  onDelete(article: Article): void {
    this.articleService.delete(article.id);
    this.toastService.success(`"${article.title}" deleted.`);
  }
}
