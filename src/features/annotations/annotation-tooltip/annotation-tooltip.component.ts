import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Annotation } from '../../../types/annotation.types';

@Component({
  selector: 'app-annotation-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './annotation-tooltip.component.html',
  styleUrl: './annotation-tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationTooltipComponent {
  @Input() annotation: Annotation | null = null;
  @Input() position: { x: number; y: number } | null = null;
}
