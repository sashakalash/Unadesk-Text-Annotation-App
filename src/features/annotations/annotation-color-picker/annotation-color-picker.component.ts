import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  signal,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnotationDraft } from '../../../types/annotation.types';
import { ToastService } from '../../../services/toast.service';

const COLORS = ['#ffeb3b', '#ff9800', '#f44336', '#9c27b0', '#2196f3', '#4caf50'];

@Component({
  selector: 'app-annotation-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './annotation-color-picker.component.html',
  styleUrl: './annotation-color-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationColorPickerComponent {
  private toastService = inject(ToastService);

  @Input() position: { x: number; y: number } | null = null;
  @Output() confirmAnnotation = new EventEmitter<AnnotationDraft>();
  @Output() cancelAnnotation = new EventEmitter<void>();

  selectedColor = signal(COLORS[0]);
  note = signal('');
  readonly colors = COLORS;

  @HostListener('keydown.escape')
  onEscape(): void {
    this.onCancel();
  }

  onConfirm(): void {
    this.emitAnnotation(this.note());
  }

  onQuickUnderline(): void {
    this.emitAnnotation('');
  }

  private emitAnnotation(note: string): void {
    this.confirmAnnotation.emit({
      color: this.selectedColor(),
      note: note || '',
    });
    this.toastService.success('Annotation added');
    this.reset();
  }

  onCancel(): void {
    this.cancelAnnotation.emit();
    this.reset();
  }

  private reset(): void {
    this.selectedColor.set(COLORS[0]);
    this.note.set('');
  }
}
