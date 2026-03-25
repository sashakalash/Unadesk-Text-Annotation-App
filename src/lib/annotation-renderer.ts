import { Annotation, TextSegment } from '../types/annotation.types';

export function buildSegments(text: string, annotations: Annotation[]): TextSegment[] {
  if (!text) return [];
  if (!annotations.length) return [{ text, annotations: [] }];

  const breakpoints = new Set<number>();
  breakpoints.add(0);
  breakpoints.add(text.length);

  for (const annotation of annotations) {
    breakpoints.add(annotation.start);
    breakpoints.add(annotation.end);
  }

  const sorted = Array.from(breakpoints).sort((a, b) => a - b);
  const segments: TextSegment[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];
    const segmentText = text.slice(start, end);

    const segmentAnnotations = annotations.filter((a) => a.start <= start && a.end >= end);

    segments.push({ text: segmentText, annotations: segmentAnnotations });
  }

  return segments;
}
