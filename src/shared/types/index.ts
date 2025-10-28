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
