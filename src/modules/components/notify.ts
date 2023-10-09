import {Page} from '../routes/page.js';
import dom from '../utils/dom.js';
import objects from '../utils/objects.js';

/**  examples:

 parent
    notify-box
        msg-box
            item
        alert-box
            item

 <div class="notify-box">
     <div class="msg-box">
         <svg class="item" width="22" height="22" role="img">
            <use href="#error"></use>
         </svg>
         <small class="item">Error: </small>
         <small class="item">This is an error!</small>
     </div>
 </div>

 class Msg {
        render(status, text, options)
 }

 * Notify.defaultInit()
     * msg
         notify.msg("error", "Tish is an error!")
         notify.msg("error", "Tish is an error!", {prefix: ""})
         notify.with("msg").render("error", "This is an error!");
         notify.with("msg").options.prefix = "";                    // change default options
     * alert
        notify.alert("error", "Error message!")
     * btn
        notify.btn("info", "Click Me!", clickMe, {hideSvg: true});

 * custom
     * myMsg
         const myMsg = notify.addCustomMethod("myMsg", parent, "msg", notify.renders.TEXT)
         myMsg("error", "Error message!")
     * MyBtn
         const myBtn = notify.addCustomMethod("MyBtn", parent, "msg", notify.renders.BUTTON, {
               button: {label: "Click Me!", func: clickMe, svg: {id: "plus", width: 22, height: 22, color: "green", className: "append-me"}}
         });
        const myBtn = notify.addCustomMethod("MyBtn", parent, "msg", notify.renders.BUTTON, {
               button: {label: "Click Me!", func: clickMe}  // default svg byStatus
         });
         myBtn()
         myBtn(newLabel)
         notify.myBtn()
         notify.with("myBtn").render("error", "errorLabel", {hideSvg: true})
 */
enum Status {
    info = 'info',
    error = 'error',
    success = 'success',
}
enum Prefix {
    info = 'Info: ',
    error = 'Error: ',
    success = 'Success: ',
}
enum Size {
    small = 20,
    normal = 22,
    large = 24,
}
enum Type {
    msg = 'msg',
    alert = 'alert',
}
/**
 *  index.html
 *  <svg>
 *    <symbol id='info' ...>
 *    ....
 */
enum SVG_LIBRARY {
    info = 'info',
    success = 'success',
    error = 'error',
    info_fill = 'info-fill',
    success_fill = 'success-fill',
    error_fill = 'error_fill',
    edit = 'edit',
    plus = 'plus',
    close_button = 'close_button',
}
type OptionsSvg = {
    width: number;
    height: number;
    hideSvg?: boolean;
    byStatus: {[key in Status]: {id: keyof typeof SVG_LIBRARY}};
};
type OptionsMsg = {
    className: string;
    classNameItem: string;
    classNameTitle?: string;
    capacity: number;
    timer: number;
    ticker?: number;
    close?: number;
};
type OptionsButton = {
    capacity: number;
    button: {label: string; func?: Function; svg?: OptionsSvg};
};
type Options = {
    box: {className: string};
    msg: OptionsMsg;
    alert: OptionsMsg;
    button: OptionsButton;
    svg: {svg: OptionsSvg};
    svg_fill: {svg: OptionsSvg};
};
type CustomOptions = Record<string, any>;

const SVG_OPTIONS: OptionsSvg = {
    width: Size.normal,
    height: Size.normal,
    byStatus: {info: {id: 'info'}, success: {id: 'success'}, error: {id: 'error'}},
};
const SVG_OPTIONS_FILL: OptionsSvg = {
    width: Size.normal,
    height: Size.normal,
    byStatus: {info: {id: 'info_fill'}, success: {id: 'success_fill'}, error: {id: 'error_fill'}},
};
const OPTIONS: Options = {
    box: {className: 'notify-box'},
    // type: {msg: 'msg', alert: 'alert'},
    msg: {className: 'msg-box', classNameItem: 'item', classNameTitle: 'msg-title', capacity: 0, timer: 0},
    alert: {className: 'alert-box', classNameItem: 'item', capacity: 2, timer: 10000, ticker: 1, close: 1},
    button: {capacity: 1, button: {label: 'clickMe', svg: SVG_OPTIONS}},
    svg: {svg: SVG_OPTIONS},
    svg_fill: {svg: SVG_OPTIONS_FILL},
};

type Render = {
    callback: Function;
    options?: {svg: OptionsSvg} | OptionsButton;
};
type Renders = {
    SYMBOL: Render;
    TITLE: Render;
    TEXT: Render;
    BUTTON: Render;
    ALERT: Render;
};
const Renders: Renders = {
    // msg
    SYMBOL: {
        callback: msg_symbol_prefix_text,
        options: OPTIONS.svg,
    },
    TITLE: {
        callback: msg_title_text,
    },
    TEXT: {
        callback: msg_text,
    },
    BUTTON: {
        callback: msg_button,
        options: OPTIONS.button,
    },
    // alert
    ALERT: {
        callback: alert_text,
        options: OPTIONS.svg_fill,
    },
};

type StorageItem = {parent: HTMLElement | string; instance: Msg};

class Notify {
    private static storage: {[key: string]: StorageItem} = {};
    public renders: Renders;

    constructor() {
        Notify.defaultInit();
        this.renders = Renders;
    }
    /**
     * @param {string} name
     * @param {HTMLElement | string} parent     - parent of "notify-box" (id or element)
     * @param {Status | undefined} status       - status or null for all statuses
     * @param {Type} type                       - "msg" ot "alert"
     * @param {Render} render                   - {callback, options}
     * @param {CustomOptions} options?         - options (Optional)
     * @returns {Function} Notify.method        - f(text, options) | f(status, text, options)

     *   options structure
     *   {..opt, svg:{..opt}, button:{..opt, svg:{..opt}}}
     *   add/replace
     *   Msg <- Default[Type] <- render.options <- custom options ({..opt} || {.. svg:{..opt}})
     */
    addCustomMethod(name: string, parent: HTMLElement | string, type: string, render: Render, options?: CustomOptions): Function {
        // @ts-ignore
        Notify.storage[name] = {parent};
        // notify-box element
        const box = Notify.getBox(name);
        // render instance
        const msg = new Msg(name, box, Type[type as keyof typeof Type], render, options);
        // save to storage
        Notify.storage[name] = {parent, instance: msg};
        // notify method with dynamic name 'name'
        (Notify.prototype as any)[name] = (status: string, text: string, options?: CustomOptions) => msg.render(status, text, options);

        // Return the dynamic method
        return (Notify.prototype as any)[name];
    }
    with(name: string) {
        return Notify.storage[name].instance;
    }
    clear() {
        Object.values(Notify.storage).forEach((msg) => msg.instance.clear());
    }
    msg(status: string, text: string, options?: CustomOptions) {
        Notify.storage['msg'].instance.render(status, text, options);
    }
    alert(status: string, text: string, options?: CustomOptions) {
        Notify.storage['alert'].instance.render(status, text, options);
    }
    btn(status: string, label: string, func: Function, options?: CustomOptions) {
        // todo: test
        // const myOptions = objects.assign({}, OPTIONS.button, {button: {svg: {byStatus: null}}}, options || {}, {button: {func}});
        const myOptions = objects.assign({}, {button: {func}}, options || {});
        Notify.storage['btn'].instance.render(status, label, myOptions);
    }
    static remove(name: string) {
        if (typeof Notify.storage[name] === 'object') {
            Notify.storage[name].instance.clear();
            delete Notify.storage[name];
        }
    }
    static getBox(name: string): HTMLElement {
        const parent = dom.get(Notify.storage[name].parent)!;
        const className = OPTIONS.box.className;
        return (parent.getElementsByClassName(className)[0] || dom.element('div', parent, className)) as HTMLElement;
    }
    /** notify.msg();  notify.alert();  notify.title()?;  notify.btn()  */
    static defaultInit() {
        let parent = Page.elements['article'];
        let box = Page.elements['messages'];
        box.classList.toggle(OPTIONS.box.className, true);

        const msg = new Msg('msg', box, Type.msg, Renders.SYMBOL);
        Notify.storage['msg'] = {parent, instance: msg};

        parent = Page.elements['header'].firstChild as HTMLElement;
        box = Page.elements['notify1'];

        const alert = new Msg('alert', box, Type.alert, Renders.ALERT);
        Notify.storage['alert'] = {parent, instance: alert};

        parent = parent.nextSibling as HTMLElement;
        box = Page.elements['notify2'];

        const btn = new Msg('btn', box, Type.msg, Renders.BUTTON);
        Notify.storage['btn'] = {parent, instance: btn};
    }
}

class Msg {
    private storage: any[];
    private name: any;
    private parent: HTMLElement | null;
    private callback: Function;
    private options: CustomOptions;
    private timeout: number;
    private ticker: any;
    constructor(name: string, parent: HTMLElement, type: Type, render: Render, options?: CustomOptions) {
        this.storage = [];
        this.name = name;
        this.parent = dom.get(parent);
        this.callback = render.callback;
        this.options = objects.assign({}, OPTIONS[type], render.options || {}, options || {});
        this.timeout = 1;
    }
    render(status: string, text: string, options?: CustomOptions) {
        /** options: {merge} <- 1.DEFAULT <- 2.TEMPLATES <- 3.RENDER(args) */
        const myOptions = objects.assign({}, this.options, options || {});
        // parent
        if (!document.body.contains(this.parent)) {
            this.parent = Notify.getBox(this.name);
        }
        // storage
        if (myOptions['capacity'] > 0 && this.storage.length >= myOptions['capacity']) {
            dom.remove(this.storage.shift());
        }
        // set ticker
        if (myOptions['timer'] > 0) {
            this.timeout = myOptions['timer'] / 1000;
            this.ticker = this.ticker || setInterval(this.tick.bind(this), 1000);
        }
        // render
        const box = this.callback(this.parent, status, text, myOptions);
        // add close button
        if (myOptions['close']) {
            const btn = dom.svgUse(dom.element('span', box, 'btn-close'), '#close_button', '', '24', '24', 'button');
            btn.addEventListener('click', this.clear.bind(this));
        }
        // add to storage
        this.storage.push(box);
    }
    tick() {
        if (--this.timeout < 1) {
            this.clear();
        }
        if (this.options['ticker']) {
            this.update();
        }
    }
    update() {
        this.storage.forEach((e) => {
            (e.getElementsByClassName('ticker')[0] || dom.element('small', e, 'ticker')).textContent = this.timeout;
        });
    }
    clear() {
        const count = this.storage.length;
        for (let i = 0; i < count; i++) {
            dom.remove(this.storage.shift());
        }
        if (this.ticker) {
            clearInterval(this.ticker);
            this.ticker = null;
        }
    }
}

// TEMPLATES (renders)
// const msg_symbol_prefix_text: Render = (parent, status, text, options) => {}
// interface Render {
//     (parent: HTMLElement, status: string, text: string | TextWithTitle, options: Record<string, any>): HTMLElement;
// }

type TextWithTitle = {
    title: string;
    data: string[];
};

/**
 *  <section id="messages" class="notify-box">
 *    <div class="msg-box">
 *      <svg width="22" height="22" role="img"><use href="#error"></use></svg>
 *      <small><strong>Prefix: </strong></small>
 *      <small>This is an error!</small>
 */

function msg_symbol_prefix_text(parent: HTMLElement, status: string, text: string, options: CustomOptions): HTMLElement {
    let {prefix, classNameItem} = options;
    if (typeof prefix !== 'string') {
        prefix = Prefix[status as keyof typeof Prefix];
    }
    const box = msg_box(parent, null, options);
    svg_element(box, status, options);
    const small = dom.element('small', box, classNameItem);
    if (prefix) {
        dom.text('strong', small, prefix);
    }
    if (typeof text === 'string') {
        dom.text('small', box, text, classNameItem);
    }
    return box;
}

function msg_title_text(parent: HTMLElement, status: string, text: TextWithTitle, options: CustomOptions): HTMLElement {
    const {title, data} = text || {};
    const box = msg_box(parent, null, options);
    const div = dom.element('div', box, options['classNameTitle']);
    dom.node(title, dom.element('p', div));
    const ul = dom.element('ul', div);
    for (const line of data) {
        dom.node(line, dom.element('li', ul));
    }
    return box;
}

/**
 *  <section id="messages" class="notify-box">
 *    <div class="msg-box">
 *      <small></small>
 *      <small>This is an error!</small></div>
 */

function msg_text(parent: HTMLElement, status: string, text: string, options: CustomOptions): HTMLElement {
    const box = msg_box(parent, null, options);
    dom.text(options['tag'] || 'strong', box, text, options['classNameItem']);
    return box;
}

/**
 * <div class="notify-box">
 *   <div class="msg-box" role="button">
 *     <span>
 *       <strong>Click Me!</strong>
 */

function msg_button(parent: HTMLElement, status: string, text: string, options: CustomOptions): HTMLElement {
    const {svg, tag, label, func} = options['button'];
    const box = msg_box(parent, null, options);
    dom.setOptions(box, {role: 'button'});
    if (svg) {
        svg_element(box, status, options);
    }
    const span = dom.element('span', box, options['classNameItem']);
    dom.text(tag || 'strong', span, (text as string) || label);
    box.addEventListener('click', func);
    return box;
}

/**
 *  <div class="notify-box">
 *    <div class="msg-box error">
 *      <svg width="22" height="22" role="img"><use href="#error-fill">
 *        <span>This part of the static version is under construction.
 *
 */
function alert_text(parent: HTMLElement, status: string, text: string, options: CustomOptions): HTMLElement {
    const box = msg_box(parent, status, options);
    svg_element(box, status, options);
    dom.text(options['tag'] || 'span', box, text as string, options['classNameItem']);
    return box;
}

// TEMPLATES (helpers)
const msg_box = (parent: HTMLElement, status: string | null, options: CustomOptions): HTMLElement => {
    return dom.element('div', parent, options['className'] + (status ? ' ' + status : ''));
};

function svg_element(parent: HTMLElement, status: string, options: CustomOptions): SVGSVGElement | undefined {
    const {hideSvg, classNameItem} = options;
    if (hideSvg) {
        return;
    }
    const opt = objects.assign({}, options['svg'] || options['button'].svg);
    if (opt['byStatus']) {
        const tmp = objects.assign({}, opt);
        objects.assign(opt, opt['byStatus'][status], tmp);
    }
    const {id, width, height, color, className} = opt;
    if (!id) {
        return;
    }
    const svg = dom.svgUse(parent, '#' + id, classNameItem, width, height);
    if (className) {
        svg.classList.toggle(className, true);
    }
    if (color) {
        svg.style.color = color;
    }
    return svg;
}
// box.innerHTML = `<svg class="${classNameItem}" width="24" height="24" role="img"><use href="#${svg}"/></svg>`;

export {Notify};
