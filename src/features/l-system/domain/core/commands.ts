/**
 * Утилиты для работы с командами L-системы
 *
 * Фабрики команд, сериализация, хеширование, defaults.
 *
 * @module commands
 */

import type { Command, CommandMove, CommandTurn, CommandPush, CommandPop } from '../types';

/**
 * Фабрики для создания команд
 */
export const CommandFactory = {
    move: (distance: number): CommandMove => ({ type: 'move', distance, isDraw: false }),
    draw: (distance: number): CommandMove => ({ type: 'move', distance, isDraw: true }),
    turn: (angle: number): CommandTurn => ({ type: 'turn', angle }),
    push: (): CommandPush => ({ type: 'push' }),
    pop: (): CommandPop => ({ type: 'pop' }),
};

/**
 * Сериализует команду в строку (для отладки/логирования)
 */
export function commandToString(command: Command): string {
    switch (command.type) {
        case 'move':
            if (command.isDraw) {
                return `D(${command.distance})`;
            }
            return `M(${command.distance})`;
        case 'turn':
            return `T(${command.angle}°)`;
        case 'push':
            return '[';
        case 'pop':
            return ']';
    }
}

/**
 * Сериализует массив команд в строку
 */
export function commandsToString(commands: Command[]): string {
    return commands.map(commandToString).join(' ');
}

// /**
//  * Вычисляет простой хеш массива команд (для кеширования)
//  */
// export function hashCommands(commands: Command[]): string {
//     // TODO: Реализовать простое хеширование (можно использовать JSON.stringify)
//     return JSON.stringify(commands);
// }

/**
 * Проверяет, является ли стек команд валидным
 */
export function getIsValidCommandsStack(commands: Command[]): boolean {
    let stackDepth: number = 0;
    for (const command of commands) {
        if (command.type === 'push') {
            stackDepth++;
        } else if (command.type === 'pop') {
            stackDepth--;
        }
    }

    return stackDepth === 0;
}
