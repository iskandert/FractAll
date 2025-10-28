/**
 * Unit тесты для patternToCommands
 */

// TODO: Добавить импорты после установки vitest
import { describe, it, expect } from 'vitest';
import { patternToCommands } from '@/features/l-system/domain/core/patternProcessing';
import { CommandFactory } from '@/features/l-system/domain/core/commands';

describe('patternToCommands', () => {
    const commandsMap = {
        'F': CommandFactory.draw(10),
        '+': CommandFactory.turn(90),
        '-': CommandFactory.turn(-90),
        '[': CommandFactory.push(),
        ']': CommandFactory.pop(),
    };

    it('должен конвертировать базовые символы в команды', () => {
        expect(patternToCommands({ pattern: 'F+-[]', commands: commandsMap })).toEqual([
            CommandFactory.draw(10),
            CommandFactory.turn(90),
            CommandFactory.turn(-90),
            CommandFactory.push(),
            CommandFactory.pop(),
        ]);
    });

    it('должен игнорировать неизвестные символы', () => {
        const commands = patternToCommands({
            pattern: 'FXY+',
            commands: commandsMap,
        });
        expect(commands).toHaveLength(2);
        expect(commands[0]).toEqual(CommandFactory.draw(10));
        expect(commands[1]).toEqual(CommandFactory.turn(90));
    });
});
