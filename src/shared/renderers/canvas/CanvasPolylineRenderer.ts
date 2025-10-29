import type { IRenderer } from '../IRenderer';
import type { PathSegment } from '@/features/l-system/domain/types';
import type { BBox, RenderOptions, Viewport, Transform } from '@/shared/types';
import { setupCanvasSize, calculateTransform, transformPoint } from '@/shared/utils/canvas';

/**
 * Реализация рендерера для Canvas
 * Рисует геометрию как набор полилиний
 */
export class CanvasPolylineRenderer implements IRenderer {
    private ctx: CanvasRenderingContext2D;
    private currentViewport: Viewport;

    constructor(private canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context from canvas');
        }
        this.ctx = ctx;
        this.currentViewport = setupCanvasSize(canvas);
    }

    /**
     * Отрисовывает сегменты на canvas
     */
    render(segments: PathSegment[], bbox: BBox, options?: RenderOptions): void {
        this.clear();

        if (segments.length === 0) {
            return;
        }

        // Получаем опции с defaults
        const opts = this.getOptionsWithDefaults(options);

        // Вычисляем трансформацию
        const transform = calculateTransform(bbox, this.currentViewport, {
            padding: opts.padding,
            scaleMode: 'fit', // для сохранения пропорций
        });

        // Настраиваем контекст
        this.setupContext(opts);

        // Рисуем все сегменты
        for (const segment of segments) {
            this.drawSegment(segment, transform);
        }
    }

    /**
     * Очищает canvas
     */
    clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Обновляет размеры canvas
     */
    resize(): void {
        this.currentViewport = setupCanvasSize(this.canvas);
    }

    /**
     * Настраивает стили контекста
     */
    private setupContext(options: Required<RenderOptions>): void {
        this.ctx.strokeStyle = options.strokeColor;
        this.ctx.lineWidth = options.strokeWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Фон
        if (options.backgroundColor) {
            this.ctx.fillStyle = options.backgroundColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Рисует один сегмент (полилинию)
     */
    private drawSegment(segment: PathSegment, transform: Transform): void {
        if (segment.length < 2) {
            return;
        }

        this.ctx.beginPath();

        // Первая точка
        const first = transformPoint(segment[0], transform);
        this.ctx.moveTo(first.x, first.y);

        // Остальные точки
        for (let i = 1; i < segment.length; i++) {
            const point = transformPoint(segment[i], transform);
            this.ctx.lineTo(point.x, point.y);
        }

        this.ctx.stroke();
    }

    /**
     * Возвращает опции с значениями по умолчанию
     */
    private getOptionsWithDefaults(options?: RenderOptions): Required<RenderOptions> {
        return {
            strokeColor: options?.strokeColor ?? '#2563eb',
            strokeWidth: options?.strokeWidth ?? 2,
            backgroundColor: options?.backgroundColor ?? '#ffffff',
            padding: options?.padding ?? 20,
        };
    }
}

