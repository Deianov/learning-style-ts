import {Link, Links} from '../types/components.js';
import {MouseEvents, TagName} from '../types/utils.js';
import {dom} from '../utils/dom.js';

class EventManager {
    private readonly eventType: MouseEvents;
    private readonly eventCallback: EventListener | EventListenerObject;

    constructor(type: MouseEvents, callback: EventListenerOrEventListenerObject) {
        this.eventType = type;
        this.eventCallback = callback;
    }
    addEventListener(element: Element): void {
        element.addEventListener(this.eventType, this.eventCallback);
    }
    removeEventListener(element: Element): void {
        element.removeEventListener(this.eventType, this.eventCallback);
    }
}

export class Component<T extends TagName> {
    private readonly tagName: T;
    private readonly classNameWrapper: string | undefined;
    private readonly className: string;
    private eventManager: EventManager | undefined;
    protected readonly _parent: Element;
    protected _wrapper: HTMLDivElement | undefined;
    protected _element: HTMLElementTagNameMap[T];

    constructor(parent: Element, tagName: T, className: string, classNameWrapper?: string) {
        this._parent = parent;
        this.tagName = tagName;
        this.className = className;
        this.classNameWrapper = classNameWrapper;
        this._wrapper = classNameWrapper ? dom.getOrCreateElement(parent, 'div', classNameWrapper) : undefined;
        this._element = dom.getOrCreateElement(this._wrapper || parent, tagName, className);
    }
    private updateElements(): void {
        this._wrapper = this.classNameWrapper ? dom.getOrCreateElement(this._parent, 'div', this.classNameWrapper) : undefined;
        this._element = dom.getOrCreateElement(this._wrapper || this._parent, this.tagName, this.className);
        this._element.classList.toggle(this.className, true);
    }
    _addEvent(type: MouseEvents, callback: EventListenerOrEventListenerObject): void {
        this.eventManager = new EventManager(type, callback);
    }
    _reset(): void {
        this.updateElements();
        this._element.innerHTML = '';
        this._element.classList.toggle(this.className, true);
        this._visible(true);
        this.eventManager?.addEventListener(this._element);
    }
    _remove(): void {
        this._element.innerHTML = '';
        this.eventManager?.removeEventListener(this._element);
    }
    _visible(isVisible: boolean): void {
        (this._wrapper || this._element).style.display = isVisible ? '' : 'none';
    }
}

/**
    <article>
      <header id="header">
        <div class="row">

    <ul class="breadcrumb">
        <li><a href="/page=0">Home</a></li>
        <li><a href="/page=1">Cards</a></li>
        <li><span>German</span></li>
    </ul>
*/
export class Breadcrumb extends Component<'ul'> {
    private static CLASSNAME = 'breadcrumb';
    private static CLASSNAME_WRAPPER = 'row';

    // header
    constructor(parent: Element) {
        super(parent, 'ul', Breadcrumb.CLASSNAME, Breadcrumb.CLASSNAME_WRAPPER);
    }
    render(links: Links, event: EventListener | EventListenerObject, current?: string): void {
        super._reset();
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
        if (link) {
            const li = dom.element('li', this._element);
            const a = dom.element('a', li, link);
            a.addEventListener('click', event);
        }
    }
    private renderText(name?: string) {
        if (name) {
            dom.element('span', dom.element('li', this._element), {textContent: name});
        }
    }
}

/* scroll
   <button class="go-top">
        <svg viewBox="0 0 16 16" width="16" height="16">
            <title>Go to top</title>
            <g stroke-width="1" stroke="currentColor">
                <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="15.5,11.5 8,4 0.5,11.5 "></polyline>
            </g>
        </svg>
    </button>
*/
export class GoTop {
    static instance: GoTop;
    private element: HTMLElement;
    private disabled: boolean;
    constructor() {
        GoTop.instance = this;
        this.disabled = false;
        this.element = dom.element('button', dom.getByTagName('main'), 'go-top');
        dom.svgUse(this.element, '#go_top', '', '30', '30', 'img');
        this.visible(false);
        this.element.addEventListener('click', scrollTop);
        window.onscroll = scrollEvent;
    }
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

/*
    <div class="tags">
        <span class="heading">Topics</span>
        <div class="tag">
            <a href="#">This</a>
        </div>
        <div class="tag">
            <a href="#">is</a>
        </div>
        ...
    </div>
*/
export class Tags extends Component<'div'> {
    private static DOM_TAGS_CLASSNAME = 'tags';
    private static DOM_TAGS_ITEM_CLASSNAME = 'tag';
    private static DOM_TAGS_HEADER_CLASSNAME = 'heading';
    // bottom
    constructor(parent: HTMLElement) {
        super(parent, 'div', Tags.DOM_TAGS_CLASSNAME);
    }
    render() {
        super._reset();
        const tmp: {text: string; tags: Links} = {
            text: 'Topics',
            tags: [
                {href: '#', textContent: 'this'},
                {href: '#', textContent: 'is'},
                {href: '#', textContent: 'under'},
                {href: '#', textContent: 'construction'},
            ],
        };
        dom.text('span', this._element, tmp.text, Tags.DOM_TAGS_HEADER_CLASSNAME);
        for (const tag of tmp.tags) {
            dom.element('a', dom.element('div', this._element, Tags.DOM_TAGS_ITEM_CLASSNAME), tag);
        }
    }
}
