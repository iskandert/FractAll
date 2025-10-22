# Типы (TypeScript — контрактные определения)

/\* — рекомендации:

- все union-типы — discriminated unions (поле `type` обязательно).
- помечайте неизменяемость `readonly` там, где ожидается immutability.
- большие буферы описывайте через TypedArray (Float32Array/Uint32Array).
- версия форматов — поле `version` в DTO. \*/

```ts
// Базовые временные типы
export type Point = { readonly x: number; readonly y: number };
export type BBox = { readonly minX: number; readonly minY: number; readonly maxX: number; readonly maxY: number };

// Настройки (serializable DTO)
export interface Alias {
    readonly symbol: string; // одиночный символ/строка
    readonly replacement: string; // строка замены (L-system)
}

export type HandlerKind = 'draw' | 'move' | 'rotate' | 'noop' | 'custom';

export interface HandlerParamsRotate {
    readonly angle: number;
} // градусы, целые или float по договору
export interface HandlerParamsDraw {
    readonly length: number;
    readonly deviation?: number;
}
export interface HandlerParamsMove {
    readonly length: number;
}
export interface HandlerParamsCustom {
    readonly name: string;
    readonly params?: Record<string, any>;
}

export type HandlerParams = HandlerParamsRotate | HandlerParamsDraw | HandlerParamsMove | HandlerParamsCustom;

export interface HandlerDef {
    readonly symbol: string; // символ, к которому привязан handler
    readonly kind: HandlerKind;
    readonly params?: HandlerParams;
}

// Сохраняемые настройки генерации
export interface LSystemSettings {
    readonly version?: string; // schema version
    readonly axiom: string;
    readonly aliases: readonly Alias[];
    readonly handlers: readonly HandlerDef[];
    readonly iterations: number;
    readonly maxPoints?: number; // optional cap
    readonly seed?: number; // optional for stochastic rules
}
```

```ts
// Команды как данные (discriminated unions)
export interface MoveCommand {
    readonly type: 'move';
    readonly distance: number;
}
export interface DrawCommand {
    readonly type: 'draw';
    readonly distance: number;
    readonly penDown?: boolean;
}
export interface RotateCommand {
    readonly type: 'rotate';
    readonly angle: number;
} // degrees
export interface PushCommand {
    readonly type: 'push';
}
export interface PopCommand {
    readonly type: 'pop';
}
export interface SetColorCommand {
    readonly type: 'setColor';
    readonly color: string;
} // optional

export type Command =
    | MoveCommand
    | DrawCommand
    | RotateCommand
    | PushCommand
    | PopCommand
    | SetColorCommand
    | { readonly type: 'custom'; readonly name: string; readonly args?: any }; // escape hatch
```

```ts
// Результаты: вершинный формат (два варианта)
export type VerticesArray = readonly (readonly Point[])[]; // удобен для Vue, small/medium datasets

// performant flat buffer: coords interleaved [x0,y0,x1,y1...], offsets — начало каждой полилинии
export interface FlatVertices {
    readonly coords: Float32Array; // length = 2 * totalPoints
    readonly offsets: Uint32Array; // offsets.length = number of polylines + 1 (last = totalPoints)
    readonly counts?: Uint32Array; // optional: number of points per polyline
    readonly bbox?: BBox;
}

export interface LSystemMeta {
    readonly iterations: number;
    readonly points: number;
    readonly timeMs?: number;
    readonly version?: string;
}

export interface LSystemResult {
    readonly pattern: string;
    readonly commands?: readonly Command[]; // optional: may be omitted for huge outputs
    readonly vertices?: VerticesArray; // optional
    readonly flat?: FlatVertices; // optional (preferred for big datasets)
    readonly bbox: BBox;
    readonly meta: LSystemMeta;
}
```

```ts
// Worker ↔ Main thread сообщения (discriminated unions)
export interface WorkerRequestGenerate {
    readonly type: 'generate';
    readonly id: string; // request id
    readonly settings: LSystemSettings;
    readonly options?: { useFlat?: boolean; maxChunkMs?: number }; // hints
}

export interface WorkerRequestCancel {
    readonly type: 'cancel';
    readonly id: string;
}

export interface WorkerRequestPing {
    readonly type: 'ping';
    readonly id?: string;
}

export type WorkerRequest = WorkerRequestGenerate | WorkerRequestCancel | WorkerRequestPing;

export interface WorkerResponseProgress {
    readonly type: 'progress';
    readonly id: string;
    readonly iteration: number;
    readonly estimatedIterations?: number;
    readonly percent?: number;
    readonly timeMs?: number;
}

export interface WorkerResponseResult {
    readonly type: 'result';
    readonly id: string;
    readonly result: Omit<LSystemResult, 'flat'>; // lighter copy
    // если используется flat, буфер передаётся отдельно как Transferable, см. pipeline
}

export interface WorkerResponseResultWithFlat {
    readonly type: 'result_flat';
    readonly id: string;
    readonly resultMeta: { readonly pattern: string; readonly bbox: BBox; readonly meta: LSystemMeta };
    // buffers are transferables
    // coords buffer: Float32Array.buffer, offsets buffer: Uint32Array.buffer
    // we'll send them as transferables
}

export interface WorkerResponseError {
    readonly type: 'error';
    readonly id: string;
    readonly message: string;
    readonly code?: string;
}

export type WorkerResponse =
    | WorkerResponseProgress
    | WorkerResponseResult
    | WorkerResponseResultWithFlat
    | WorkerResponseError;
```

```ts
// Pinia store state (shallow refs recommended)
export type LSystemStatus = 'idle' | 'running' | 'cancelling' | 'error' | 'ready';

export interface LSystemStoreState {
    readonly settings: LSystemSettings | null;
    readonly status: LSystemStatus;
    readonly progress?: number;
    readonly lastError?: string | null;
    readonly resultRef:
        | { current: LSystemResult | null }
        | { flatRef: { coords?: Float32Array | null; offsets?: Uint32Array | null } };
    // NOTE: implement resultRef as shallowRef in Pinia: shallowRef<LSystemResult | null>
}
```

`IRenderer.ts` — контракт:

```ts
interface IRenderer {
  renderFlat(fv: FlatVertices, viewport: {w:number,h:number}): void;
  renderArray(vertices: VerticesArray, viewport: ...): void;
  reset(): void;
  resize(w:number,h:number): void;
}
```
