import {ExerciseModel} from '../types/models';
import {ExercisePlay} from './exercise';

type Result = {path: string; count: number; stack: number; success: number; errors: number; timer: {diff: number; text: string}};

export default class Flashcards implements ExercisePlay {
    render(jsonFile: ExerciseModel): Promise<void> {
        console.log('Flashcards.render()');

        throw new Error('Method not implemented.');
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
