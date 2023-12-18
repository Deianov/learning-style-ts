import {Breadcrumb, GoTop} from './components/components.js';
import {Menu} from './components/navigation.js';
import {Notify} from './components/notify.js';
import {Topics} from './components/topics.js';
import {Data} from './data.js';
import {factory} from './factory.js';
import {Page} from './routes/page.js';
import {Router} from './routes/router.js';
import {ExerciseService} from './services/exercise.js';

// init modules
const init = (async () => {
    // startup instances
    const data = new Data();
    const router = new Router();
    const page = new Page();
    const elements = page.elements;
    const topics = new Topics();
    const notify = new Notify(elements);
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

    return {data, router, page, elements, topics, breadcrumb, notify, navigation, exerciseService};
})();

export const {data, router, page, elements, topics, breadcrumb, notify, navigation, exerciseService} = await init;
