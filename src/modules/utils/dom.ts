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
    getById(s: string): HTMLElement {
        const e = document.getElementById(s);
        if (e) {
            return e;
        }
        const msg = 'Not found dom element with id: ' + s;
        throw new Error(msg);
    },
    getByTagName(s: string): HTMLElement {
        const e = document.getElementsByTagName(s);
        if (e) {
            return e[0] as HTMLElement;
        }
        const msg = 'Not found dom element with TagName: ' + s;
        throw new Error(msg);
    },
    getByClassName(s: string): HTMLElement {
        const e = document.getElementsByClassName(s);
        if (e) {
            return e[0] as HTMLElement;
        }
        const msg = 'Not found dom element with ClassName: ' + s;
        throw new Error(msg);
    },
    /**
     * @param {HTMLElement} e       - element
     * @param {Opt} opt             - className or object with options (key, value).
     */
    setOptions(e: HTMLElement, opt: Opt): void {
        if (typeof opt === 'string') {
            e.setAttribute('class', opt);
            return;
        }

        if (typeof opt === 'object') {
            for (const [k, v] of Object.entries(opt)) {
                if (k === 'textContent') {
                    e.textContent = v;
                } else if (k === 'className') {
                    e.className = v;
                } else {
                    e.setAttribute(k, v);
                }
            }
        }
    },
    /**
     * @param {TagName} tag            - tagName
     * @param {HTMLElement} parent     - parent
     * @param {Opt} opt                - className or object with options (key, value).
     * @returns {HTMLElement}          - element
     */
    element<T extends TagName>(tag: T, parent: HTMLElement, opt?: Opt): HTMLElementTagNameMap[T] {
        //  | Element = document.body
        const e = document.createElement(tag);
        parent.appendChild(e);
        if (opt) {
            this.setOptions(e, opt);
        }
        return e;
    },
    /**
     * @param {string} text         - text
     * @param {HTMLElement} parent  - parent
     * @returns {Text}
     */
    node(text: string, parent: HTMLElement): Text {
        const node = document.createTextNode(text);
        parent.appendChild(node);
        return node;
    },
    /**
     * @param {TagName} tag         - tag name
     * @param {HTMLElement} parent  - parent
     * @param {string} text         - text
     * @param {Opt} opt             - className or object with options (key, value).
     * @returns {HTMLElement}
     */
    text(tag: TagName, parent: HTMLElement, text: string, opt?: Opt): HTMLElement {
        const e = this.element(tag, parent);
        e.textContent = text;
        if (opt) {
            this.setOptions(e, opt);
        }
        return e;
    },
    /**
     * @param {HTMLElement} p       - parent
     */
    removeAll(parent: HTMLElement): void {
        if (parent) {
            parent.innerHTML = '';
        }
    },
    /**
     * @param {HTMLElement} e       - element
     */
    remove(e?: HTMLElement): HTMLElement | undefined {
        return e ? (e.parentNode ? e.parentNode.removeChild(e) : undefined) : undefined;
    },
    /** Use svg from template in html
     *
     * @param {HTMLElement} parent  - parent
     * @param {string} href         - id of used svg
     * @param {string} className
     * @param {string} w            - width
     * @param {string} h            - height
     * @param {string} role         - img, button
     * @returns {SVGSVGElement}
     *
     *  or insert from file with:
     *  const options = {class: "info, src:"./assets/images/info.svg", alt: "info", width: 20, height: 20}
     *  dom.element("img", parent, options)
     *
     */
    svgUse(parent: HTMLElement, href: string, className: string, w: string, h: string, role: string = 'img'): SVGSVGElement {
        const NS = 'http://www.w3.org/2000/svg';
        const s = document.createElementNS(NS, 'svg');
        const u = document.createElementNS(NS, 'use');
        if (className) {
            s.setAttributeNS(null, 'class', className);
        }
        s.setAttributeNS(null, 'width', w);
        s.setAttributeNS(null, 'height', h || w);
        s.setAttributeNS(null, 'role', role);
        u.setAttributeNS(null, 'href', href);
        s.appendChild(u);
        parent.appendChild(s);
        return s;
    },
};

export default dom;
