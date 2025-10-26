/**
 * Конвертация паттерна L-системы в команды черепашьей графики (pure function)
 *
 * Интерпретирует символы финального паттерна в массив Command[] (discriminated union).
 * Не выполняет геометрические расчёты — только создаёт команды как данные.
 *
 * @module patternToCommands
 */

import type { Command, PatternToCommandsParams } from '../types';

/**
 * Конвертирует паттерн L-системы в массив команд
 *
 * @param params - Параметры конвертации
 * @returns Массив команд для черепашьей графики
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
