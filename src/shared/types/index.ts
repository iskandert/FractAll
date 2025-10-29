/**
 * Общие типы проекта (переиспользуемые в разных модулях)
 */

/**
 * 2D точка
 */
export interface Point {
    x: number;
    y: number;
}

/**
 * 2D вектор
 */
export interface Vector {
    /** Начальная точка вектора */
    point: Point;
    /** Угол направления в градусах (0° = вправо, 90° = вверх) */
    angle: number;
    /** Длина вектора */
    length?: number;
}

/**
 * Ограничивающий прямоугольник (Bounding Box)
 */
export interface BBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

/**
 * Viewport - размеры области отрисовки
 */
export interface Viewport {
    width: number;
    height: number;
}

/**
 * Опции рендеринга
 */
export interface RenderOptions {
    /** Цвет линии */
    strokeColor?: string;
    /** Толщина линии */
    strokeWidth?: number;
    /** Цвет фона */
    backgroundColor?: string;
    /** Отступ от краев viewport (в пикселях) */
    padding?: number;
}

/**
 * Трансформация координат (BBox → Viewport)
 */
export interface Transform {
    /** Коэффициент масштабирования по оси X */
    scaleX: number;
    /** Коэффициент масштабирования по оси Y */
    scaleY: number;
    /** Смещение по оси X */
    offsetX: number;
    /** Смещение по оси Y */
    offsetY: number;
}

/**
 * Режим масштабирования геометрии
 */
export type ScaleMode =
    | 'fit' // сохранять aspect ratio, вписать полностью
    | 'stretch'; // растянуть на весь viewport (может исказить пропорции)
