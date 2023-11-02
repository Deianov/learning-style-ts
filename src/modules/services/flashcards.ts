import {ExerciseModel} from '../types/models.js';
import {Renderable} from './exercise.js';

type Result = {path: string; count: number; stack: number; success: number; errors: number; timer: {diff: number; text: string}};

export default class Flashcards implements Renderable {
    async render(jsonFile: ExerciseModel): Promise<void> {
        console.log('Flashcards.render()');
    }
}
