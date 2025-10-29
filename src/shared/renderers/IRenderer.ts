import type { PathSegment } from '@/features/l-system/domain/types';
import type { BBox, RenderOptions } from '@/shared/types';

/**
 * Интерфейс рендерера геометрии
 */
export interface IRenderer {
    /**
     * Отрисовывает геометрию
     * @param segments - массив сегментов пути
     * @param bbox - ограничивающий прямоугольник геометрии
     * @param options - опции рендеринга
     */
    render(segments: PathSegment[], bbox: BBox, options?: RenderOptions): void;

    /**
     * Очищает canvas
     */
    clear(): void;

    /**
     * Обновляет размеры (вызывается при resize)
     * Обновляет internal кеш размеров canvas с учетом pixel ratio
     */
    resize(): void;
}

