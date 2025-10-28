/**
 * Математические утилиты
 */

/**
 * Конвертирует градусы в радианы
 */
export function degToRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * Конвертирует радианы в градусы
 */
export function radToDeg(radians: number): number {
    return (radians * 180) / Math.PI;
}

/**
 * Нормализует угол в градусах до значения в диапазоне [0, 360)
 */
export function normalizeDegrees(angle: number): number {
    if (angle < 0) {
        angle += Math.ceil(Math.abs(angle) / 360) * 360;
    }
    return angle % 360;
}