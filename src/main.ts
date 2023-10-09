import {Breadcrumb, GoTop} from './modules/components/components.js';
import {Menu} from './modules/components/navigation.js';
import {Notify} from './modules/components/notify.js';
import {Topics} from './modules/components/topics.js';
import {Data} from './modules/data.js';
import {factory} from './modules/factory.js';
import {Page} from './modules/routes/page.js';
import {Router} from './modules/routes/router.js';
import {renderEvent} from './modules/services/exercise.js';
import {EventType} from './modules/types/utils.js';

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
        top: new Menu(Page.elements['menu']),
    };

    // init classes
    factory.addProps('Breadcrumb', {eventType: EventType.click, event: Router.navigateEvent});

    // instances
    const breadcrumb = await factory.getInstance(Breadcrumb);

    // events
    Page.elements['topics'].addEventListener(EventType.click, renderEvent);

    return {data, router, page, topics, breadcrumb, notify, navigation};
})();

export const {data, router, page, topics, breadcrumb, notify, navigation} = await modules;

// start app
router.navigate(0, undefined, router.urlSearchParams());
