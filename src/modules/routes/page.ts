import {breadcrumb, notify, topics} from '../app.js';
import {subject} from '../components/subject.js';
import {
    DEBUG_CONTENT,
    DOM_ARTICLE_TAGNAME,
    DOM_BOTTOM_ID,
    DOM_BREADCRUMB_CLASSNAME,
    DOM_BREADCRUMB_TAGNAME,
    DOM_CDATE_ID,
    DOM_CONTENT_ID,
    DOM_CONTROL_ID,
    DOM_HEADER_ID,
    DOM_MENU_CLASSNAME,
    DOM_MESSAGES_ID,
    DOM_NOTIFY_CLASSNAME,
    DOM_PAGEHEADER_TAGNAME,
    DOM_SUBJECT_CLASSNAME,
    DOM_TOPICS_PARENT_TAGNAME,
} from '../constants.js';
import {ExerciseInfoModel} from '../types/models.js';
import {CallbackRenderContent} from '../types/utils.js';
import {dom} from '../utils/dom.js';
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

const PAGE_ELEMENTS: Elements = getDomElements();

export class Page {
    private readonly renders: CallbackRenderContent[] = [renderDefault, renderHome];
    public isActive: boolean = false;
    public elements: Elements;

    constructor() {
        this.elements = PAGE_ELEMENTS;
    }
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
        subject.renderSubject(PAGE_ELEMENTS.subject, route.subject);
        PAGE_ELEMENTS.content.innerHTML = '';

        // render content
        if (content) {
            const renderIndex = route.render;
            if (typeof renderIndex === 'number' && renderIndex >= 0 && renderIndex < this.renders.length) {
                const callback: CallbackRenderContent = this.renders[renderIndex];
                await callback(PAGE_ELEMENTS.content);
            }
        }
    }
    renderExercise(router: RouterInterface, obj: ExerciseInfoModel): void {
        this.reset();
        const {id, name, category} = obj;
        this.isActive = false;

        topics.focusLinkById(id);
        breadcrumb.render(router.getLinks(), router.renderEvent, category);
        subject.renderSubject(PAGE_ELEMENTS.subject, name, obj);
        PAGE_ELEMENTS.content.innerHTML = '';
    }
    play(isActive: boolean) {
        notify.clear();
        PAGE_ELEMENTS.pageheader.style.display = isActive ? 'none' : '';
        PAGE_ELEMENTS.menu.style.display = isActive ? 'none' : '';
        PAGE_ELEMENTS.topics.style.display = isActive ? 'none' : '';

        if (isActive) {
            PAGE_ELEMENTS.content.style.display = '';
        }
        this.isActive = isActive;
    }
    private reset() {
        PAGE_ELEMENTS.pageheader.removeAttribute('style');
        PAGE_ELEMENTS.menu.removeAttribute('style');
        PAGE_ELEMENTS.topics.removeAttribute('style');
        PAGE_ELEMENTS.article.removeAttribute('style');
        PAGE_ELEMENTS.control.innerHTML = '';
        PAGE_ELEMENTS.content.innerHTML = '';
        PAGE_ELEMENTS.content.removeAttribute('style');
        PAGE_ELEMENTS.messages.innerHTML = '';
        PAGE_ELEMENTS.bottom.innerHTML = '';
        PAGE_ELEMENTS.notify2.innerHTML = '';
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
    rec.pageheader = dom.getByTagName(DOM_PAGEHEADER_TAGNAME);
    rec.menu = dom.getByClassName(DOM_MENU_CLASSNAME);
    rec.topics = dom.getByTagName(DOM_TOPICS_PARENT_TAGNAME);
    rec.article = dom.getByTagName(DOM_ARTICLE_TAGNAME);
    rec.header = dom.getById(DOM_HEADER_ID);
    rec.control = dom.getById(DOM_CONTROL_ID);
    rec.content = dom.getById(DOM_CONTENT_ID);
    rec.messages = dom.getById(DOM_MESSAGES_ID);
    rec.bottom = dom.getById(DOM_BOTTOM_ID);
    rec.cdate = dom.getById(DOM_CDATE_ID);
    rec.cdate.textContent = `${new Date().getFullYear()}`;

    const row1 = dom.element('div', rec.header, 'row');
    const row2 = dom.element('div', rec.header, 'row');

    dom.element('hr', rec.header);
    rec.breadcrumb = dom.element(DOM_BREADCRUMB_TAGNAME, row1, DOM_BREADCRUMB_CLASSNAME);
    rec.subject = dom.element('div', row2, DOM_SUBJECT_CLASSNAME);
    rec.notify1 = dom.element('div', row1, DOM_NOTIFY_CLASSNAME);
    rec.notify2 = dom.element('div', row2, DOM_NOTIFY_CLASSNAME);
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
    parent.innerHTML = DEBUG_CONTENT;
}
