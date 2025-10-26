/**
 * CLI для отладки генерации L-системы (MVP Этап 1)
 *
 * Запуск: npm run dev:cli
 *
 * Использование:
 * - Тестирование generatePattern и patternToCommands
 * - Вывод результатов в консоль
 */

import { generatePattern, patternToCommands, commandsToString, CommandFactory } from './features/l-system/domain/core';
import { Command } from './features/l-system/domain/types';

/**
 * Стандартная интерпретация символов L-системы:
 * - 'F', 'G': движение вперёд (move)
 * - '+': поворот влево (turn с положительным углом)
 * - '-': поворот вправо (turn с отрицательным углом)
 * - '[': сохранить состояние (push)
 * - ']': восстановить состояние (pop)
 */
const DEFAULT_SYMBOL_MAP: Record<string, Command> = {
    'F': CommandFactory.move(10),
    'G': CommandFactory.draw(10),
    '+': CommandFactory.turn(90),
    '-': CommandFactory.turn(-90),
    '[': CommandFactory.push(),
    ']': CommandFactory.pop(),
};

/**
 * Пример использования L-системы: Кривая Коха
 */
function testKochCurve() {
    console.log('=== Тест: Кривая Коха ===\n');

    try {
        // Генерация паттерна
        const patternResult = generatePattern({
            axiom: 'F',
            replacementRules: { 'F': 'F+F-F-F+F' },
            iterations: 2,
        });

        console.log('Аксиома: F');
        console.log('Правила: F → F+F-F-F+F');
        console.log('Итерации: 2');
        console.log(`Финальный паттерн: ${patternResult.pattern}`);
        console.log(`Длина паттерна: ${patternResult.pattern.length} символов\n`);

        // Конвертация в команды
        const commands = patternToCommands({
            pattern: patternResult.pattern,
            commands: DEFAULT_SYMBOL_MAP,
        });

        console.log(`Количество команд: ${commands.length}`);
        console.log('Первые 10 команд:');
        console.log(commandsToString(commands.slice(0, 10)));
    } catch (error) {
        console.error('Ошибка:', error instanceof Error ? error.message : error);
    }
}

/**
 * Пример использования L-системы: Дерево
 */
function testTree() {
    console.log('\n\n=== Тест: Фрактальное дерево ===\n');

    try {
        const patternResult = generatePattern({
            axiom: 'F',
            replacementRules: { 'F': 'F[+F]F[-F]F' },
            iterations: 3,
        });

        console.log('Аксиома: F');
        console.log('Правила: F → F[+F]F[-F]F');
        console.log('Итерации: 3');
        console.log(`Финальный паттерн (начало): ${patternResult.pattern.substring(0, 50)}...`);
        console.log(`Длина паттерна: ${patternResult.pattern.length} символов\n`);

        const commands = patternToCommands({
            pattern: patternResult.pattern,
            commands: DEFAULT_SYMBOL_MAP,
        });

        console.log(`Количество команд: ${commands.length}`);
        console.log('Первые 10 команд:');
        console.log(commandsToString(commands.slice(0, 10)));
    } catch (error) {
        console.error('Ошибка:', error instanceof Error ? error.message : error);
    }
}

// Запуск тестов
console.log('╔═════════════════════════════════════╗');
console.log('║   L-System Generator CLI (Этап 1)   ║');
console.log('╚═════════════════════════════════════╝\n');

testKochCurve();
testTree();

console.log('\n\n✅ Тесты завершены.');
console.log('💡 Реализуйте функции в domain/core для получения результатов.\n');
