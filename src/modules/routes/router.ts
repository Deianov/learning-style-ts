import {Links} from '../types/components.js';
import routes, {Pages, Route} from './routes.js';

interface UrlSearchParams {
    page: string;
    id: string;
    username: string;
}

interface State {
    page?: number;
    id?: string;
    index?: number;
}

/*
if (location.protocol !== "https:"){
    location.replace(window.location.href.replace("http:", "https:"));
}
*/

class Router {
    static instance: Router;
    index: Pages = 0;
    routes: Route[] = routes;
    state: State = {};
    route: Route;
    constructor() {
        Router.instance = this;
        this.index = 0;
        this.routes = routes;
        this.state = {page: -1};
        this.route = this.routes[0];
    }
    /**
     * @param {number | string} value   - index, route.name or route.path
     * @returns
     */
    setIndex(value: number | string): Pages {
        this.index = Router.getIndex(value);
        this.route = this.routes[this.index];
        return this.index;
    }
    getLinks(): Links {
        const links: Links = [];
        if (this.index > 0) {
            links.push({href: './', textContent: this.routes[0].subject});
            links.push({key: this.index, textContent: this.route.subject});
        }
        return links;
    }
    static isValid(i: number): boolean {
        return Number.isInteger(i) && i > -1 && i < routes.length;
    }
    /**
     * @param {string|number|null} page         - page index or name || null (from exercise.render -> skip repeat)
     * @param {string|null} id                       - exercise id
     * @param {UrlSearchParams | null} params   - {page, id}
     * @returns {Promise<void>}
     */
    async navigate(page: string | number | null, id?: string, params?: UrlSearchParams): Promise<void> {
        // toDo: ?
        // if (params && params.username) {
        //     CS.app.username = params.username;
        // }

        if (params && params.page) {
            await this.navigate(params.page, params.id);
            return;
        }

        const index: Pages = page === null ? this.index : Router.getIndex(page);
        const isNewPage = index !== this.state.page;
        const isNewId = id !== this.state.id;

        if (isNewPage || isNewId) {
            this.setIndex(index);
            this.state = {page: this.index, id: id || ''};
            const query = '?page=' + this.index + (id ? '&id=' + id : '');
            window.history.pushState(Object.assign({}, this.state), this.route.title || 'EmptyTitle', query);

            const flag = (isNewPage ? 1 : 0) + (isNewId ? 2 : 0) + (page === null ? 4 : 0);
            await Router.update(null, flag);
        }
    }
    /** object from params
     *
     * @returns {UrlSearchParams}  -  {p:1, id:10}
     */
    urlSearchParams(): UrlSearchParams {
        // https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
        const params = new URLSearchParams(window.location.search);
        const res: UrlSearchParams = {
            page: '',
            id: '',
            username: '',
        };
        if (params.has('page')) {
            res.page = params.get('page') || '';
        }
        if (params.has('id')) {
            res.id = params.get('id') || '';
        }
        if (params.has('username')) {
            res.username = params.get('username') || '';
        }
        return res;
    }
    /**
     * @param {number|string} value -> index, path or name
     * @returns {Pages} page index
     */
    static getIndex(value: number | string): Pages {
        let index: number = -1;
        if (typeof value === 'number' && value in Pages) {
            index = value;
        } else if (typeof value === 'string') {
            if (isNaN(value as any)) {
                const str = value.trim().toLowerCase();
                // is page name
                index = Object.values(Pages).indexOf(str);
                // is path
                if (index < 0) {
                    index = routes.findIndex((r) => r.path === str);
                }
            } else {
                // parse
                index = parseInt(value);
            }
        }
        return Router.isValid(index) ? index : Pages.home;
    }

    // -> callbacks
    /**
     * @param event - window.onpopstate
     * @param state - router new state of
     * @param flag
     */
    static async update(event: PopStateEvent | null, flag?: number) {
        // console.log(`update: event: ${event}; eventState: ${event ? JSON.stringify(event.state) : null}; w.path: ${window.location.pathname}; w.search: ${window.location.search}; routerState: ${JSON.stringify(Router.instance.state)}`)

        let isNewPage = null;
        let isNewId = null;
        const router = Router.instance;
        const _state = router.state;

        if (event) {
            if (!event.state) {
                return;
            }
            const {page, id} = event.state;

            isNewPage = page !== _state.index;
            isNewId = id !== _state.id;

            if (isNewPage) {
                router.setIndex(page);
            }
            // update router state
            _state.page = page;
            _state.id = id;
        }
        if (flag) {
            isNewPage = flag === 1 || flag === 3;
            isNewId = flag > 1;
        }
        // reset from exercise to exercise home
        const isBlank = isNewId && !_state.id;
        // render page
        if (isNewPage || isBlank) {
            if (typeof router.route.init === 'function') {
                router.route.init();
            }
            if (typeof router.route.render === 'function') {
                await router.route.render();
            }
            // clear current exercise link
            if (isBlank) {
                // todo:
                // Router.exercise.id = null;
                // Router.exercise.focusLink();
            }
        }
        // render exercise
        if (isNewId && _state.id) {
            // todo:
            // await Router.exercise.render(_state.id);
        }
    }
    static async navigateEvent(e: Event) {
        if (e.target instanceof Element && e.target.hasAttribute('key')) {
            // todo: index or page? second argument ? test ?
            await Router.instance.navigate(parseInt(e.target.getAttribute('key') || ''));
        }
    }
}

// events
// navigating between two history entries
// window.onpopstate = () => setTimeout(Router.instance.update, 0);
window.onpopstate = async function (event: PopStateEvent) {
    await Router.update(event);
};

export {Router};
