import {notify} from '../../main.js';
import {Quiz} from '../components/exercises/quiz.js';
import {APP_IS_STATIC, DOM_CONTENT_ID, MSG_QUIZ_NOT_FOUND_ANSWERS, MSG_QUIZ_SERVER_REQUIRED} from '../constants.js';
import {factory} from '../factory.js';
import {ExerciseQuizModel, PropsQuizModel} from '../types/models.js';
import dom from '../utils/dom.js';
import {ExercisePlay} from './exercise.js';

export default class Quizzes implements ExercisePlay {
    private static json: ExerciseQuizModel;
    private static quiz: Promise<Quiz>;

    constructor(parent: string = DOM_CONTENT_ID) {
        Quizzes.quiz = factory.getInstanceWithArgs(Quiz, dom.get(parent)!);
    }

    async render(jsonFile: ExerciseQuizModel): Promise<void> {
        // list of correct answers, if not found -> server validation
        if (!jsonFile.correct && APP_IS_STATIC) {
            notify.alert('error', MSG_QUIZ_SERVER_REQUIRED);
        }
        Quizzes.json = jsonFile;
        (await Quizzes.quiz).render(jsonFile, Quizzes.validate);
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

    static async validate() {
        const quiz = await Quizzes.quiz;

        if (quiz.isValidated) {
            quiz.reset();
            return;
        }

        const correct = Quizzes.json?.correct;
        const props: PropsQuizModel = Quizzes.json.props as PropsQuizModel;
        const certification: boolean = props.certification === '1';
        // server validation
        if ((!correct || certification) && !APP_IS_STATIC) {
            // todo: with server
            // const res = await data.getJsonWithPayload(`/quizzes/${this.json.exercise.id}/certification`, {answers: quiz.getUserAnswers()});
        }

        if (!correct) {
            notify.alert('error', MSG_QUIZ_NOT_FOUND_ANSWERS);
            return;
        }

        const result: {correct: number; from: number} = quiz.validate(correct);

        if (result.correct > 0 && result.correct / result.from > 0.7) {
            notify.alert('info', `Bravo! ${(result.correct / result.from) * 100}%`);
        }
    }
}
