/**
 * Unit тесты для generatePattern
 */

// TODO: Добавить импорты после установки vitest
import { describe, it, expect } from 'vitest';
import { generatePattern } from '@/features/l-system/domain/core/generatePattern';

describe('generatePattern', () => {
    it('должен применить правила переписывания', () => {
        const result = generatePattern({
            axiom: 'F',
            replacementRules: { F: 'F+F' },
            iterations: 1,
        });
        expect(result.pattern).toBe('F+F');
    });

    it('должен обрабатывать несколько итераций', () => {
        const result = generatePattern({
            axiom: 'A',
            replacementRules: { A: 'AB', B: 'A' },
            iterations: 3,
        });
        expect(result.pattern).toBe('ABAAB');
    });
});
