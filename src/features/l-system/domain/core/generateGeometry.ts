import { Point } from '@/shared/types';
import { GeometryBuilderParams, PathSegment, Command } from '../types';
import { createPoint } from '@/shared/utils/geometry';
import { normalizeDegrees } from '@/shared/utils/math';

/**
 * Снимок состояния черепахи для сохранения в стек
 */
interface TurtleSnapshot {
    position: Point;
    angle: number;
}

/**
 * Управление состоянием "черепахи" (позиция и направление)
 * Включает стек для сохранения/восстановления состояния при ветвлении
 */
class TurtleState {
    private currentPosition: Point;
    private currentAngle: number;
    private stateStack: TurtleSnapshot[];

    constructor(startPoint: Point, startAngle: number) {
        this.currentPosition = { x: startPoint.x, y: startPoint.y };
        this.currentAngle = normalizeDegrees(startAngle);
        this.stateStack = [];
    }

    getPosition(): Point {
        return this.currentPosition;
    }

    getAngle(): number {
        return this.currentAngle;
    }

    rotate(angleDelta: number): void {
        this.currentAngle = normalizeDegrees(this.currentAngle + angleDelta);
    }

    /**
     * Перемещает черепаху вперед на заданное расстояние
     * Возвращает новую позицию
     */
    moveForward(distance: number): Point {
        const nextPoint = createPoint({
            point: this.currentPosition,
            angle: this.currentAngle,
            length: distance,
        });
        this.currentPosition = nextPoint;
        return nextPoint;
    }

    /**
     * Сохраняет текущее состояние в стек
     */
    saveState(): void {
        this.stateStack.push({
            position: { x: this.currentPosition.x, y: this.currentPosition.y },
            angle: this.currentAngle,
        });
    }

    /**
     * Восстанавливает последнее сохраненное состояние из стека
     */
    restoreState(): void {
        const snapshot = this.stateStack.pop();
        if (snapshot) {
            this.currentPosition = snapshot.position;
            this.currentAngle = snapshot.angle;
        }
    }
}

/**
 * Управление коллекцией сегментов пути
 */
class SegmentManager {
    private segments: Set<PathSegment>;
    private stack: PathSegment[];

    constructor() {
        this.segments = new Set();
        this.stack = [];
    }

    getCurrentSegment(): PathSegment {
        return this.stack[this.stack.length - 1];
    }

    hasActiveSegments(): boolean {
        return this.stack.length > 0;
    }

    startSegment(point: Readonly<Point>): PathSegment {
        const newSegment = [point];
        this.segments.add(newSegment);
        this.stack.push(newSegment);
        return newSegment;
    }

    addPointToCurrentSegment(point: Point): void {
        this.getCurrentSegment().push(point);
    }

    /**
     * Завершает текущий сегмент, удаляя его из стека
     * Возвращает завершенный сегмент для дальнейшей обработки
     */
    endCurrentSegment(): PathSegment | undefined {
        return this.stack.pop();
    }

    /**
     * Удаляет сегмент из коллекции результатов
     */
    removeSegment(segment: PathSegment): void {
        this.segments.delete(segment);
    }

    getAllSegments(): PathSegment[] {
        return Array.from(this.segments);
    }
}

/**
 * Класс-координатор для управления состоянием построения геометрии L-системы
 */
class GeometryBuilderState {
    private turtle: TurtleState;
    private segments: SegmentManager;
    private pointsCount: number = 0;
    private readonly maxPoints: number;
    private readonly minSegmentLength: number;

    constructor(startPosition: Point, startAngle: number, maxPoints: number, minSegmentLength: number) {
        this.turtle = new TurtleState(startPosition, startAngle);
        this.segments = new SegmentManager();
        this.maxPoints = maxPoints;
        this.minSegmentLength = minSegmentLength;

        // Инициализация первого сегмента
        this.segments.startSegment(this.turtle.getPosition());
        this.pointsCount++;
    }

    /**
     * Проверяет достижение лимита точек
     */
    private hasReachedMaxPoints(): boolean {
        return this.pointsCount >= this.maxPoints;
    }

    /**
     * Проверяет валидность сегмента
     */
    private isSegmentValid(segment: PathSegment): boolean {
        return segment.length >= this.minSegmentLength;
    }

    /**
     * Финализирует сегмент с валидацией и очисткой невалидных
     */
    private finalizeCurrentSegment(): void {
        const finishedSegment = this.segments.endCurrentSegment();
        if (finishedSegment && !this.isSegmentValid(finishedSegment)) {
            this.segments.removeSegment(finishedSegment);
            this.pointsCount -= finishedSegment.length;
        }
    }

    /**
     * Рисует линию (перемещение с рисованием)
     */
    private draw(distance: number): void {
        const nextPoint = this.turtle.moveForward(distance);
        this.segments.addPointToCurrentSegment(nextPoint);
        this.pointsCount++;
    }

    /**
     * Перемещение без рисования (создает новый сегмент)
     */
    private move(distance: number): void {
        this.finalizeCurrentSegment();

        const nextPoint = this.turtle.moveForward(distance);
        this.segments.startSegment(nextPoint);
        this.pointsCount++;
    }

    /**
     * Поворот черепахи на заданный угол
     */
    private rotate(angle: number): void {
        this.turtle.rotate(angle);
    }

    /**
     * Начало ветвления - сохраняет состояние
     */
    private startBranch(): void {
        this.turtle.saveState();
        this.segments.startSegment(this.turtle.getPosition());
    }

    /**
     * Завершение ветвления - восстанавливает состояние
     */
    private endBranch(): void {
        this.finalizeCurrentSegment();
        this.turtle.restoreState();
    }

    /**
     * Выполняет одну команду
     */
    private executeCommand(command: Command): void {
        switch (command.type) {
            case 'move':
                if (command.isDraw) {
                    this.draw(command.distance);
                } else {
                    this.move(command.distance);
                }
                break;
            case 'turn':
                this.rotate(command.angle);
                break;
            case 'push':
                this.startBranch();
                break;
            case 'pop':
                this.endBranch();
                break;
        }
    }

    /**
     * Выполняет последовательность команд с учетом лимита точек
     */
    executeCommands(commands: Command[]): void {
        for (const command of commands) {
            if (this.hasReachedMaxPoints()) {
                break;
            }
            this.executeCommand(command);
        }
    }

    /**
     * Завершает построение, финализируя все оставшиеся сегменты
     */
    private finalize(): void {
        // Финализируем все оставшиеся сегменты в стеке
        while (this.segments.hasActiveSegments()) {
            this.finalizeCurrentSegment();
        }
    }

    /**
     * Возвращает построенную геометрию
     */
    getResult(): PathSegment[] {
        this.finalize();
        return this.segments.getAllSegments();
    }
}

/**
 * Строит геометрию на основе команд L-системы
 */
export function generateGeometry(params: GeometryBuilderParams): PathSegment[] {
    const state = new GeometryBuilderState(
        params.startPosition,
        params.startAngle,
        params.maxPoints,
        params.minSegmentLength,
    );
    state.executeCommands(params.commands);
    return state.getResult();
}
