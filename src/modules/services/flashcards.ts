import { ExerciseModel } from '../types/models.js';
import { ExercisePlay } from './exercise.js';

type Result = {path: string; count: number; stack: number; success: number; errors: number; timer: {diff: number; text: string}};

export default class Flashcards implements ExercisePlay {
    async render(jsonFile: ExerciseModel): Promise<void> {
        console.log('Flashcards.render()');
    }
    start(): void {
        throw new Error('Method not implemented.');
    }
    stop(): void {
        throw new Error('Method not implemented.');
    }
    reset(): void {
        throw new Error('Method not implemented.');
    }
}
