import {breadcrumb, notify, router} from '../../main.js';
import {subject} from '../components/subject.js';
import * as C from '../constants.js';
import {ExerciseInfoModel} from '../types/models.js';
import dom from '../utils/dom.js';

export class Page {
    static elements: {[key: string]: HTMLElement} = {};
    private active: boolean = false;
    constructor() {
        Page.init();
        // this.elements = Page.elements;
    }
    static init() {
        // toDo: way to skip ! ?
        this.elements['pageheader'] = document.getElementsByTagName(C.DOM_PAGEHEADER_TAGNAME)[0] as HTMLElement;
        this.elements['menu'] = document.getElementsByClassName(C.DOM_MENU_CLASSNAME)[0] as HTMLElement;
        this.elements['topics'] = document.getElementsByTagName(C.DOM_TOPICS_PARENT_TAGNAME)[0];
        this.elements['article'] = document.getElementsByTagName(C.DOM_ARTICLE_TAGNAME)[0];
        this.elements['header'] = document.getElementById(C.DOM_HEADER_ID)!;
        // todo: error in register
        this.elements['control'] = document.getElementById(C.DOM_CONTROL_ID)!;
        this.elements['content'] = document.getElementById(C.DOM_CONTENT_ID)!;
        this.elements['messages'] = document.getElementById(C.DOM_MESSAGES_ID)!;
        this.elements['bottom'] = document.getElementById(C.DOM_BOTTOM_ID)!;
        this.elements['cdate'] = document.getElementById(C.DOM_CDATE_ID)!;
        this.elements['cdate'].textContent = `${new Date().getFullYear()}`;

        const row1 = dom.element('div', this.elements['header'], 'row');
        const row2 = dom.element('div', this.elements['header'], 'row');

        dom.element('hr', this.elements['header']);
        this.elements['breadcrumb'] = dom.element(C.DOM_BREADCRUMB_TAGNAME, row1, C.DOM_BREADCRUMB_CLASSNAME);
        this.elements['subject'] = dom.element('div', row2, C.DOM_SUBJECT_CLASSNAME);
        this.elements['notify1'] = dom.element('div', row1, C.DOM_NOTIFY_CLASSNAME);
        this.elements['notify2'] = dom.element('div', row2, C.DOM_NOTIFY_CLASSNAME);
    }
    static reset() {
        notify.clear();
        this.elements['pageheader'].removeAttribute('style');
        this.elements['menu'].removeAttribute('style');
        this.elements['topics'].removeAttribute('style');
        this.elements['article'].removeAttribute('style');
        this.elements['control'].innerHTML = '';
        this.elements['content'].innerHTML = '';
        this.elements['content'].removeAttribute('style');
        this.elements['messages'].innerHTML = '';
        this.elements['bottom'].innerHTML = '';
    }
    blank(obj?: ExerciseInfoModel): void {
        const {name, category} = obj || {};
        Page.reset();
        breadcrumb.render(router.getLinks());
        breadcrumb.addTopic(category);
        subject.renderSubject(Page.elements['subject'], name || router.route.subject, obj);
    }
    play(flag: boolean) {
        notify.clear();
        Page.elements['pageheader']!.style.display = flag ? 'none' : '';
        Page.elements['menu']!.style.display = flag ? 'none' : '';
        Page.elements['topics']!.style.display = flag ? 'none' : '';

        if (flag) {
            Page.elements['content']!.style.display = '';
        }
        this.active = flag;
    }
    async renderContent(callback: Function, args?: object) {
        await callback(Page.elements['content'], args);
    }
}
