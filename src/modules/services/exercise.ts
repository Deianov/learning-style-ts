import {data, page, router} from '../../main.js';
import {factory, PATH_SERVICES} from '../factory.js';
import {elements} from '../routes/page.js';
import {Cashable, ExerciseInfoModel, ExerciseModel} from '../types/models.js';

export interface Renderable {
    render(jsonFile: ExerciseModel): Promise<void>;
}

const SERVICE_FILES_BY_ID = ['', 'flashcards.js', 'quizzes.js', 'maps.js'];

export abstract class ExerciseService {
    static async render(id: string): Promise<void> {
        // skip index 0 (provides access to flashcards from home page)
        router.setPage(router.page || 1);
        const fileName: string = SERVICE_FILES_BY_ID[router.page || 1];

        // dynamic import
        const ctor = await factory.importClassWithArgs<Renderable, HTMLElement>(PATH_SERVICES, fileName);
        const instance = await factory.getInstanceWithArgs(ctor, elements.content);

        // resources
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

        // render page
        page.renderExercise(router, exerciseInfo);

        // render content
        await instance.render(exercise);
    }
}
