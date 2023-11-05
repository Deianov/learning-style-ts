import {data, page, router} from '../../main.js';
import {factory, PATH_SERVICES} from '../factory.js';
import {debugContent} from '../routes/routes.js';
import {Cashable, ExerciseInfoModel, ExerciseModel} from '../types/models.js';

export interface Renderable {
    render(jsonFile: ExerciseModel): Promise<void>;
}

const SERVICE_FILES_BY_ID = ['', 'flashcards.js', 'quizzes.js', 'maps.js'];

export abstract class ExerciseService {
    /**
     * @param {string} id - exercise id
     */
    static async render(id: string): Promise<void> {
        // skip index 0 (provides access to flashcards from home page)
        router.setPage(router.page || 1);

        // skip index 0 (service filename)
        const fileName: string = SERVICE_FILES_BY_ID[router.page || 1];

        // dynamic import
        const ctor = await factory.importClass<Renderable>(PATH_SERVICES, fileName);
        const instance = await factory.getInstance(ctor);

        // get resources
        const resource = router.route.path + '/' + id;
        const json: Cashable | null = await data.getJson(resource, true);

        if (!json) {
            const msg = 'Unable to get resource with id: ' + id;
            throw new Error(msg);
        }

        // models
        const exercise: ExerciseModel = json as ExerciseModel;
        const exerciseInfo: ExerciseInfoModel = exercise.exercise;

        // todo:
        const key = 'learning-style/' + exerciseInfo.path;

        // render exercise
        page.blankExercise(exerciseInfo);

        // add fun
        if (fileName === 'quizzes.js') {
            // add kiwi to quizzes
            page.renderContent(debugContent);
        }

        await instance.render(exercise);
    }
}
