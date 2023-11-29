import {Breadcrumb, GoTop} from './modules/components/components.js';
import {Menu} from './modules/components/navigation.js';
import {Notify} from './modules/components/notify.js';
import {Topics} from './modules/components/topics.js';
import {Data} from './modules/data.js';
import {factory} from './modules/factory.js';
import {elements, Page} from './modules/routes/page.js';
import {Router} from './modules/routes/router.js';
import {ExerciseService} from './modules/services/exercise.js';

// init modules
const modules = (async () => {
    // startup instances
    const data = new Data();
    const router = new Router();
    const page = new Page();
    const topics = new Topics();
    const notify = new Notify();
    new GoTop();
    const navigation = {
        top: new Menu(elements.menu),
    };
    const exerciseService = new ExerciseService();

    // instances managed from the factory
    const breadcrumb = await factory.getInstanceWithArgs(Breadcrumb, elements.header);

    // events
    elements.topics.addEventListener('click', router.renderEvent);

    // add events using factory configuration
    factory.addProps('Bar', {eventType: 'click', event: exerciseService.controlBarEvent});

    return {data, router, page, topics, breadcrumb, notify, navigation, exerciseService};
})();

export const {data, router, page, topics, breadcrumb, notify, navigation, exerciseService} = await modules;

// start app
router.navigate(0, null, router.urlSearchParams());
