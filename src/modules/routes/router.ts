import {USER} from '../constants.js';
import {ExerciseService} from '../services/exercise.js';
import {Links} from '../types/components.js';
import routes, {Pages, Route} from './routes.js';

type UrlSearchParams = {
    page?: string | null;
    id?: string | null;
    username?: string | null;
};

type State = {
    page?: number;
    id?: string;
};

type Page = string | number | null | undefined | false;

/*
if (location.protocol !== "https:"){
    location.replace(window.location.href.replace("http:", "https:"));
}
*/

class Router {
    static instance: Router;
    page: Pages;
    routes: Route[];
    route: Route;
    private state: State;
    constructor() {
        Router.instance = this;
        this.page = Pages.home;
        this.routes = routes;
        this.state = {page: -1};
        this.route = this.routes[this.page];
    }
    /**
     * @param {number | string} value  - page index
     * @returns
     */
    setPage(value: number | string): Pages {
        this.page = Router.getIndex(value);
        this.route = this.routes[this.page];
        return this.page;
    }
    getLinks(): Links {
        const links: Links = [];
        if (this.page > 0) {
            links.push({href: './', textContent: this.routes[Pages.home].subject});
            links.push({value: this.page, textContent: this.route.subject});
        }
        return links;
    }
    static isValid(i: number): boolean {
        return Number.isInteger(i) && i > -1 && i < routes.length;
    }
    /**
     * @param {Page} page                               - page index | Falsy
     * @param {string | undefined} id                   - exercise id
     * @param {UrlSearchParams | undefined} params      - {page, id, username}
     * @returns {Promise<void>}
     */
    async navigate(page: Page, id?: string | null, params?: UrlSearchParams): Promise<void> {
        if (params) {
            // todo: fictive login
            if (params.username) {
                USER.username = params.username;
            }
            await this.navigate(params.page, params.id);
            return;
        }

        const index: Pages = page ? Router.getIndex(page) : this.page;
        const isNewPage = index !== this.state.page;
        const isNewId = isNewPage || id !== this.state.id;

        if (isNewPage || isNewId) {
            this.setPage(index);
            this.state = {page: this.page, id: id || ''};
            const query = '?page=' + this.page + (id ? '&id=' + id : '');
            window.history.pushState(Object.assign({}, this.state), this.route.title || 'EmptyTitle', query);
            const flags = (isNewPage ? 1 : 0) + (isNewId ? 2 : 0);
            await Router.update(null, flags);
        }
    }
    /**
     * @returns {UrlSearchParams | undefined}
     */
    urlSearchParams(): UrlSearchParams | undefined {
        const params = new URLSearchParams(window.location.search);
        const res: UrlSearchParams = {};
        if (params.has('page')) {
            res.page = params.get('page');
        }
        if (params.has('id')) {
            res.id = params.get('id') || '';
        }
        if (params.has('username')) {
            res.username = params.get('username') || '';
        }
        return Object.keys(res).length === 0 ? undefined : res;
    }

    /**
     * @param {number | string} value -> page index
     * @returns {Pages} page index
     */
    static getIndex(value: number | string): Pages {
        const index = typeof value === 'string' ? parseInt(value) : value;
        return Router.isValid(index) ? index : Pages.home;
    }

    /**
     * @param event - window.onpopstate
     * @param flags - 1: new page, 2: new id
     */
    static async update(event: PopStateEvent | null, flags?: number) {
        // console.log(`update: event: ${event}; eventState: ${event ? JSON.stringify(event.state) : null}; w.path: ${window.location.pathname}; w.search: ${window.location.search}; routerState: ${JSON.stringify(Router.instance.state)}`)

        let isNewPage = undefined;
        let isNewId = undefined;
        const router = Router.instance;
        const state = router.state;

        if (event) {
            if (!event.state) {
                return;
            }
            const newIndex = Router.getIndex(event.state.page);
            const newId = event.state.id;

            isNewPage = newIndex !== state.page;
            isNewId = isNewPage || newId !== state.id;

            if (isNewPage) {
                router.setPage(newIndex);
            }

            // update router state
            state.page = newIndex;
            state.id = newId;

            // custom update
        } else if (flags) {
            isNewPage = (flags & 1) > 0;
            isNewId = (flags & 2) > 0;
        }
        // todo: isBlank ???
        // reset from exercise to exercise home
        const isBlank = isNewId && !state.id;

        // render page
        if (isNewPage || isBlank) {
            if (router.route.init) {
                router.route.init();
            }
            if (router.route.render) {
                // skip content if has render exercise
                await router.route.render(isNewPage);
            }
        }

        // render exercise
        if (isNewId && state.id) {
            await ExerciseService.render(state.id);
        }
    }
    /**
     * Breadcrumb event:  value === page index
     */
    static async renderPageEvent(e: Event) {
        if (e.target instanceof HTMLElement && e.target.hasAttribute('value')) {
            await Router.instance.navigate(e.target.getAttribute('value'));
        }
    }
    /**
     *
     * Topics event: value === exercise id
     */
    static async renderExerciseEvent(e: Event) {
        if (e.target instanceof HTMLElement && e.target.tagName === 'A') {
            await Router.instance.navigate(null, e.target.getAttribute('value'));
        }
    }
}

// navigating between two history entries
// window.onpopstate = () => setTimeout(Router.instance.update, 0);
window.onpopstate = async function (event: PopStateEvent) {
    await Router.update(event);
};

export {Router};
