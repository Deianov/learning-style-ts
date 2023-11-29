import {breadcrumb, notify, topics} from '../../main.js';
import {subject} from '../components/subject.js';
import * as C from '../constants.js';
import {ExerciseInfoModel} from '../types/models.js';
import {CallbackRenderContent} from '../types/utils.js';
import dom from '../utils/dom.js';
import {Pages, Route, RouterInterface} from './routes.js';

const DOM_ELEMENTS = [
    'pageheader',
    'menu',
    'topics',
    'article',
    'header',
    'control',
    'content',
    'messages',
    'bottom',
    'cdate',
    'breadcrumb',
    'subject',
    'notify1',
    'notify2',
] as const;

type Elements = {
    [key in (typeof DOM_ELEMENTS)[number]]: HTMLElement;
};

export const elements: Elements = getDomElements();

export class Page {
    private readonly renders: CallbackRenderContent[] = [renderDefault, renderHome];
    public isActive: boolean = false;

    constructor() {}
    async renderPage(router: RouterInterface, content: boolean) {
        this.reset();
        if (router.route.init) {
            router.route.init();
        }
        const route: Route = router.route;

        // render page
        document.title = router.route.title;
        await topics.render(router.page === Pages.home ? Pages.cards : router.page);
        breadcrumb.render(router.getLinks(), router.renderEvent);
        subject.renderSubject(elements.subject, route.subject);
        elements.content.innerHTML = '';

        // render content
        if (content) {
            const renderIndex = route.render;
            if (typeof renderIndex === 'number' && renderIndex >= 0 && renderIndex < this.renders.length) {
                const callback: CallbackRenderContent = this.renders[renderIndex];
                await callback(elements.content);
            }
        }
    }
    renderExercise(router: RouterInterface, obj: ExerciseInfoModel): void {
        this.reset();
        const {id, name, category} = obj;
        this.isActive = false;

        topics.focusLinkById(id);
        breadcrumb.render(router.getLinks(), router.renderEvent, category);
        subject.renderSubject(elements.subject, name, obj);
        elements.content.innerHTML = '';
    }
    play(isActive: boolean) {
        notify.clear();
        elements.pageheader.style.display = isActive ? 'none' : '';
        elements.menu.style.display = isActive ? 'none' : '';
        elements.topics.style.display = isActive ? 'none' : '';

        if (isActive) {
            elements.content.style.display = '';
        }
        this.isActive = isActive;
    }
    private reset() {
        elements.pageheader.removeAttribute('style');
        elements.menu.removeAttribute('style');
        elements.topics.removeAttribute('style');
        elements.article.removeAttribute('style');
        elements.control.innerHTML = '';
        elements.content.innerHTML = '';
        elements.content.removeAttribute('style');
        elements.messages.innerHTML = '';
        elements.bottom.innerHTML = '';
        this.isActive = false;
    }
    /*
    async renderContent(callback: CallbackRenderContent) {
        callback(Page.elements['content']);
    }
    async renderContent(callback: (...args: any[]) => any, args?: object) {
        await callback(Page.elements['content'], args);
    }
    */
}

function getDomElements(): Elements {
    const rec: {[key in (typeof DOM_ELEMENTS)[number]]?: HTMLElement} = {};
    rec.pageheader = dom.getByTagName(C.DOM_PAGEHEADER_TAGNAME);
    rec.menu = dom.getByClassName(C.DOM_MENU_CLASSNAME);
    rec.topics = dom.getByTagName(C.DOM_TOPICS_PARENT_TAGNAME);
    rec.article = dom.getByTagName(C.DOM_ARTICLE_TAGNAME);
    rec.header = dom.getById(C.DOM_HEADER_ID);
    rec.control = dom.getById(C.DOM_CONTROL_ID);
    rec.content = dom.getById(C.DOM_CONTENT_ID);
    rec.messages = dom.getById(C.DOM_MESSAGES_ID);
    rec.bottom = dom.getById(C.DOM_BOTTOM_ID);
    rec.cdate = dom.getById(C.DOM_CDATE_ID);
    rec.cdate.textContent = `${new Date().getFullYear()}`;

    const row1 = dom.element('div', rec.header, 'row');
    const row2 = dom.element('div', rec.header, 'row');

    dom.element('hr', rec.header);
    rec.breadcrumb = dom.element(C.DOM_BREADCRUMB_TAGNAME, row1, C.DOM_BREADCRUMB_CLASSNAME);
    rec.subject = dom.element('div', row2, C.DOM_SUBJECT_CLASSNAME);
    rec.notify1 = dom.element('div', row1, C.DOM_NOTIFY_CLASSNAME);
    rec.notify2 = dom.element('div', row2, C.DOM_NOTIFY_CLASSNAME);
    // todo: type check: are all elements ?
    return rec as Elements;
}

// RENDERS

async function renderHome(parent: HTMLElement) {
    await debugContent(parent);
}

async function renderDefault(parent: HTMLElement) {
    await debugContent(parent);

    // todo: development
    // notify.btn('error', 'toDo', func);
}

async function debugContent(parent: HTMLElement) {
    parent.innerHTML = C.DEBUG_CONTENT;
}
