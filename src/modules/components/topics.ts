import {data} from '../../main.js';
import {APP_IS_STATIC, APP_LANG, ASSETS_LOADER_PUFF, DOM_TOPICS_PARENT_TAGNAME} from '../constants.js';
import {RouteName} from '../routes/routes.js';
import {Category, Link} from '../types/models.js';
import dom from '../utils/dom.js';

class Topics {
    private element: HTMLElement;
    private static lastPage: RouteName;
    constructor() {
        this.element = document.getElementsByTagName(DOM_TOPICS_PARENT_TAGNAME)[0];
    }
    async render(page: RouteName): Promise<void> {
        // skip reloads
        if (Topics.lastPage === page) {
            return;
        }

        this.element.innerHTML = `<ul>${ASSETS_LOADER_PUFF}</ul>`;

        const path = page;
        const query = APP_IS_STATIC ? '' : `?lang=${APP_LANG}`;

        try {
            const categories = (await data.getJson(`${path}${query}`, true, false)) as Category[];
            this.element.innerHTML = '';

            for (const category of categories) {
                this.renderTopic(this.element, category);
            }
        } finally {
            Topics.lastPage = page;
        }
    }
    renderTopic(parent: HTMLElement, category: Category) {
        const ul = dom.element('ul', parent);
        // todo: api?
        const api = ''; // category.api || ''
        dom.text('h3', ul, category.category);
        category.links.forEach((link: Link) => this.renderLink(ul, `${api}${link.id}`, link.text));
    }
    renderLink(parent: HTMLElement, value: string, label: string) {
        dom.text('a', dom.element('li', parent), label, {href: 'javascript:void(0)', value});
    }
}

export {Topics};
