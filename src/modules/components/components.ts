import {DOM_BOTTOM_ID, DOM_BREADCRUMB_CLASSNAME, DOM_BREADCRUMB_TAGNAME, DOM_HEADER_ID} from '../constants.js';
import {Link, Links} from '../types/components.js';
import {MouseEvents, TagName} from '../types/utils.js';
import dom from '../utils/dom.js';

class MyEvent {
    private eventChildIndex: number;
    private eventElement: HTMLElement | undefined;
    private eventType: MouseEvents = 'click';
    private eventCallback: EventListener | EventListenerObject | undefined;
    private eventWaiting: boolean = false;
    constructor() {
        this.eventChildIndex = -1;
    }
    setEventElement(e: HTMLElement) {
        this.eventElement =
            e instanceof HTMLElement ? (this.eventChildIndex === -1 ? e : (e.children[this.eventChildIndex] as HTMLElement)) : undefined;
    }
    setEventWaiting(v: boolean) {
        this.eventWaiting = v;
    }
    setEventByElement(e: HTMLElement, type: MouseEvents, callback: EventListenerOrEventListenerObject, index?: number) {
        this.eventChildIndex = typeof index === 'number' ? index : -1;
        this.setEventElement(e);
        this.eventType = type;
        this.eventCallback = callback;
        this.eventWaiting = true;
        this.updateEvent();
    }
    resetEvent() {
        if (this.eventElement && this.eventCallback) {
            this.eventElement.removeEventListener(this.eventType, this.eventCallback);
        }
        this.eventElement = undefined;
        this.eventWaiting = true;
    }
    updateEvent() {
        if (this.eventElement instanceof HTMLElement && this.eventWaiting && this.eventCallback) {
            this.eventElement.addEventListener(this.eventType, this.eventCallback);
            this.eventWaiting = false;
            // console.log("Update event:" + this.className);
        }
    }
}

class Component extends MyEvent {
    private _parent: HTMLElement;
    private _wrapper: HTMLElement | undefined;
    protected _element: HTMLElement | undefined;
    private classNameWrapper: string | undefined;
    private tagName: keyof HTMLElementTagNameMap;
    private className: string;
    private disabled: boolean = false;
    /**
     * @param {string | HTMLElement} parent Static HTMLElement (ID or Element)
     * @param {string | undefined} wrapper (Optional) className
     * @param {TagName} tagName (Element)
     * @param {string} className (Element)
     */
    constructor(parent: string | HTMLElement, wrapper: string | undefined, tagName: TagName = 'div', className: string) {
        super();
        // todo: !
        this._parent = dom.get(parent)!;
        // wrapper
        this.classNameWrapper = wrapper;
        // element
        this.tagName = tagName as keyof HTMLElementTagNameMap;
        this.className = className;
        if (!this._parent) {
            return;
        }
    }
    get parent() {
        return this._parent;
    }
    get wrapper() {
        if (this.classNameWrapper) {
            this._wrapper = this._parent.getElementsByClassName(this.classNameWrapper)[0] as HTMLElement;
        }

        return this._wrapper;
    }
    get element() {
        this._element = this._parent.getElementsByClassName(this.className)[0] as HTMLElement;
        return this._element;
    }
    /**
     * re-create wrapper if not exists.
     */
    updateWrapper(): void {
        if (!this.classNameWrapper) {
            return;
        }
        this._wrapper = this.wrapper || dom.element('div', this._parent, this.classNameWrapper);
    }
    /**
     * re-create element and/or wrapper if not exists.
     * update event
     */
    updateElement(): void {
        this._element = this.element;
        this.updateWrapper();
        if (!this._element) {
            this._element = dom.element(this.tagName, this._wrapper || this._parent, this.className);
            super.setEventWaiting(true);
        }
        this._element = this._element || dom.element(this.tagName, this._wrapper || this._parent, this.className);
    }
    reset(): void {
        this.updateElement();
        if (this._element) {
            this._element.innerHTML = '';
            this._element.classList.toggle(this.className, true);
            this.updateEvent();
        }
        // this.visible(true)
    }
    remove(): void {
        dom.remove(this._wrapper || this._element); // this.element ?
        this.resetEvent();
        this._element = undefined;
        this._wrapper = undefined;
    }
    visible(flag: boolean) {
        if (this.disabled || (!this._element && !this._wrapper)) {
            return;
        }
        const e = this._wrapper || this._element;
        if (e instanceof HTMLElement) {
            e.style.display = flag ? '' : 'none';
        }
    }
    /**
     * @param {MouseEvents} type
     * @param {EventListener | EventListenerObject} callback
     * @param {number} index (Optional) Set to child element by Index
     */
    setEvent(type: MouseEvents, callback: EventListenerOrEventListenerObject, index?: number): void {
        super.setEventByElement(this.element, type, callback, index);
    }
}

/**
 *  breadcrumb
 *
 *  <article>
      <header id="header">
        <div class="row">

    <ul class="breadcrumb">
        <li><a href="/page=0">Home</a></li>
        <li><a href="/page=1">Cards</a></li>
        <li><span>German</span></li>
    </ul>
*/
class Breadcrumb extends Component {
    constructor(parent = DOM_HEADER_ID) {
        super(parent, 'row', DOM_BREADCRUMB_TAGNAME, DOM_BREADCRUMB_CLASSNAME);
    }
    render(links: Links, event: EventListener | EventListenerObject, current?: string): void {
        super.reset();
        const length = links.length;
        for (let i = 0; i < length - 1; i++) {
            this.renderLink(links[i], event);
        }
        if (typeof current === 'string') {
            this.renderLink(links[length - 1], event);
            this.renderText(current);
        } else if (length > 0) {
            this.renderText(links[length - 1].textContent);
        }
    }
    private renderLink(link: Link, event: EventListener | EventListenerObject) {
        if (link && this._element) {
            const li = dom.element('li', this._element);
            const a = dom.element('a', li, link);
            a.addEventListener('click', event);
        }
    }
    private renderText(name?: string) {
        if (name && this._element) {
            dom.element('span', dom.element('li', this._element), {textContent: name});
        }
    }
}

/**
 * scroll
 */
/*
   <button class="go-top">
        <svg viewBox="0 0 16 16" width="16" height="16">
            <title>Go to top</title>
            <g stroke-width="1" stroke="currentColor">
                <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="15.5,11.5 8,4 0.5,11.5 "></polyline>
            </g>
        </svg>
    </button>
*/
class GoTop {
    static instance: GoTop;
    private element: HTMLElement;
    private disabled: boolean;
    constructor() {
        GoTop.instance = this;
        this.disabled = false;
        this.element = dom.element('button', document.getElementsByTagName('main')[0], 'go-top');
        dom.svgUse(this.element, '#go_top', '', '30', '30', 'img');
        this.visible(false);
        this.element.addEventListener('click', scrollTop);
        window.onscroll = scrollEvent;
    }
    // render() {
    //     this.element = dom.element('button', document.getElementsByTagName('main')[0], 'go-top');
    //     dom.svgUse(this.element, '#go-top', '', '30', '30', 'img');
    //     this.visible(false);
    //     this.element.addEventListener('click', scrollTop);
    //     window.onscroll = scrollEvent;
    // }
    visible(flag: boolean) {
        if (this.element && !this.disabled) {
            this.element.style.display = flag ? '' : 'none';
        }
    }
}
function scrollTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
function scrollEvent() {
    GoTop.instance.visible(document.body.scrollTop > 20 || document.documentElement.scrollTop > 20);
}

/**
 *  tags
 */
/*
    <div class="tags">
        <span class="heading">Topics</span>
        <div class="tag">
            <a href="#">German</a>
        </div>
        <div class="tag">
            <a href="#">Words</a>
        </div>
        ...
    </div>
*/
class Tags extends Component {
    private static DOM_TAGS_CLASSNAME = 'tags';
    private static DOM_TAGS_ITEM_CLASSNAME = 'tag';
    private static DOM_TAGS_HEADER_CLASSNAME = 'heading';
    constructor(parent = DOM_BOTTOM_ID) {
        super(parent, undefined, 'div', Tags.DOM_TAGS_CLASSNAME);
    }
    render() {
        const tmp: {text: string; tags: Links} = {
            text: 'Topics',
            tags: [
                {href: '#', textContent: 'this'},
                {href: '#', textContent: 'is'},
                {href: '#', textContent: 'under'},
                {href: '#', textContent: 'construction'},
            ],
        };
        super.reset();
        dom.text('span', this.element, tmp.text, Tags.DOM_TAGS_HEADER_CLASSNAME);
        for (const tag of tmp.tags) {
            dom.element('a', dom.element('div', this.element, Tags.DOM_TAGS_ITEM_CLASSNAME), tag);
        }
    }
}

export {Component, Breadcrumb, GoTop, Tags};
