import {Bar, BAR_IDS} from './components/cards/bar.js';
import {Cards} from './components/cards/cards.js';
import {UserInput} from './components/cards/input.js';
import {List} from './components/cards/list.js';
import {Breadcrumb, GoTop, Tags} from './components/components.js';
import {Country} from './components/maps/country.js';
import {Menu} from './components/navigation.js';
import {Notify} from './components/notify.js';
import {Quiz} from './components/quizzes/quiz.js';
import {Topics} from './components/topics.js';
import {APP_IS_STATIC, APP_NAME, USER} from './constants.js';
import {Data} from './data.js';
import {factory} from './factory.js';
import {Page} from './routes/page.js';
import {Router} from './routes/router.js';
import {ExerciseService} from './services/exercise.js';
import {ScopeCounter} from './utils/counters.js';
import {Timer, TimerOption} from './utils/numbers.js';
import {removeHTML} from './utils/strings.js';
import {localRepository} from './web.js';

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

const {data, router, page, elements, topics, breadcrumb, notify, navigation, exerciseService} = await init;

export {data, router, page, elements, topics, breadcrumb, notify, navigation, exerciseService};
export {factory, removeHTML, localRepository, APP_IS_STATIC, APP_NAME, USER};
export {Timer, TimerOption, ScopeCounter, Bar, BAR_IDS, Cards, UserInput, List, Tags};
export {Quiz, Country};
