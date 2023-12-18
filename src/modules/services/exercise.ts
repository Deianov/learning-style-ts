import {data, elements, notify, page, router} from '../app.js';
import {factory} from '../factory.js';
import {Cashable, ExerciseInfoModel, ExerciseModel} from '../types/models.js';
import {Controllable, Playable, Result} from '../types/services.js';

type ServiceOptions = {
    fileName: string;
    cashable?: boolean;
    adaptable?: boolean;
    controller?: boolean;
};

/** relative paths from factory */
const PATH_SERVICES: string = './services/';

const EXERCISE_SERVICES_BY_INDEX: (ServiceOptions | undefined)[] = [
    undefined,
    {fileName: 'flashcards.js', adaptable: true, controller: true},
    {fileName: 'quizzes.js'},
    {fileName: 'maps.js'},
];

export class ExerciseService implements Controllable {
    private static instance?: Playable;
    private key: string = '';

    constructor() {}

    async render(id: string): Promise<void> {
        const service = EXERCISE_SERVICES_BY_INDEX[router.page || 1] as ServiceOptions;
        const fileName: string = service.fileName;

        // skip index 0 (provides access to flashcards from home page)
        router.setPage(router.page || 1);

        // dynamic import
        const ctor = await factory.importClassWithArgs<Playable, HTMLElement>(PATH_SERVICES, fileName);
        ExerciseService.instance = await factory.getInstanceWithArgs(ctor, elements.content);

        // append controller
        if (service.controller) {
            ExerciseService.instance.setController(this);
        }

        // resources
        const resource = router.route.path + '/' + id;
        const json: Cashable | null = await data.getJson(resource, !service.cashable, service.adaptable);

        if (!json) {
            const msg = 'Unable to get resource with id: ' + id;
            throw new Error(msg);
        }

        // models
        const exercise: ExerciseModel = json as ExerciseModel;
        const exerciseInfo: ExerciseInfoModel = exercise.exercise;

        // render page
        page.renderExercise(router, exerciseInfo);

        // render content
        await ExerciseService.instance.render(exercise);
    }
    processResult(result: Result): void {
        const {count, stack, success, errors, timer} = result;
        const msg = `${count} | ${stack} (${success} successes, ${errors} errors, ${timer.label} time)`;
        notify.msg('success', msg, {prefix: 'Done!'});
    }
    controlBarEvent(e: Event) {
        if (e.target instanceof Element) {
            const button = getButtonElement(e.target);
            ExerciseService.instance?.clickButton(button?.getAttribute('id'));
        }
    }
}

function getButtonElement(element: Element | null) {
    if (element instanceof Element) {
        if (element.tagName === 'BUTTON') {
            return element;
        } else if (element.tagName === 'DIV') {
            return;
        } else {
            return getButtonElement(element.parentElement);
        }
    }
    return undefined;
}
