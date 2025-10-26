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
 * Ограничивающий прямоугольник (Bounding Box)
 */
export interface BBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
