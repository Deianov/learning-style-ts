import {ExerciseModel} from '../types/models.js';

export interface Renderable {
    render(jsonFile: ExerciseModel): Promise<void>;
}
export interface Playable extends Renderable {
    start(): void;
    clickButton(id: string | null | undefined): void;
    stop(): void;
    finish(result: Result): void;
    setController(controller: Controllable): void;
}
export interface Controllable {
    processResult(result: Result): void;
}

export type Result = {path: string; count: number; stack: number; success: number; errors: number; timer: {time: number; label: string}};
// old  timer: {diff: number;text: string;}
