import {USER} from '../constants.js';
import {exerciseService, navigation, page} from '../modules.js';
import {Links} from '../types/components.js';
import {strings} from '../utils/strings.js';
import {url} from '../utils/web.js';
import {Pages, Route, RouterInterface, routes} from './routes.js';

/*
if (location.protocol !== "https:"){
    location.replace(window.location.href.replace("http:", "https:"));
}
*/

enum URL_SEARCH_PARAMS {
    page = 'page',
    id = 'id',
    username = 'username',
}
type SearchParams = {
    [key in URL_SEARCH_PARAMS]?: string | null;
};
type PageIndex = string | number | null;

abstract class State {
    // undefined -> null (first state)
    private static saved: {page?: number; id?: string | null} = {};
    private static isNewState: boolean = false;

    // read-only
    static page: number = 0;
    static id: string | null = null;
    static isNewPage: boolean = false;
    static isNewId: boolean = false;
    static isBlank: boolean = false;

    private constructor() {}

    static save(page: number, id: string | null): void {
        const newPage = State.getPage(page);
        const newId = State.getId(id);
        State.isNewPage = State.saved.page !== newPage;
        State.isNewId = State.saved.id !== newId;
        // from id to page || first loading of page -> undefined to null
        State.isBlank = State.isNewId && newId === null;
        State.page = newPage;
        State.id = newId;
        State.saved = {page: newPage, id: newId};
        State.isNewState = State.isNewPage || State.isNewId;
    }
    static push(title?: string): void {
        if (State.isNewState) {
            const query = url.toQuery(State.saved.page || 0, State.saved.id || null);
            window.history.pushState(Object.assign({}, State.saved), title || '', query);
            State.isNewState = false;
        }
    }
    private static getPage(n: number): number {
        return Number.isInteger(n) && n > 0 ? n : 0;
    }
    private static getId(s: string | null | undefined): string | null {
        return s && strings.isValid(s) ? strings.clear(s) : null;
    }
}

export class Router implements RouterInterface {
    static instance: Router;
    page: Pages;
    routes: Route[];
    route: Route;
    constructor() {
        Router.instance = this;
        this.page = Pages.home;
        this.routes = routes;
        this.route = this.routes[this.page];
    }
    static isValid(index: number): boolean {
        return Number.isInteger(index) && index > -1 && index < routes.length;
    }
    static getIndex(value: number | string): Pages {
        const index = typeof value === 'string' ? parseInt(value) : value;
        return Router.isValid(index) ? index : Pages.home;
    }
    setPage(value: number | string): Pages {
        this.page = Router.getIndex(value);
        this.route = this.routes[this.page];
        return this.page;
    }
    urlSearchParams(urlString?: string): SearchParams | undefined {
        const params = typeof urlString === 'string' ? url.parseUrlSearchParams(urlString) : url.getLocationSearchParams();
        const result: SearchParams = {};

        for (const key of Object.values(URL_SEARCH_PARAMS)) {
            if (Object.prototype.hasOwnProperty.call(params, key)) {
                result[key] = params[key] || null;
            }
        }
        return Object.keys(result).length === 0 ? undefined : result;
    }
    getLinks(): Links {
        const links: Links = [];
        if (this.page > 0) {
            links.push({href: url.toQuery(0, null), textContent: this.routes[0].subject});
            links.push({href: url.toQuery(this.page, null), textContent: this.route.subject});
        }
        return links;
    }
    async navigate(page: PageIndex, id: string | null, params?: SearchParams | string): Promise<void> {
        // relative path | SearchParams
        if (params) {
            const searchParams: SearchParams = (typeof params === 'string' ? this.urlSearchParams(params) : params) || {};

            // todo: fictive login
            if (searchParams.username) {
                USER.username = searchParams.username;
            }
            await this.navigate(searchParams.page || null, searchParams.id || null);
            return;
        }

        let pageIndex: number = typeof page === 'string' || typeof page === 'number' ? Router.getIndex(page) : this.page;
        // When navigating from home to flashcards, hack the index.
        pageIndex = id && pageIndex === 0 ? Pages.cards : pageIndex;

        State.save(pageIndex, id);
        State.push(this.route.title);

        if (State.isNewPage || State.isNewId) {
            await Router.update();
        }
    }
    static async update(event?: PopStateEvent | null) {
        const router = Router.instance;

        if (event && event.state) {
            const newIndex = Router.getIndex(event.state.page);
            const newId = event.state.id;

            State.save(newIndex, newId);
        }
        if (State.isNewPage) {
            router.setPage(State.page);
        }
        const isNewExercise = State.id && State.isNewId;

        // update navigation (skip index 0)
        navigation.top.navigateByIndex(router.page || 1);

        // render page
        if (State.isNewPage || State.isBlank) {
            await page.renderPage(Router.instance, !isNewExercise);
        }

        // render exercise
        if (isNewExercise) {
            await exerciseService.render(State.id!);
        }
    }
    /** Breadcrumbs, Topics event: Attribute: href = UrlSearchString = /?page=Number&id=Number */
    async renderEvent(e: Event): Promise<void> {
        if (e.target instanceof HTMLElement && e.target.hasAttribute('href')) {
            e.preventDefault();
            const href: string = e.target.getAttribute('href') || '';
            await Router.instance.navigate(null, null, href);
        }
    }
}

// navigating between two history entries
// window.onpopstate = () => setTimeout(Router.instance.update, 0);
window.onpopstate = async function (event: PopStateEvent) {
    await Router.update(event);
};
