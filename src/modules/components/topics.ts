import {data} from '../../main.js';
import {APP_IS_STATIC, APP_LANG, ASSETS_LOADER_PUFF, CLASSNAME_FOCUS, DOM_TOPICS_PARENT_TAGNAME} from '../constants.js';
import {Pages} from '../routes/routes.js';
import {Cashable, Category} from '../types/models.js';
import dom from '../utils/dom.js';
import {url} from '../utils/web.js';

class Topics {
    private element: HTMLElement;
    private static lastPage: Pages;
    constructor() {
        this.element = document.getElementsByTagName(DOM_TOPICS_PARENT_TAGNAME)[0];
    }
    async render(pageIndex: Pages): Promise<void> {
        if (Topics.lastPage === pageIndex) {
            this.focusLinkById();
            return;
        }

        this.element.innerHTML = `<ul>${ASSETS_LOADER_PUFF}</ul>`;

        const path: string = Pages[pageIndex];
        const query = APP_IS_STATIC ? '' : `?lang=${APP_LANG}`;

        try {
            const req: Cashable | null = await data.getJson(`${path}${query}`, true, false);

            if (req === null) {
                return;
            }

            const categories: Category[] = req as Category[];
            this.element.innerHTML = '';

            for (const category of categories) {
                this.renderTopic(this.element, pageIndex, category);
            }
        } finally {
            Topics.lastPage = pageIndex;
        }
    }
    renderTopic(parent: HTMLElement, pageIndex: number, category: Category): void {
        const ul = dom.element('ul', parent);
        dom.text('h3', ul, category.category);
        for (const link of category.links) {
            // const href = `/?page=${pageIndex}&id=${link.id}`;
            const href = url.toQuery(pageIndex, link.id.toString());
            this.renderLink(ul, href, link.text);
        }
    }
    renderLink(parent: HTMLElement, href: string, label: string): void {
        dom.text('a', dom.element('li', parent), label, {href});
    }
    focusLinkById(id?: string | number): void {
        const v: string | undefined = typeof id === 'number' ? id.toString() : id;
        for (const a of document.querySelectorAll('aside a')) {
            const params = url.parseUrlSearchParams(a.getAttribute('href') || '');
            a.classList.toggle(CLASSNAME_FOCUS, params['id'] === v);
        }
    }
}

export {Topics};
