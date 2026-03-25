export enum RoutePath {
  HOME = '',
  ARTICLES = 'articles',
  ARTICLE_NEW = 'articles/new',
  ARTICLE_EDIT = 'articles/:id/edit',
  ARTICLE_VIEW = 'articles/:id/view',
}

export const ROUTES = {
  HOME: '',
  ARTICLES: `/${RoutePath.ARTICLES}`,
  ARTICLE_NEW: `/${RoutePath.ARTICLE_NEW}`,
  ARTICLE_EDIT: `/${RoutePath.ARTICLE_EDIT}`,
  ARTICLE_VIEW: `/${RoutePath.ARTICLE_VIEW}`,
} as const;

export const getArticleEditRoute = (id: string): string => ROUTES.ARTICLE_EDIT.replace(':id', id);
export const getArticleViewRoute = (id: string): string => ROUTES.ARTICLE_VIEW.replace(':id', id);
