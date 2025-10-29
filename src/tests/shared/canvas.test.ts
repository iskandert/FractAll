/**
 * Тесты для утилит canvas
 */

import { describe, it, expect } from 'vitest';
import { calculateTransform, transformPoint } from '@/shared/utils/canvas';
import type { BBox, Viewport } from '@/shared/types';

describe('calculateTransform', () => {
    it('должен центрировать маленький bbox в большом viewport (режим fit)', () => {
        const bbox: BBox = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
        const viewport: Viewport = { width: 100, height: 100 };

        const transform = calculateTransform(bbox, viewport, { padding: 10, scaleMode: 'fit' });

        // Должен масштабировать до размера viewport минус padding
        // доступная область: 100 - 20 = 80
        // bbox размер: 10
        // scale: 80 / 10 = 8
        expect(transform.scaleX).toBe(8);
        expect(transform.scaleY).toBe(8);

        // Центрирование: центр viewport (50, 50) = центр bbox после трансформации
        // центр bbox: (5, 5)
        // (5 * 8) + offsetX = 50 => offsetX = 10
        expect(transform.offsetX).toBe(10);
        expect(transform.offsetY).toBe(10);
    });

    it('должен масштабировать большой bbox чтобы поместился в viewport (режим fit)', () => {
        const bbox: BBox = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
        const viewport: Viewport = { width: 50, height: 50 };

        const transform = calculateTransform(bbox, viewport, { padding: 5, scaleMode: 'fit' });

        // Доступная область: 50 - 10 = 40
        // bbox размер: 100
        // scale: 40 / 100 = 0.4
        expect(transform.scaleX).toBe(0.4);
        expect(transform.scaleY).toBe(0.4);

        // Центр viewport: (25, 25)
        // Центр bbox: (50, 50)
        // (50 * 0.4) + offsetX = 25 => offsetX = 5
        expect(transform.offsetX).toBe(5);
        expect(transform.offsetY).toBe(5);
    });

    it('должен сохранять aspect ratio в режиме fit (использовать меньший scale)', () => {
        const bbox: BBox = { minX: 0, minY: 0, maxX: 100, maxY: 50 };
        const viewport: Viewport = { width: 200, height: 200 };

        const transform = calculateTransform(bbox, viewport, { padding: 0, scaleMode: 'fit' });

        // scaleX: 200 / 100 = 2
        // scaleY: 200 / 50 = 4
        // используем меньший (2) для сохранения пропорций
        expect(transform.scaleX).toBe(2);
        expect(transform.scaleY).toBe(2);
    });

    it('должен растягивать независимо в режиме stretch', () => {
        const bbox: BBox = { minX: 0, minY: 0, maxX: 100, maxY: 50 };
        const viewport: Viewport = { width: 200, height: 200 };

        const transform = calculateTransform(bbox, viewport, { padding: 0, scaleMode: 'stretch' });

        // scaleX: 200 / 100 = 2
        // scaleY: 200 / 50 = 4
        // в режиме stretch используем разные scale
        expect(transform.scaleX).toBe(2);
        expect(transform.scaleY).toBe(4);
    });

    it('должен учитывать padding', () => {
        const bbox: BBox = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
        const viewport: Viewport = { width: 100, height: 100 };

        const transform = calculateTransform(bbox, viewport, { padding: 20 });

        // Доступная область: 100 - 40 = 60
        // scale: 60 / 10 = 6
        expect(transform.scaleX).toBe(6);
        expect(transform.scaleY).toBe(6);

        // Offset должен учитывать padding и центрирование
        expect(transform.offsetX).toBe(20);
        expect(transform.offsetY).toBe(20);
    });

    it('должен обрабатывать bbox с отрицательными координатами', () => {
        const bbox: BBox = { minX: -10, minY: -10, maxX: 10, maxY: 10 };
        const viewport: Viewport = { width: 100, height: 100 };

        const transform = calculateTransform(bbox, viewport, { padding: 10 });

        // bbox размер: 20x20
        // доступная область: 80x80
        // scale: 80 / 20 = 4
        expect(transform.scaleX).toBe(4);
        expect(transform.scaleY).toBe(4);

        // Центр bbox: (0, 0)
        // Центр viewport: (50, 50)
        // (0 * 4) + offsetX = 50 => offsetX = 50
        expect(transform.offsetX).toBe(50);
        expect(transform.offsetY).toBe(50);
    });

    it('должен обрабатывать пустой bbox (width=0, height=0)', () => {
        const bbox: BBox = { minX: 5, minY: 5, maxX: 5, maxY: 5 };
        const viewport: Viewport = { width: 100, height: 100 };

        const transform = calculateTransform(bbox, viewport);

        // При пустом bbox используем scale=1 и центрируем точку
        expect(transform.scaleX).toBe(1);
        expect(transform.scaleY).toBe(1);
        expect(transform.offsetX).toBe(50);
        expect(transform.offsetY).toBe(50);
    });

    it('должен использовать дефолтный padding=20 и режим fit', () => {
        const bbox: BBox = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
        const viewport: Viewport = { width: 100, height: 100 };

        // Вызываем без опций (default: padding=20, scaleMode='fit')
        const transform = calculateTransform(bbox, viewport);

        // Доступная область: 100 - 40 = 60
        // scale: 60 / 10 = 6
        expect(transform.scaleX).toBe(6);
        expect(transform.scaleY).toBe(6);
    });
});

describe('transformPoint', () => {
    it('должен корректно трансформировать точку с масштабом и смещением', () => {
        const point = { x: 10, y: 20 };
        const transform = { scaleX: 2, scaleY: 2, offsetX: 5, offsetY: 10 };

        const result = transformPoint(point, transform);

        // x: 10 * 2 + 5 = 25
        // y: 20 * 2 + 10 = 50
        expect(result).toEqual({ x: 25, y: 50 });
    });

    it('должен обрабатывать разные scale для X и Y', () => {
        const point = { x: 10, y: 20 };
        const transform = { scaleX: 2, scaleY: 3, offsetX: 5, offsetY: 10 };

        const result = transformPoint(point, transform);

        // x: 10 * 2 + 5 = 25
        // y: 20 * 3 + 10 = 70
        expect(result).toEqual({ x: 25, y: 70 });
    });

    it('должен обрабатывать точку в начале координат', () => {
        const point = { x: 0, y: 0 };
        const transform = { scaleX: 3, scaleY: 3, offsetX: 10, offsetY: 20 };

        const result = transformPoint(point, transform);

        // x: 0 * 3 + 10 = 10
        // y: 0 * 3 + 20 = 20
        expect(result).toEqual({ x: 10, y: 20 });
    });

    it('должен обрабатывать отрицательные координаты', () => {
        const point = { x: -5, y: -10 };
        const transform = { scaleX: 2, scaleY: 2, offsetX: 50, offsetY: 100 };

        const result = transformPoint(point, transform);

        // x: -5 * 2 + 50 = 40
        // y: -10 * 2 + 100 = 80
        expect(result).toEqual({ x: 40, y: 80 });
    });

    it('должен обрабатывать scale < 1 (уменьшение)', () => {
        const point = { x: 100, y: 200 };
        const transform = { scaleX: 0.5, scaleY: 0.5, offsetX: 10, offsetY: 20 };

        const result = transformPoint(point, transform);

        // x: 100 * 0.5 + 10 = 60
        // y: 200 * 0.5 + 20 = 120
        expect(result).toEqual({ x: 60, y: 120 });
    });

    it('должен обрабатывать отрицательный scale (отражение)', () => {
        const point = { x: 10, y: 20 };
        const transform = { scaleX: -1, scaleY: -1, offsetX: 100, offsetY: 200 };

        const result = transformPoint(point, transform);

        // x: 10 * -1 + 100 = 90
        // y: 20 * -1 + 200 = 180
        expect(result).toEqual({ x: 90, y: 180 });
    });

    it('должен обрабатывать нулевой scale', () => {
        const point = { x: 100, y: 200 };
        const transform = { scaleX: 0, scaleY: 0, offsetX: 50, offsetY: 75 };

        const result = transformPoint(point, transform);

        // x: 100 * 0 + 50 = 50
        // y: 200 * 0 + 75 = 75
        expect(result).toEqual({ x: 50, y: 75 });
    });
});

