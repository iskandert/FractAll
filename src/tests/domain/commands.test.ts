/**
 * Unit тесты для команд и утилит
 */

// TODO: Добавить импорты после установки vitest
import { describe, it, expect } from 'vitest';
import {
    CommandFactory,
    commandToString,
    commandsToString,
    getIsValidCommandsStack,
} from '@/features/l-system/domain/core/commands';

describe('CommandFactory', () => {
    it('должен создавать move команду', () => {
        const cmd = CommandFactory.move(10);
        expect(cmd).toEqual({ type: 'move', distance: 10, isDraw: false });
    });

    it('должен создавать draw команду', () => {
        const cmd = CommandFactory.draw(10);
        expect(cmd).toEqual({ type: 'move', distance: 10, isDraw: true });
    });

    it('должен создавать turn команду', () => {
        const cmd = CommandFactory.turn(90);
        expect(cmd).toEqual({ type: 'turn', angle: 90 });
    });

    it('должен создавать push команду', () => {
        const cmd = CommandFactory.push();
        expect(cmd).toEqual({ type: 'push' });
    });

    it('должен создавать pop команду', () => {
        const cmd = CommandFactory.pop();
        expect(cmd).toEqual({ type: 'pop' });
    });
});

describe('commandToString', () => {
    it('должен сериализовать move команду', () => {
        const str = commandToString(CommandFactory.move(10));
        expect(str).toBe('M(10)');
    });

    it('должен сериализовать turn команду', () => {
        const str = commandToString(CommandFactory.turn(90));
        expect(str).toBe('T(90°)');
    });

    it('должен сериализовать draw команду', () => {
        const str = commandToString(CommandFactory.draw(10));
        expect(str).toBe('D(10)');
    });

    it('должен сериализовать push команду', () => {
        const str = commandToString(CommandFactory.push());
        expect(str).toBe('[');
    });

    it('должен сериализовать pop команду', () => {
        const str = commandToString(CommandFactory.pop());
        expect(str).toBe(']');
    });
});

describe('commandsToString', () => {
    it('должен сериализовать массив команд', () => {
        const str = commandsToString([CommandFactory.move(10), CommandFactory.turn(90)]);
        expect(str).toBe('M(10) T(90°)');
    });
});

describe('getIsValidCommandsStack', () => {
    it('должен проверять определить, что стек команд валидный', () => {
        const isValid = getIsValidCommandsStack([CommandFactory.push(), CommandFactory.pop()]);
        expect(isValid).toBe(true);
    });

    it('должен проверять определить, что стек команд невалидный', () => {
        const isValid = getIsValidCommandsStack([CommandFactory.push(), CommandFactory.push()]);
        expect(isValid).toBe(false);
    });
});
