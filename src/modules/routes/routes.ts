import {APP_TITLE} from '../constants.js';
import {Links} from '../types/components.js';
import {Callback} from '../types/utils.js';

export interface Route {
    path: string;
    name: RouteName;
    title: string;
    subject: string;
    init?: Callback;
    render?: RenderIndex;
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

export enum RenderIndex {
    DEFAULT,
    HOME,
}

export const routes: Route[] = [
    {path: '/', name: 'home', title: APP_TITLE, subject: 'Home', render: RenderIndex.HOME},
    {
        path: '/cards',
        name: 'cards',
        title: 'Cards',
        subject: 'Cards',
        // init: () => console.log('routes.cards.init()'),
        render: RenderIndex.DEFAULT,
    },
    {
        path: '/quizzes',
        name: 'quizzes',
        title: 'Quiz',
        subject: 'Quiz',
        render: RenderIndex.DEFAULT,
    },
    {
        path: '/maps',
        name: 'maps',
        title: 'Maps',
        subject: 'Maps',
        render: RenderIndex.DEFAULT,
    },
    {path: '/login', name: 'login', title: 'Login', subject: 'Login'},
    {path: '/register', name: 'register', title: 'Register', subject: 'Register'},
];

// SHARED INTERFACES

export interface RouterInterface {
    page: Pages;
    route: Route;
    setPage(value: number | string): Pages;
    getLinks(): Links;
    renderEvent(e: Event): Promise<void>;
}
