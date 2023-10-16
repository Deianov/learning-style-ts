import {navigation, page, router, topics} from '../../main.js';
import {APP_TITLE, DEBUG_CONTENT} from '../constants.js';
import {Callback} from '../types/utils.js';

export interface Route {
    path: string;
    name: RouteName;
    title: string;
    subject: string;
    init?: Callback;
    render?: Callback;
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
        init: () => (router.index = 1),
        render: defaultRender,
    },
    {
        path: '/quizzes',
        name: 'quizzes',
        title: 'Quiz',
        subject: 'Quiz',
        init: () => (router.index = 2),
        render: defaultRender,
    },
    {
        path: '/maps',
        name: 'maps',
        title: 'Maps',
        subject: 'Maps',
        init: () => (router.index = 3),
        render: defaultRender,
    },
    {path: '/login', name: 'login', title: 'Login', subject: 'Login'},
    {path: '/register', name: 'register', title: 'Register', subject: 'Register'},
];

async function home() {
    router.index = Pages.home;
    document.title = routes[Pages.home].title;
    navigation.top.navigateByIndex(1);
    page.blank();
    await page.renderContent(debugContent);
    await topics.render(routes[Pages.cards].name);
}

async function defaultRender() {
    document.title = routes[router.index].title;
    navigation.top.navigateByIndex(router.index);
    page.blank();
    await page.renderContent(debugContent);
    await topics.render(routes[router.index].name);

    // todo: development
    // notify.btn('error', 'toDo', func);
}

function debugContent(parent: HTMLElement) {
    parent.innerHTML = DEBUG_CONTENT;
}

/** export unreferenced copy of the routes */
// todo: are the objects too ?
export default routes.slice(0);
