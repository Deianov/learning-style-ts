import {navigation, page, router, topics} from '../../main.js';
import {APP_TITLE, DEBUG_CONTENT} from '../constants.js';
import {Callback, CallbackPromiseArgBoolean} from '../types/utils.js';

export interface Route {
    path: string;
    name: RouteName;
    title: string;
    subject: string;
    init?: Callback;
    render?: CallbackPromiseArgBoolean;
}

export enum Pages {
    'home',
    'cards',
    'quizzes',
    'maps',
    'login',
    'register',
}
export type RouteName = keyof typeof Pages;

const routes: Route[] = [
    {path: '/', name: 'home', title: APP_TITLE, subject: 'Home', render: home},
    {
        path: '/cards',
        name: 'cards',
        title: 'Cards',
        subject: 'Cards',
        init: () => console.log('routes.cards.init()'),
        render: defaultRender,
    },
    {
        path: '/quizzes',
        name: 'quizzes',
        title: 'Quiz',
        subject: 'Quiz',
        render: defaultRender,
    },
    {
        path: '/maps',
        name: 'maps',
        title: 'Maps',
        subject: 'Maps',
        render: defaultRender,
    },
    {path: '/login', name: 'login', title: 'Login', subject: 'Login'},
    {path: '/register', name: 'register', title: 'Register', subject: 'Register'},
];

/**
 * @param {boolean} flag - skip rendering of content
 */
async function home(flag?: boolean) {
    // router.setPage(Pages.home);
    document.title = routes[Pages.home].title;
    navigation.top.navigateByIndex(Pages.cards);
    page.blankPage(routes[Pages.home].subject);
    await page.renderContent(debugContent, flag);
    await topics.render(routes[Pages.cards].name);
}

/**
 * @param {boolean} flag - skip rendering of content
 */
async function defaultRender(flag?: boolean) {
    const route = routes[router.page];
    document.title = route.title;
    navigation.top.navigateByIndex(router.page);
    page.blankPage(route.subject);
    await page.renderContent(debugContent, flag);
    await topics.render(route.name);

    // todo: development
    // notify.btn('error', 'toDo', func);
}

export async function debugContent(parent: HTMLElement) {
    parent.innerHTML = DEBUG_CONTENT;
}

/** export unreferenced copy of the routes */
// todo: are the objects too ?
export default routes.slice(0);
