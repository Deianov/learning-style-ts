import {TagName} from '../types/utils.js';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type Opt = string | Record<string, any>;

const dom = {
    /**
     * @param {string | HTMLElement} v   -  id | element
     * @returns {HTMLElement | null}
     */
    get(v: string | HTMLElement): HTMLElement | null {
        return typeof v === 'string' ? document.getElementById(v) : document.body.contains(v) ? v : null;
    },
    getOrCreateElement<T extends TagName>(parent: Element, tagName: T, className: string): HTMLElementTagNameMap[T] {
        const elements = parent.getElementsByClassName(className);
        const element = elements.length > 0 ? elements[0] : null;

        if (element && tagName.localeCompare(element.tagName, 'en', {sensitivity: 'base'}) === 0) {
            return element as HTMLElementTagNameMap[T];
        } else {
            return this.element(tagName, parent);
        }
    },
    getById(id: string): HTMLElement {
        const element = document.getElementById(id);
        if (element) {
            return element;
        }
        const msg = 'Not found dom element with id: ' + id;
        throw new Error(msg);
    },
    getByTagName<T extends TagName>(tagName: T): HTMLElementTagNameMap[T] {
        const elements = document.getElementsByTagName(tagName);
        const element = elements.length > 0 ? elements[0] : null;

        if (element) {
            return element;
        }
        const msg = 'Not found dom element with TagName: ' + tagName;
        throw new Error(msg);
    },
    getByClassName(className: string): HTMLElement {
        const elements = document.getElementsByClassName(className);
        const element = elements.length > 0 ? elements[0] : null;

        if (element) {
            return element as HTMLElement;
        }
        const msg = 'Not found dom element with ClassName: ' + className;
        throw new Error(msg);
    },
    /**
     * @param {Opt} options  - className or object with options (key, value).
     */
    setOptions(element: Element, options: Opt): void {
        if (typeof options === 'string') {
            const className = options;
            element.setAttribute('class', className);
            return;
        }

        if (typeof options === 'object') {
            for (const [key, value] of Object.entries(options)) {
                if (key === 'textContent') {
                    element.textContent = value;
                } else if (key === 'className') {
                    element.className = value;
                } else {
                    element.setAttribute(key, value);
                }
            }
        }
    },
    /**
     * @param {Opt} options - className or object with options (key, value).
     */
    // todo: ElementCreationOptions ?
    element<T extends TagName>(tagName: T, parent: Element, options?: Opt): HTMLElementTagNameMap[T] {
        const element = document.createElement(tagName);
        parent.appendChild(element);
        if (options) {
            this.setOptions(element, options);
        }
        return element;
    },
    node(text: string, parent: HTMLElement): Text {
        const node = document.createTextNode(text);
        parent.appendChild(node);
        return node;
    },
    text(tagName: TagName, parent: HTMLElement, text: string, options?: Opt): HTMLElement {
        const element = this.element(tagName, parent);
        element.textContent = text;
        if (options) {
            this.setOptions(element, options);
        }
        return element;
    },
    removeAll(parent: HTMLElement): void {
        if (parent) {
            parent.innerHTML = '';
        }
    },
    remove(element?: Element): Element | undefined {
        if (element && element.parentNode) {
            return element.parentNode.removeChild(element);
        }
        return undefined;
    },
    /** Use svg from template in html
     *
     * @param {string} href         - id of used svg
     * @param {string} role         - 'img' || 'button'
     *
     *  or insert from file with:
     *  const options = {class: "info, src:"./assets/images/info.svg", alt: "info", width: 20, height: 20}
     *  dom.element("img", parent, options)
     */
    svgUse(parent: HTMLElement, href: string, className: string, width: string, height: string, role: string = 'img'): SVGSVGElement {
        const NS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(NS, 'svg');
        const use = document.createElementNS(NS, 'use');
        if (className) {
            svg.setAttributeNS(null, 'class', className);
        }
        svg.setAttributeNS(null, 'width', width);
        svg.setAttributeNS(null, 'height', height || width);
        svg.setAttributeNS(null, 'role', role);
        use.setAttributeNS(null, 'href', href);
        svg.appendChild(use);
        parent.appendChild(svg);
        return svg;
    },
};

export default dom;
