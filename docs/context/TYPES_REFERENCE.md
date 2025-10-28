# Справочник типов (нереализованные)

Этот файл содержит только **нереализованные** типы данных, которые будут реализованы на последующих этапах.

Реализованные типы находятся в:
- `src/features/l-system/domain/types.ts` — Command, LSystemSettings, PathSegment, GeometryBuilderParams и др.
- `src/shared/types/index.ts` — Point, Vector, BBox и др.

---

## FlatVertices (Этап 5 - производительный рендеринг)

Performant flat buffer формат для передачи больших геометрий:

```ts
export interface FlatVertices {
    readonly coords: Float32Array; // length = 2 * totalPoints, interleaved [x0,y0,x1,y1...]
    readonly offsets: Uint32Array; // offsets.length = number of polylines + 1 (last = totalPoints)
    readonly counts?: Uint32Array; // optional: number of points per polyline
    readonly bbox?: BBox;
}
```

---

## LSystemResult (Этап 3-5 - результаты генерации)

```ts
export interface LSystemMeta {
    readonly iterations: number;
    readonly points: number;
    readonly timeMs?: number;
    readonly version?: string;
}

export interface LSystemResult {
    readonly pattern: string;
    readonly commands?: readonly Command[]; // optional: may be omitted for huge outputs
    readonly vertices?: PathSegment[]; // optional (используется сейчас)
    readonly flat?: FlatVertices; // optional (preferred for big datasets, этап 5)
    readonly bbox: BBox;
    readonly meta: LSystemMeta;
}
```

---

## Worker Messages (Этап 4 - WebWorker integration)

Worker ↔ Main thread сообщения (discriminated unions):

```ts
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

---

## Pinia Store State (Этап 3)

```ts
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

---

## IRenderer (Этап 2-5 - рендереры)

```ts
interface IRenderer {
    renderFlat(fv: FlatVertices, viewport: { w: number; h: number }): void;
    renderArray(vertices: PathSegment[], viewport: { w: number; h: number }): void;
    reset(): void;
    resize(w: number, h: number): void;
}
```

---
