/**
 * Типы L-системы (feature-specific)
 *
 * Этот файл содержит центральные TS контракты для модуля L-системы.
 * Все типы должны быть сериализуемыми (без функций внутри).
 */

import type { Point } from '@/shared/types';

/**
 * Настройки L-системы
 */
export interface LSystemSettings {
    /** Версия схемы настроек (для миграций) */
    version: number;
    /** Начальная строка (аксиома) */
    axiom: string;
    /** Правила переписывания: symbol -> replacement */
    replacementRules: Record<string, string>;
    /** Команды */
    commands: Record<string, Command>;
    /** Количество итераций */
    iterations: number;
    /** Максимальное количество точек */
    maxPoints: number;
    /** Угол поворота в градусах */
    angle: number;
    /** Длина шага */
    defaultStepLength: number;
    /** Начальная позиция черепахи */
    startPosition: Point;
    /** Начальный угол в градусах */
    startAngle: number;
}

export interface CommandMove {
    type: 'move';
    distance: number;
    isDraw: boolean;
}

export interface CommandTurn {
    type: 'turn';
    angle: number;
}

export interface CommandPush {
    type: 'push';
}

export interface CommandPop {
    type: 'pop';
}

/**
 * Discriminated union команд для интерпретации L-системы
 * Команды представляют действия "черепашьей графики"
 */
export type Command = CommandMove | CommandTurn | CommandPush | CommandPop;

/**
 * Результат генерации паттерна L-системы
 */
export interface PatternResult {
    /** Финальная строка после всех итераций */
    pattern: string;
    /** История итераций */
    history: string[];
}

/**
 * Параметры генерации паттерна
 */
export interface GeneratePatternParams {
    axiom: string;
    replacementRules: Record<string, string>;
    iterations: number;
}

/**
 * Параметры конвертации паттерна в команды
 */
export interface PatternToCommandsParams {
    pattern: string;
    commands: Record<string, Command>;
}

export type PathSegment = Readonly<Point>[];

/**
 * Параметры построения геометрии
 */
export interface GeometryBuilderParams {
    commands: Command[];
    maxPoints: number;
    startPosition: Point;
    startAngle: number;
    minSegmentLength: number;
}
