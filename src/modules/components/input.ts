import {notify} from '../../main.js';
import {APP_KEYBOARD, MSG_INPUT, MSG_KEYBOARD} from '../constants.js';
import {ExerciseCardsModelAdapted} from '../types/models.js';
import {Counter, SimpleCounter} from '../utils/counters.js';
import dom from '../utils/dom.js';
import numbers from '../utils/numbers.js';
import {Component} from './components.js';
import {Stats} from './stats.js';

const UserInputStateKeys = ['done', 'error', 'success', 'repeat', 'examples'] as const;
type UserInputState = {
    [key in (typeof UserInputStateKeys)[number]]: boolean;
};

class UserInput extends Component<'div'> {
    public successCounter: Counter;
    public errorsCounter: Counter;

    public stats: Stats;
    private input: TextInput;

    private controller!: (input: UserInput) => void;
    private json!: ExerciseCardsModelAdapted;

    public state: UserInputState = {done: false, error: false, success: false, repeat: false, examples: false};
    private content: string = '';
    private word: string = '';
    private words: string[] = [];

    constructor(parent: Element) {
        super(parent, 'div', 'input');
        this.successCounter = SimpleCounter();
        this.errorsCounter = SimpleCounter();
        this.stats = new Stats();
        this.input = new TextInput(this);
    }
    render(jsonFile: ExerciseCardsModelAdapted, controller: (input: UserInput) => void) {
        super._reset(); // create this._element
        this.json = jsonFile;
        dom.removeAll(this._element);
        this.stats.render(this._element);
        this.input.render(this._element);
        this.reset();
        // Flashcards.onTextareaChange
        this.controller = controller;
    }
    read() {
        this.content = this.input.value;
        this.state.done = this.input.isDone();

        // save previous state
        if (!this.state.done) {
            this.state.error = !this.contained(this.content, this.word);
            this.state.success = this.compare(this.content, this.word);
        }

        this.update();
        if (this.state.done) {
            this.controller(this);
        }
    }
    next() {
        this.clear();
        this.words = this.json.data[this.json.state.row];
        this.word = this.words[this.json.state.card];
        this.input.setAssert(this.word);
        if (this.input.keyboard) {
            this.input.keyboard.renderKeys(this.word);
        }
    }
    repeat() {
        this.clear();
        this.state.repeat = true; // skip stats
        notify.msg('error', MSG_INPUT.again, {prefix: ''});
        this.input.textarea.placeholder = MSG_INPUT.again;
    }
    reset() {
        this.clear();
        this.successCounter.reset();
        this.errorsCounter.reset();
        this.stats.setStats(0, this.json.state.rows, 0, 0);
    }
    clear() {
        for (const key in this.state) {
            this.state[key as keyof typeof this.state] = false;
        }
        this.input.clear();
        notify.clear();
    }
    update() {
        if (this.state.done) {
            this.state.error = !this.state.success;

            if (this.state.repeat) {
                return;
            }

            // stats
            if (this.state.success) {
                this.stats.change('success', this.successCounter.next());
            } else {
                this.stats.change('error', this.errorsCounter.next());
            }

            // examples  todo:
            if (!this.state.examples) {
                // notify.title({title: "Custom information", data: ["line 1", "line 2", "line 3"]})
                if (Array.isArray(this.words.slice(-1)[0])) {
                    // this.state.examples = this.words.slice(-1)[0];
                    // notify.title({title: 'Examples', data: this.state.examples});
                }
            }
        }
        // update current state
        else {
            this.input.setStatus(this.state.success ? 'success' : this.state.error ? 'error' : '');

            if (this.state.success) {
                notify.clear();
                notify.msg('info', '', {prefix: 'Done.', timer: 3000});
            }
        }
    }
    /**
     * Show/Hide the input
     * @param {boolean} flag
     */
    visible(flag: boolean) {
        this._element.style.display = flag ? '' : 'none';
        if (flag) {
            this.input.focus();
        }
    }
    /**
     * @param {string} str1  "abc"
     * @param {string} str2  "abc"
     */
    compare(str1: string, str2: string) {
        return str1 === str2;
    }
    /**
     * str2 start with str1
     * @param {string} str1  "abc"
     * @param {string} str2  "abcdef"
     */
    contained(str1: string, str2: string) {
        return str1 === str2.slice(0, str1.length);
    }
    // remove() {
    //     super._remove();
    // }
}

type TextInputOptions = {
    form: {className: string; spellcheck: string; autocapitalize: string; autocomplete: string};
    textarea: {placeholder: string};
};

class TextInput {
    private static defaultOptions = {
        form: {className: 'form', spellcheck: 'false', autocapitalize: 'none', autocomplete: 'off'},
        textarea: {placeholder: MSG_INPUT.placeholder}, // disabled: true
    };
    private controller: UserInput;
    private options: TextInputOptions;
    private form!: HTMLElementTagNameMap['form'];
    public textarea!: HTMLElementTagNameMap['textarea'];
    public keyboard!: MyKeyboard;
    private status: string = '';
    public text: string = '';

    constructor(controller: UserInput) {
        // UserInput.read()
        this.controller = controller;
        this.options = Object.assign({}, TextInput.defaultOptions);
    }
    render(parent: Element, options = {}) {
        Object.assign(this.options, options);
        this.form = dom.element('form', parent, this.options.form);
        this.textarea = dom.element('textarea', this.form, this.options.textarea);
        this.textarea.addEventListener('input', this);
        this.keyboard = new MyKeyboard(this).render(parent, this.textarea);
        this.clear();
    }
    handleEvent() {
        /** read speed optimization - skip unnecessary calls */
        if (this.assert()) {
            return;
        }
        this.setStatus('');
        this.controller.read();
    }
    get value() {
        return this.textarea.value || '';
    }
    setStatus(className: string) {
        if (this.status !== className) {
            this.status = className || '';
            this.textarea.className = this.status + (APP_KEYBOARD.mode === KEYBOARD_MODE.OFF ? '' : ' active');
        }
    }
    clear() {
        this.status = '';
        this.textarea.value = '';
        this.textarea.placeholder = this.options.textarea.placeholder;
    }
    focus() {
        if (APP_KEYBOARD.mode === KEYBOARD_MODE.OFF) {
            this.textarea.focus();
        }
    }
    isDone() {
        return ['\n', '\r'].includes(this.value.slice(-1));
    }
    setAssert(text: string) {
        this.text = text;
    }
    // todo: ???
    assert() {
        if (this.text) {
            this.text = this.value.length < this.text.length ? this.text : '';
            return this.text && !this.status && this.text.startsWith(this.value);
        }
        return null;
    }
}

const KEYBOARDS = {
    german: {
        small: [
            'q',
            'w',
            'e',
            'r',
            't',
            'z',
            'u',
            'i',
            'o',
            'p',
            'ü',
            'ß',
            '<--',
            'a',
            's',
            'd',
            'f',
            'g',
            'h',
            'j',
            'k',
            'l',
            'ö',
            'ä',
            '#',
            'Enter',
            '_^',
            'y',
            'x',
            'c',
            'v',
            'b',
            'n',
            'm',
            ',',
            '.',
            '-',
            '!',
            '?',
        ],
        big: [
            'Q',
            'W',
            'E',
            'R',
            'T',
            'Z',
            'U',
            'I',
            'O',
            'P',
            'Ü',
            '~',
            '<--',
            'A',
            'S',
            'D',
            'F',
            'G',
            'H',
            'J',
            'K',
            'L',
            'Ö',
            'Ä',
            "'",
            'Enter',
            '_^',
            'Y',
            'X',
            'C',
            'V',
            'B',
            'N',
            'M',
            ';',
            ':',
            '_',
            '!',
            '?',
        ],
    },
};

enum KEYBOARD_MODE {
    OFF = 1,
    NORMAL = 2,
    KEYS = 4,
}

type KeyboardOptions = {
    keys: typeof KEYBOARDS.german;
    className: string;
    classNameItem: string;
    classNameLong: string;
    classNameOther: string;
    buttons: {Enter: string; '<--': string; __: string; '_^': string};
};

/** todo: caret ? */
class MyKeyboard {
    private static defaultOptions: KeyboardOptions = {
        keys: KEYBOARDS.german,
        className: 'keyboard',
        classNameItem: 'item',
        classNameLong: 'item-long',
        classNameOther: 'other',
        buttons: {Enter: '\n', '<--': 'del', __: ' ', '_^': 'shift'},
    };
    private static instance: MyKeyboard;

    public options: KeyboardOptions;
    private controller: TextInput;
    private textarea!: HTMLTextAreaElement;
    private modeButton?: HTMLSpanElement;
    private keyboard!: HTMLDivElement;
    private isBig: boolean = false;

    constructor(controller: TextInput) {
        MyKeyboard.instance = this;
        // TextInput.handleEvent()
        this.controller = controller;
        this.options = Object.assign({}, MyKeyboard.defaultOptions);
    }
    render(parent: Element, textarea: HTMLTextAreaElement, options?: KeyboardOptions) {
        Object.assign(this.options, options);

        this.textarea = textarea || this.textarea;
        this.modeButton = dom.element('span', parent, {id: 'keyboard', role: 'button', className: 'right'});
        this.modeButton.addEventListener('click', this.changeMode);
        this.keyboard = dom.element('div', parent, this.options.className);
        this.keyboard.addEventListener('click', this);
        this.setMode(APP_KEYBOARD.mode);
        return this;
    }
    renderKeyboard(isBig: boolean) {
        if (APP_KEYBOARD.mode !== KEYBOARD_MODE.NORMAL) {
            return;
        }
        this.clear();

        let div: Element,
            c = 0;
        const keys = isBig ? this.options.keys.big : this.options.keys.small;
        keys.forEach((k) => {
            if (c === 0 || c % 13 === 0) {
                div = dom.element('div', this.keyboard);
            }
            dom.element('button', div, {
                index: c,
                textContent: k,
                value: k.length === 1 ? k : this.options.buttons[k as keyof typeof this.options.buttons],
                type: 'button',
                role: 'button',
                className: this.options.classNameItem,
            });
            c++;
        });
        div = dom.element('div', this.keyboard, this.options.classNameOther);
        dom.element('button', div, {textContent: ' ', value: ' ', type: 'button', role: 'button', className: this.options.classNameItem});
    }
    renderKeys(str: string) {
        if (APP_KEYBOARD.mode !== KEYBOARD_MODE.KEYS) {
            return;
        }
        this.clear();
        const div = dom.element('div', this.keyboard);
        const chars = this.options.keys;
        const len = chars.small.length;
        const keys: Record<string, number> = {};
        for (const letter of str.split('')) {
            let index = chars.small.indexOf(letter);
            index = index > -1 ? index : chars.big.indexOf(letter);
            index = index > -1 ? index : len;
            keys[letter] = index;
        }

        // add random buttons if "keyboard size" > keys.length
        // todo: ??? 17
        const left = APP_KEYBOARD.size - Object.keys(keys).length;
        for (let c = 0; c < left; ) {
            const i = numbers.getRandomInt(0, len);
            const k = chars.small[i];
            if (!keys[k]) {
                keys[k] = i;
                c++;
            }
        }

        keys['<--'] = len + 2;
        keys['Enter'] = len + 3;

        const sorted = Object.entries(keys)
            .sort((a, b) => a[1] - b[1])
            .map((v) => v[0]);
        sorted.forEach((k) => {
            dom.element('button', div, {
                textContent: k,
                value: k.length === 1 ? k : this.options.buttons[k as keyof typeof this.options.buttons],
                type: 'button',
                role: 'button',
                className: this.options.classNameItem,
            });
        });
    }
    handleEvent(e: Event) {
        const target = e.target as HTMLButtonElement;
        if (e && target.value) {
            // e.target.tagName === "BUTTON"
            const value = target.value;
            if (value.length > 2) {
                if (value === 'del') {
                    this.textarea.value = this.textarea.value.slice(0, -1);
                } else {
                    this.isBig = !this.isBig;
                    this.renderKeyboard(this.isBig);
                    return;
                }
            } else {
                this.textarea.value += value;
            }
            this.controller.handleEvent();
        }
    }
    /**
     * @param {string|null} str - if null, update current;
     */
    setMode(mode: KEYBOARD_MODE) {
        const bnt = MyKeyboard.instance.modeButton!;
        APP_KEYBOARD.mode = mode;
        MyKeyboard.instance.textarea.classList.toggle('active', mode !== KEYBOARD_MODE.OFF);
        if (mode === KEYBOARD_MODE.OFF) {
            MyKeyboard.instance.clear();
            bnt.textContent = MSG_KEYBOARD.OFF;
        } else if (mode === KEYBOARD_MODE.NORMAL) {
            MyKeyboard.instance.renderKeyboard(true);
            bnt.textContent = MSG_KEYBOARD.NORMAL;
        } else if (mode === KEYBOARD_MODE.KEYS) {
            MyKeyboard.instance.renderKeys(MyKeyboard.instance.controller.text);
            bnt.textContent = MSG_KEYBOARD.KEYS;
        }
    }
    changeMode(this: HTMLSpanElement) {
        const current = APP_KEYBOARD.mode;
        MyKeyboard.instance.setMode(
            current === KEYBOARD_MODE.OFF
                ? KEYBOARD_MODE.NORMAL
                : current === KEYBOARD_MODE.NORMAL
                ? KEYBOARD_MODE.KEYS
                : KEYBOARD_MODE.OFF,
        );
    }
    clear() {
        this.keyboard.innerHTML = '';
    }
}

export {UserInput};
