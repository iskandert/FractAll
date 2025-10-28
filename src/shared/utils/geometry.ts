import { Point, Vector } from '../types';
import { degToRad, normalizeDegrees } from './math';

/**
 * Создает новую точку, смещенную от начальной точки вектора
 * на заданную длину и угол.
 */
export function createPoint(vector: Vector): Point {
    if (vector.length === undefined) {
        throw new Error('Vector length is required');
    }

    const angleRad = degToRad(normalizeDegrees(vector.angle));
    return {
        x: vector.point.x + vector.length * Math.cos(angleRad),
        y: vector.point.y + vector.length * Math.sin(angleRad),
    };
}
