/**
 * Тесты для generateGeometry - построения геометрии из команд L-системы
 */

import { describe, it, expect } from 'vitest';
import { generateGeometry } from '@/features/l-system/domain/core/generateGeometry';
import { CommandFactory } from '@/features/l-system/domain/core/commands';
import type { GeometryBuilderParams, Command } from '@/features/l-system/domain/types';

/**
 * Вспомогательная функция для создания параметров
 */
function createParams(commands: Command[], maxPoints = 1000): GeometryBuilderParams {
    return {
        commands,
        maxPoints,
        startPosition: { x: 0, y: 0 },
        startAngle: 0,
        minSegmentLength: 1,
    };
}

describe('generateGeometry', () => {
    describe('Базовые команды', () => {
        it('должен создать прямую линию из одной команды draw', () => {
            const commands = [CommandFactory.draw(10)];
            const geometryResult = generateGeometry(createParams(commands));

            expect(geometryResult.segments).toHaveLength(1);
            expect(geometryResult.segments[0]).toHaveLength(2); // начальная точка + одна новая
            expect(geometryResult.segments[0][0]).toEqual({ x: 0, y: 0 });
            expect(geometryResult.segments[0][1].x).toBeCloseTo(10);
            expect(geometryResult.segments[0][1].y).toBeCloseTo(0);
            expect(geometryResult.pointsCount).toBe(2);
            expect(geometryResult.bbox).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 0 });
        });

        it('должен создать ломаную линию из нескольких draw', () => {
            const commands = [
                CommandFactory.draw(10), // вправо
                CommandFactory.turn(90),
                CommandFactory.draw(10), // вверх
            ];
            const geometryResult = generateGeometry(createParams(commands));

            expect(geometryResult.segments).toHaveLength(1);
            expect(geometryResult.segments[0]).toHaveLength(3); // 3 точки: старт + 2 перемещения
            expect(geometryResult.segments[0][0]).toEqual({ x: 0, y: 0 });
            expect(geometryResult.segments[0][1].x).toBeCloseTo(10);
            expect(geometryResult.segments[0][1].y).toBeCloseTo(0);
            expect(geometryResult.segments[0][2].x).toBeCloseTo(10);
            expect(geometryResult.segments[0][2].y).toBeCloseTo(10);
        });

        it('должен создавать отдельные сегменты при move без рисования', () => {
            const commands = [
                CommandFactory.draw(10), // сегмент 1: рисуем
                CommandFactory.move(5), // переходим без рисования - новый сегмент
                CommandFactory.draw(10), // сегмент 2: рисуем
            ];
            const geometryResult = generateGeometry(createParams(commands));

            expect(geometryResult.segments).toHaveLength(2); // два отдельных сегмента
            expect(geometryResult.segments[0]).toHaveLength(2); // первый сегмент
            expect(geometryResult.segments[1]).toHaveLength(2); // второй сегмент
        });

        it('должен корректно обрабатывать повороты', () => {
            const commands = [
                CommandFactory.draw(10), // вправо на 10
                CommandFactory.turn(90), // поворот на 90° вверх
                CommandFactory.draw(10), // вверх на 10
                CommandFactory.turn(90), // поворот на 90° влево
                CommandFactory.draw(10), // влево на 10
            ];
            const geometryResult = generateGeometry(createParams(commands));

            expect(geometryResult.segments).toHaveLength(1);
            expect(geometryResult.segments[0]).toHaveLength(4);

            // Проверяем квадратную траекторию
            expect(geometryResult.segments[0][0]).toEqual({ x: 0, y: 0 });
            expect(geometryResult.segments[0][1].x).toBeCloseTo(10); // вправо
            expect(geometryResult.segments[0][1].y).toBeCloseTo(0);
            expect(geometryResult.segments[0][2].x).toBeCloseTo(10); // вверх
            expect(geometryResult.segments[0][2].y).toBeCloseTo(10);
            expect(geometryResult.segments[0][3].x).toBeCloseTo(0); // влево
            expect(geometryResult.segments[0][3].y).toBeCloseTo(10);
        });
    });

    describe('Ветвление (push/pop)', () => {
        it('должен создавать ветвление при push/pop', () => {
            const commands = [
                CommandFactory.draw(10), // основная линия (0,0) -> (10,0)
                CommandFactory.push(), // сохраняем позицию (10,0), угол 0°
                CommandFactory.turn(90), // поворачиваем на 90°
                CommandFactory.draw(5), // ветка вверх (10,0) -> (10,5)
                CommandFactory.pop(), // возвращаемся к (10,0), угол 0°
                CommandFactory.turn(-90), // поворачиваем на -90°
                CommandFactory.draw(5), // продолжение основной линии вниз (10,0) -> (10,-5)
            ];
            const geometryResult = generateGeometry(createParams(commands));

            // После pop мы возвращаемся к основной линии, а не создаем новую
            // Поэтому: основная линия + ветка = 2 сегмента
            expect(geometryResult.segments).toHaveLength(2);

            // Основная линия: (0,0) -> (10,0) -> (10,-5)
            expect(geometryResult.segments[0]).toHaveLength(3);
            expect(geometryResult.segments[0][0]).toEqual({ x: 0, y: 0 });
            expect(geometryResult.segments[0][1].x).toBeCloseTo(10);
            expect(geometryResult.segments[0][1].y).toBeCloseTo(0);
            expect(geometryResult.segments[0][2].x).toBeCloseTo(10);
            expect(geometryResult.segments[0][2].y).toBeCloseTo(-5);

            // Ветка вверх: (10,0) -> (10,5)
            expect(geometryResult.segments[1]).toHaveLength(2);
            expect(geometryResult.segments[1][0].x).toBeCloseTo(10);
            expect(geometryResult.segments[1][0].y).toBeCloseTo(0);
            expect(geometryResult.segments[1][1].x).toBeCloseTo(10);
            expect(geometryResult.segments[1][1].y).toBeCloseTo(5);
        });

        it('должен корректно обрабатывать вложенные push/pop', () => {
            const commands = [
                CommandFactory.draw(10), // основная: (0,0) -> (10,0)
                CommandFactory.push(), // сохраняем (10,0), 0°
                CommandFactory.turn(90),
                CommandFactory.draw(10), // ветка 1: (10,0) -> (10,10)
                CommandFactory.push(), // сохраняем (10,10), 90°
                CommandFactory.turn(90),
                CommandFactory.draw(5), // подветка: (10,10) -> (5,10)
                CommandFactory.pop(), // возвращаемся к (10,10), 90°
                CommandFactory.pop(), // возвращаемся к (10,0), 0°
                CommandFactory.turn(-90),
                CommandFactory.draw(10), // продолжение основной: (10,0) -> (10,-10)
            ];
            const geometryResult = generateGeometry(createParams(commands));

            expect(geometryResult.segments).toHaveLength(3);
            // Основная линия: (0,0) -> (10,0) -> (10,-10)
            expect(geometryResult.segments[0]).toHaveLength(3);
            // Первая ветка: (10,0) -> (10,10)
            expect(geometryResult.segments[1]).toHaveLength(2);
            // Подветка: (10,10) -> (5,10)
            expect(geometryResult.segments[2]).toHaveLength(2);
        });
    });

    describe('Ограничения и валидация', () => {
        it('должен останавливаться при достижении maxPoints', () => {
            const commands = [
                CommandFactory.draw(10),
                CommandFactory.draw(10),
                CommandFactory.draw(10),
                CommandFactory.draw(10),
                CommandFactory.draw(10),
            ];
            const geometryResult = generateGeometry(createParams(commands, 3)); // лимит 3 точки

            expect(geometryResult.segments).toHaveLength(1);
            expect(geometryResult.segments[0]).toHaveLength(3); // стартовая + 2 точки (до лимита)
        });

        it('должен сохранять все валидные сегменты при move', () => {
            const commands = [
                CommandFactory.draw(10), // Сегмент 1: стартовая + 1 точка = 2 точки
                CommandFactory.move(5), // Сегмент 2: только стартовая = 1 точка (валидный с minSegmentLength=1)
            ];
            const geometryResult = generateGeometry(createParams(commands));

            expect(geometryResult.segments).toHaveLength(2);
            expect(geometryResult.segments[0]).toHaveLength(2); // стартовая + 1 точка
            expect(geometryResult.segments[1]).toHaveLength(1); // только стартовая
        });

        it('должен финализировать сегмент после push без pop', () => {
            const commands = [
                CommandFactory.draw(10),
                CommandFactory.draw(10),
                CommandFactory.push(), // Начинаем ветвь, которая остается открытой
                // Сегмент с push должен быть автоматически финализирован
            ];
            const geometryResult = generateGeometry(createParams(commands));

            // Должны остаться оба сегмента: основной и короткая ветвь
            expect(geometryResult.segments).toHaveLength(2);
            expect(geometryResult.segments[0]).toHaveLength(3); // основной: стартовая + 2 точки
            expect(geometryResult.segments[1]).toHaveLength(1); // ветвь: только стартовая точка
        });

        it('должен сохранять сегменты при pop (minSegmentLength = 1)', () => {
            const commands = [
                CommandFactory.draw(10),
                CommandFactory.push(), // создаем новый сегмент
                // не рисуем ничего в новом сегменте (только стартовая точка)
                CommandFactory.pop(), // сегмент короткий, но валидный (length = 1)
                CommandFactory.draw(10),
            ];
            const geometryResult = generateGeometry(createParams(commands));

            // Оба сегмента должны остаться (minSegmentLength = 1)
            expect(geometryResult.segments).toHaveLength(2);
            expect(geometryResult.segments[0]).toHaveLength(3); // основной: 3 точки
            expect(geometryResult.segments[1]).toHaveLength(1); // ветвь: 1 точка
        });

        it('должен удалять сегменты короче заданного minSegmentLength', () => {
            const commands = [
                CommandFactory.draw(10), // Сегмент 1: 2 точки (валидный для minSegmentLength=2)
                CommandFactory.move(5), // Сегмент 2: 1 точка (невалидный для minSegmentLength=2)
            ];
            const geometryResult = generateGeometry({
                ...createParams(commands),
                minSegmentLength: 2,
            });

            // Только первый сегмент должен остаться (второй удален: length=1 < minSegmentLength=2)
            expect(geometryResult.segments).toHaveLength(1);
            expect(geometryResult.segments[0]).toHaveLength(2);
        });
    });

    describe('Интеграционные сценарии (L-системы)', () => {
        it('должен строить простое дерево (сценарий Koch curve)', () => {
            // Упрощенная кривая Коха: F-F++F-F
            const commands = [
                CommandFactory.draw(10),
                CommandFactory.turn(-60),
                CommandFactory.draw(10),
                CommandFactory.turn(120),
                CommandFactory.turn(120),
                CommandFactory.draw(10),
                CommandFactory.turn(-60),
                CommandFactory.draw(10),
            ];
            const geometryResult = generateGeometry(createParams(commands));

            expect(geometryResult.segments).toHaveLength(1);
            expect(geometryResult.segments[0].length).toBeGreaterThan(3);
            // Проверяем, что геометрия построена (не проверяем точные координаты)
        });

        it('должен строить дерево с ветвлением (сценарий дерева)', () => {
            // Паттерн: F[+F][-F]F - ствол, ветка вправо, ветка влево, продолжение
            const commands = [
                CommandFactory.draw(10), // ствол
                CommandFactory.push(),
                CommandFactory.turn(45),
                CommandFactory.draw(5), // правая ветка
                CommandFactory.pop(),
                CommandFactory.push(),
                CommandFactory.turn(-45),
                CommandFactory.draw(5), // левая ветка
                CommandFactory.pop(),
                CommandFactory.draw(10), // продолжение ствола
            ];
            const geometryResult = generateGeometry(createParams(commands));

            expect(geometryResult.segments).toHaveLength(3); // ствол + 2 ветки
            expect(geometryResult.segments[0]).toHaveLength(3); // ствол: старт + 2 точки

            // Проверяем, что ветки начинаются из середины ствола
            const trunkMidPoint = geometryResult.segments[0][1];
            expect(geometryResult.segments[1][0]).toEqual(trunkMidPoint);
            expect(geometryResult.segments[2][0]).toEqual(trunkMidPoint);
        });

        it('должен корректно работать с пустым списком команд', () => {
            const geometryResult = generateGeometry(createParams([]));

            expect(geometryResult.segments).toHaveLength(1);
            expect(geometryResult.segments[0]).toHaveLength(1); // только стартовая точка
        });

        it('должен обрабатывать команды только с поворотами (без движения)', () => {
            const commands = [
                CommandFactory.turn(90),
                CommandFactory.turn(90),
                CommandFactory.turn(90),
            ];
            const geometryResult = generateGeometry(createParams(commands));

            expect(geometryResult.segments).toHaveLength(1);
            expect(geometryResult.segments[0]).toHaveLength(1); // только стартовая точка
        });
    });

    describe('Различные стартовые позиции и углы', () => {
        it('должен работать с ненулевой стартовой позицией', () => {
            const commands = [CommandFactory.draw(10)];
            const params: GeometryBuilderParams = {
                commands,
                maxPoints: 1000,
                startPosition: { x: 100, y: 200 },
                startAngle: 0,
                minSegmentLength: 1,
            };
            const geometryResult = generateGeometry(params);

            expect(geometryResult.segments[0][0]).toEqual({ x: 100, y: 200 });
            expect(geometryResult.segments[0][1].x).toBeCloseTo(110);
            expect(geometryResult.segments[0][1].y).toBeCloseTo(200);
        });

        it('должен работать с ненулевым стартовым углом', () => {
            const commands = [CommandFactory.draw(10)];
            const params: GeometryBuilderParams = {
                commands,
                maxPoints: 1000,
                startPosition: { x: 0, y: 0 },
                startAngle: 90, // начинаем смотря вверх
                minSegmentLength: 1,
            };
            const geometryResult = generateGeometry(params);

            expect(geometryResult.segments[0][0]).toEqual({ x: 0, y: 0 });
            expect(geometryResult.segments[0][1].x).toBeCloseTo(0);
            expect(geometryResult.segments[0][1].y).toBeCloseTo(10);
        });

        it('должен нормализовать отрицательные стартовые углы', () => {
            const commands = [CommandFactory.draw(10)];
            const params: GeometryBuilderParams = {
                commands,
                maxPoints: 1000,
                startPosition: { x: 0, y: 0 },
                startAngle: -90, // -90° = 270° = вниз
                minSegmentLength: 1,
            };
            const geometryResult = generateGeometry(params);

            expect(geometryResult.segments[0][1].x).toBeCloseTo(0);
            expect(geometryResult.segments[0][1].y).toBeCloseTo(-10);
        });
    });

    describe('Граничные случаи', () => {
        it('должен обрабатывать maxPoints = 1 (только стартовая точка)', () => {
            const commands = [
                CommandFactory.draw(10),
                CommandFactory.draw(10),
            ];
            const geometryResult = generateGeometry(createParams(commands, 1));

            expect(geometryResult.segments).toHaveLength(1);
            expect(geometryResult.segments[0]).toHaveLength(1); // только стартовая точка
        });

        it('должен обрабатывать нулевую длину перемещения', () => {
            const commands = [
                CommandFactory.draw(0),
                CommandFactory.draw(10),
            ];
            const geometryResult = generateGeometry(createParams(commands));

            expect(geometryResult.segments).toHaveLength(1);
            expect(geometryResult.segments[0]).toHaveLength(3); // старт + точка с нулевым смещением + реальная точка
        });

        it('должен обрабатывать отрицательную длину перемещения (движение назад)', () => {
            const commands = [
                CommandFactory.draw(10),
                CommandFactory.draw(-5), // движение назад
            ];
            const geometryResult = generateGeometry(createParams(commands));

            expect(geometryResult.segments).toHaveLength(1);
            expect(geometryResult.segments[0]).toHaveLength(3);
            expect(geometryResult.segments[0][2].x).toBeCloseTo(5); // 10 - 5 = 5
        });

        it('должен обрабатывать углы > 360', () => {
            const commands = [
                CommandFactory.turn(450), // 450° = 90°
                CommandFactory.draw(10),
            ];
            const geometryResult = generateGeometry(createParams(commands));

            expect(geometryResult.segments[0][1].x).toBeCloseTo(0);
            expect(geometryResult.segments[0][1].y).toBeCloseTo(10); // движение вверх
        });
    });

    describe('BBox calculation', () => {
        it('должен вычислять корректный bbox для простой линии', () => {
            const commands = [CommandFactory.draw(10)];
            const result = generateGeometry(createParams(commands));

            expect(result.bbox).toEqual({
                minX: 0,
                minY: 0,
                maxX: 10,
                maxY: 0,
            });
        });

        it('должен вычислять корректный bbox для L-образной фигуры', () => {
            const commands = [
                CommandFactory.draw(10), // вправо до (10, 0)
                CommandFactory.turn(90),
                CommandFactory.draw(10), // вверх до (10, 10)
            ];
            const result = generateGeometry(createParams(commands));

            expect(result.bbox).toEqual({
                minX: 0,
                minY: 0,
                maxX: 10,
                maxY: 10,
            });
        });

        it('должен вычислять корректный bbox для фигуры с отрицательными координатами', () => {
            const commands = [
                CommandFactory.turn(180), // развернуться влево (180°)
                CommandFactory.draw(10), // влево до (-10, 0)
                CommandFactory.turn(-90), // поворот: 180 - 90 = 90° (вверх)
                CommandFactory.draw(5), // вверх до (-10, 5)
            ];
            const result = generateGeometry(createParams(commands));

            expect(result.bbox.minX).toBeCloseTo(-10);
            expect(result.bbox.minY).toBeCloseTo(0);
            expect(result.bbox.maxX).toBeCloseTo(0);
            expect(result.bbox.maxY).toBeCloseTo(5);
        });

        it('должен возвращать пустой bbox для геометрии без точек', () => {
            // maxPoints = 0 означает что даже стартовая точка не будет добавлена
            // но на практике minPoints = 1, поэтому проверим с командами без движения
            const commands = [CommandFactory.turn(90)];
            const result = generateGeometry(createParams(commands, 1));

            expect(result.bbox).toEqual({
                minX: 0,
                minY: 0,
                maxX: 0,
                maxY: 0,
            });
        });

        it('должен обновлять bbox при ветвлении', () => {
            const commands = [
                CommandFactory.draw(10), // вправо до (10, 0)
                CommandFactory.push(),
                CommandFactory.turn(90),
                CommandFactory.draw(15), // ветка вверх до (10, 15)
                CommandFactory.pop(),
                CommandFactory.turn(-90),
                CommandFactory.draw(8), // вниз до (10, -8)
            ];
            const result = generateGeometry(createParams(commands));

            expect(result.bbox.minX).toBeCloseTo(0);
            expect(result.bbox.minY).toBeCloseTo(-8);
            expect(result.bbox.maxX).toBeCloseTo(10);
            expect(result.bbox.maxY).toBeCloseTo(15);
        });
    });
});

