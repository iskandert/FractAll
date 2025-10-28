/**
 * Unit-тесты для геометрических утилит
 */

import { describe, it, expect } from 'vitest';
import { createPoint } from '@/shared/utils/geometry';
import { Vector } from '@/shared/types';

describe('createPoint', () => {
    it('должен создать точку справа (0°)', () => {
        const vector: Vector = {
            point: { x: 0, y: 0 },
            angle: 0,
            length: 10,
        };
        const result = createPoint(vector);
        expect(result.x).toBeCloseTo(10);
        expect(result.y).toBeCloseTo(0);
    });

    it('должен создать точку сверху (90°)', () => {
        const vector: Vector = {
            point: { x: 0, y: 0 },
            angle: 90,
            length: 10,
        };
        const result = createPoint(vector);
        expect(result.x).toBeCloseTo(0);
        expect(result.y).toBeCloseTo(10);
    });

    it('должен создать точку слева (180°)', () => {
        const vector: Vector = {
            point: { x: 0, y: 0 },
            angle: 180,
            length: 10,
        };
        const result = createPoint(vector);
        expect(result.x).toBeCloseTo(-10);
        expect(result.y).toBeCloseTo(0);
    });

    it('должен создать точку снизу (270°)', () => {
        const vector: Vector = {
            point: { x: 0, y: 0 },
            angle: 270,
            length: 10,
        };
        const result = createPoint(vector);
        expect(result.x).toBeCloseTo(0);
        expect(result.y).toBeCloseTo(-10);
    });

    it('должен работать с диагональными углами (45°)', () => {
        const vector: Vector = {
            point: { x: 0, y: 0 },
            angle: 45,
            length: Math.sqrt(2),
        };
        const result = createPoint(vector);
        expect(result.x).toBeCloseTo(1);
        expect(result.y).toBeCloseTo(1);
    });

    it('должен смещать от ненулевой начальной точки', () => {
        const vector: Vector = {
            point: { x: 100, y: 200 },
            angle: 0,
            length: 50,
        };
        const result = createPoint(vector);
        expect(result.x).toBeCloseTo(150);
        expect(result.y).toBeCloseTo(200);
    });

    it('должен работать с отрицательными углами', () => {
        const vector: Vector = {
            point: { x: 0, y: 0 },
            angle: -90,
            length: 10,
        };
        const result = createPoint(vector);
        expect(result.x).toBeCloseTo(0);
        expect(result.y).toBeCloseTo(-10);
    });

    it('должен выбрасывать ошибку, если length не указан', () => {
        const vector: Vector = {
            point: { x: 0, y: 0 },
            angle: 0,
        };
        expect(() => createPoint(vector)).toThrow('Vector length is required');
    });

    it('должен работать с нулевой длиной (вернет ту же точку)', () => {
        const vector: Vector = {
            point: { x: 100, y: 200 },
            angle: 45,
            length: 0,
        };
        const result = createPoint(vector);
        expect(result.x).toBeCloseTo(100);
        expect(result.y).toBeCloseTo(200);
    });
});

