export interface Annotation {
  id: string;
  articleId: string;
  start: number;
  end: number;
  color: string;
  note: string;
  createdAt: number;
}

export interface TextSegment {
  text: string;
  annotations: Annotation[];
}

export type AnnotationDraft = Pick<Annotation, 'color'> & { note?: string };
