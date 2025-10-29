import type { BBox, Viewport, Transform, Point, ScaleMode } from '@/shared/types';

/**
 * Получает device pixel ratio для sharp rendering
 */
export function getPixelRatio(): number {
    return window.devicePixelRatio || 1;
}

/**
 * Устанавливает корректные размеры canvas с учетом pixel ratio
 */
export function setupCanvasSize(canvas: HTMLCanvasElement): Viewport {
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = getPixelRatio();

    canvas.width = rect.width * pixelRatio;
    canvas.height = rect.height * pixelRatio;

    return {
        width: canvas.width,
        height: canvas.height,
    };
}

/**
 * Вычисляет трансформацию для размещения bbox в viewport
 *
 * @param bbox - ограничивающий прямоугольник геометрии
 * @param viewport - размеры области отрисовки
 * @param options - опции трансформации
 * @returns трансформация (scaleX, scaleY, offsetX, offsetY)
 */
export function calculateTransform(
    bbox: BBox,
    viewport: Viewport,
    options?: {
        padding?: number;
        scaleMode?: ScaleMode;
    },
): Transform {
    const padding = options?.padding ?? 20;
    const scaleMode: ScaleMode = options?.scaleMode ?? 'fit';

    // Размеры bbox
    const bboxWidth = bbox.maxX - bbox.minX;
    const bboxHeight = bbox.maxY - bbox.minY;

    // Если bbox пустой
    if (bboxWidth === 0 || bboxHeight === 0) {
        return {
            scaleX: 1,
            scaleY: 1,
            offsetX: viewport.width / 2,
            offsetY: viewport.height / 2,
        };
    }

    // Доступная область с учетом padding
    const availableWidth = viewport.width - padding * 2;
    const availableHeight = viewport.height - padding * 2;

    // Вычисляем scale
    const scaleX = availableWidth / bboxWidth;
    const scaleY = availableHeight / bboxHeight;

    let finalScaleX: number;
    let finalScaleY: number;

    if (scaleMode === 'fit') {
        // Сохраняем aspect ratio - используем минимальный scale
        const scale = Math.min(scaleX, scaleY);
        finalScaleX = scale;
        finalScaleY = scale;
    } else {
        // 'stretch' - растягиваем независимо по осям
        finalScaleX = scaleX;
        finalScaleY = scaleY;
    }

    // Центр bbox
    const bboxCenterX = (bbox.minX + bbox.maxX) / 2;
    const bboxCenterY = (bbox.minY + bbox.maxY) / 2;

    // Центр viewport
    const viewportCenterX = viewport.width / 2;
    const viewportCenterY = viewport.height / 2;

    // Offset для центрирования
    const offsetX = viewportCenterX - bboxCenterX * finalScaleX;
    const offsetY = viewportCenterY - bboxCenterY * finalScaleY;

    return {
        scaleX: finalScaleX,
        scaleY: finalScaleY,
        offsetX,
        offsetY,
    };
}

/**
 * Применяет трансформацию к точке
 */
export function transformPoint(point: Point, transform: Transform): Point {
    return {
        x: point.x * transform.scaleX + transform.offsetX,
        y: point.y * transform.scaleY + transform.offsetY,
    };
}

