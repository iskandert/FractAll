/**
 * Утилиты для работы с паттернами L-системы
 *
 * Конвертация паттерна L-системы в команды черепашьей графики (чистая функция)
 *
 * Интерпретирует символы финального паттерна в массив Command[] (discriminated union).
 * Не выполняет геометрические расчёты — только создаёт команды как данные.
 *
 * @module patternToCommands
 */

import type { Command, PatternToCommandsParams } from '../types';

/**
 * Проверяет, является ли стек команд валидным
 */
export function getIsValidPatternStack(params: PatternToCommandsParams): boolean {
    let stackDepth: number = 0;
    for (const char of params.pattern) {
        const command = params.commands[char]?.type;
        if (command === 'push') {
            stackDepth++;
        } else if (command === 'pop') {
            stackDepth--;
        }
    }

    return stackDepth === 0;
}

/**
 * Конвертирует паттерн L-системы в массив команд черепашьей графики
 */
export function patternToCommands(params: PatternToCommandsParams): Command[] {
    const queue: Command[] = [];
    for (const char of params.pattern) {
        const command = params.commands[char];
        if (command) {
            queue.push(command);
        }
    }

    return queue;
}
