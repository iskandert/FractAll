/**
 * Unit-тесты для математических утилит
 */

import { describe, it, expect } from 'vitest';
import { degToRad, radToDeg, normalizeDegrees } from '@/shared/utils/math';

describe('degToRad', () => {
    it('должен корректно конвертировать градусы в радианы', () => {
        expect(degToRad(0)).toBe(0);
        expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
        expect(degToRad(180)).toBeCloseTo(Math.PI);
        expect(degToRad(270)).toBeCloseTo((3 * Math.PI) / 2);
        expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
    });

    it('должен обрабатывать отрицательные углы', () => {
        expect(degToRad(-90)).toBeCloseTo(-Math.PI / 2);
        expect(degToRad(-180)).toBeCloseTo(-Math.PI);
    });

    it('должен обрабатывать углы больше 360', () => {
        expect(degToRad(450)).toBeCloseTo((5 * Math.PI) / 2);
        expect(degToRad(720)).toBeCloseTo(4 * Math.PI);
    });
});

describe('radToDeg', () => {
    it('должен корректно конвертировать радианы в градусы', () => {
        expect(radToDeg(0)).toBe(0);
        expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
        expect(radToDeg(Math.PI)).toBeCloseTo(180);
        expect(radToDeg((3 * Math.PI) / 2)).toBeCloseTo(270);
        expect(radToDeg(2 * Math.PI)).toBeCloseTo(360);
    });

    it('должен обрабатывать отрицательные радианы', () => {
        expect(radToDeg(-Math.PI / 2)).toBeCloseTo(-90);
        expect(radToDeg(-Math.PI)).toBeCloseTo(-180);
    });
});

describe('degToRad и radToDeg', () => {
    it('должны быть обратными функциями', () => {
        const testAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
        testAngles.forEach((angle) => {
            expect(radToDeg(degToRad(angle))).toBeCloseTo(angle);
        });
    });
});

describe('normalizeDegrees', () => {
    it('должен нормализовать положительные углы в диапазоне [0, 360)', () => {
        expect(normalizeDegrees(0)).toBe(0);
        expect(normalizeDegrees(90)).toBe(90);
        expect(normalizeDegrees(180)).toBe(180);
        expect(normalizeDegrees(270)).toBe(270);
        expect(normalizeDegrees(359)).toBe(359);
    });

    it('должен нормализовать углы >= 360', () => {
        expect(normalizeDegrees(360)).toBe(0);
        expect(normalizeDegrees(450)).toBe(90);
        expect(normalizeDegrees(720)).toBe(0);
        expect(normalizeDegrees(1080)).toBe(0);
    });

    it('должен нормализовать отрицательные углы', () => {
        expect(normalizeDegrees(-90)).toBe(270);
        expect(normalizeDegrees(-180)).toBe(180);
        expect(normalizeDegrees(-270)).toBe(90);
        expect(normalizeDegrees(-360)).toBe(0);
        expect(normalizeDegrees(-450)).toBe(270);
    });
});

