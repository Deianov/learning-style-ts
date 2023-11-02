import {data, page, router} from '../../main.js';
import {factory, PATH_SERVICES} from '../factory.js';
import {ExerciseModel} from '../types/models.js';

export interface Renderable {
    render(jsonFile: ExerciseModel): Promise<void>;
}

const SERVICE_FILES_BY_ID = ['', 'flashcards.js', 'quizzes.js', 'maps.js'];

export abstract class ExerciseService {
    static async render(id: string): Promise<void> {
        // todo: not working: save the state of the exercise id => router.update()
        await router.navigate(router.index || 1, id);

        // skip index 0
        const fileName: string = SERVICE_FILES_BY_ID[router.index || 1];

        // dynamic import
        const ctor = await factory.importClass<Renderable>(PATH_SERVICES, fileName);
        const instance = await factory.getInstance(ctor);

        const resource = router.route.path + '/' + id;
        const json = (await data.getJson(resource, true)) as ExerciseModel;
        const key = 'learning-style/' + json.exercise.path;

        page.blank(json.exercise);
        await instance.render(json);
    }
}

export async function renderEvent(e: Event) {
    if (e.target instanceof HTMLElement && e.target.tagName === 'A') {
        await ExerciseService.render(e.target.getAttribute('value') || '');
    }
}
