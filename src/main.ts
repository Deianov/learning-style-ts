import {Breadcrumb, GoTop} from './modules/components/components.js';
import {Menu} from './modules/components/navigation.js';
import {Notify} from './modules/components/notify.js';
import {Topics} from './modules/components/topics.js';
import {Data} from './modules/data.js';
import {factory} from './modules/factory.js';
import {elements, Page} from './modules/routes/page.js';
import {Router} from './modules/routes/router.js';

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

    // instances
    const breadcrumb = await factory.getInstance(Breadcrumb);

    // events
    elements.topics.addEventListener('click', router.renderEvent);

    return {data, router, page, topics, breadcrumb, notify, navigation};
})();

export const {data, router, page, topics, breadcrumb, notify, navigation} = await modules;

// start app
router.navigate(0, null, router.urlSearchParams());
