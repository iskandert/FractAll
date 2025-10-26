/**
 * Генерация паттерна L-системы (pure function)
 *
 * Реализует алгоритм переписывания строк L-системы.
 * Должен поддерживать:
 * - AbortSignal для прерывания длительных операций
 * - Chunked execution (опция maxChunkMs) для отправки прогресса
 *
 * @module generatePattern
 */

import type { GeneratePatternParams, PatternResult } from '../types';

/**
 * Генерирует финальный паттерн L-системы на основе правил переписывания
 *
 * @param params - Параметры генерации
 * @returns Результат генерации с финальным паттерном
 */
export function generatePattern(params: GeneratePatternParams): PatternResult {
    // TODO:
    // 1. Поддержать прерывание через signal
    // 2. Опционально: chunked execution с maxChunkMs
    const history: string[] = [params.axiom];
    for (let i = 0; i < params.iterations; i++) {
        const currentPattern = history[i];
        let newPattern = '';

        for (const char of currentPattern) {
            const replacement = params.replacementRules[char];
            if (replacement) {
                newPattern += replacement;
            } else {
                newPattern += char;
            }
        }
        history.push(newPattern);
    }

    // размер history всегда на 1 больше, чем количество iterations
    return { pattern: history[params.iterations], history };
}
