import { Routes } from '@angular/router';
import { ArticleListComponent } from '../features/articles/article-list/article-list.component';
import { ArticleEditorComponent } from '../features/articles/article-editor/article-editor.component';
import { ArticleViewerComponent } from '../features/articles/article-viewer/article-viewer.component';
import { ROUTES, RoutePath } from './routes.constant';

export const routes: Routes = [
  { path: RoutePath.HOME, redirectTo: ROUTES.ARTICLES, pathMatch: 'full' },
  { path: RoutePath.ARTICLES, component: ArticleListComponent },
  { path: RoutePath.ARTICLE_NEW, component: ArticleEditorComponent },
  { path: RoutePath.ARTICLE_EDIT, component: ArticleEditorComponent },
  { path: RoutePath.ARTICLE_VIEW, component: ArticleViewerComponent },
];
