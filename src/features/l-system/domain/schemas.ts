/**
 * Zod схемы для валидации типов L-системы
 *
 * Используются для:
 * - валидации входных данных от UI
 * - валидации сообщений в workers
 * - десериализации при импорте JSON
 */

// TODO: Добавить import { z } from 'zod' после установки пакета
// import { z } from 'zod';

/**
 * Схема для LSystemSettings
 *
 * Пример:
 * export const LSystemSettingsSchema = z.object({
 *   version: z.number().int().positive(),
 *   axiom: z.string().min(1),
 *   replacementRules: z.record(z.string(), z.string()),
 *   iterations: z.number().int().min(0).max(20),
 *   angle: z.number(),
 *   stepLength: z.number().positive(),
 *   startPosition: z.object({ x: z.number(), y: z.number() }),
 *   startAngle: z.number(),
 * });
 */

// export const LSystemSettingsSchema = ...
// export type LSystemSettings = z.infer<typeof LSystemSettingsSchema>;
