import {notify} from '../app.js';
import {Quiz} from '../components/quizzes/quiz.js';
import {APP_IS_STATIC} from '../constants.js';
import {factory} from '../factory.js';
import {ExerciseQuizModel, PropsQuizModel} from '../types/models.js';
import {Renderable} from '../types/services.js';

const MSG_QUIZ_SERVER_REQUIRED = 'Server validation is not supported on static version.';
const MSG_QUIZ_NOT_FOUND_ANSWERS = 'Not found correct answers.';

class Quizzes implements Renderable {
    private static json: ExerciseQuizModel;
    private static quiz: Promise<Quiz>;

    constructor(parent: HTMLElement) {
        Quizzes.quiz = factory.getInstanceWithArgs(Quiz, parent);
    }

    async render(jsonFile: ExerciseQuizModel): Promise<void> {
        // list of correct answers, if not found -> server validation
        if (!jsonFile.correct && APP_IS_STATIC) {
            notify.alert('error', MSG_QUIZ_SERVER_REQUIRED);
        }

        Quizzes.json = jsonFile;
        (await Quizzes.quiz).render(jsonFile, Quizzes.validate);
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

export default Quizzes;
