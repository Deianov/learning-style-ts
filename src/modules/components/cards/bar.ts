import {ExerciseCardsModelAdapted} from '../../types/models.js';
import dom from '../../utils/dom.js';
import {Component} from '../components.js';

const BAR_CLASSNAME = 'bar';

export enum BAR_IDS {
    START = 'start',
    BACK = 'back',
    ROW = 'row',
    FORWARD = 'forward',
    SHUFFLE = 'shuffle',
    TABS = 'tabs',
    TAB = 'tab-',
}

type BarElements = {
    start: HTMLElement;
    tabs: HTMLElement;
    onPlay: {
        back: HTMLElement;
        row: HTMLElement;
        forward: HTMLElement;
        shuffle: HTMLElement;
    };
};

function getBarElements(): BarElements {
    return {
        start: dom.getById(BAR_IDS.START),
        tabs: dom.getById(BAR_IDS.TABS),
        onPlay: {
            back: dom.getById(BAR_IDS.BACK),
            row: dom.getById(BAR_IDS.ROW),
            forward: dom.getById(BAR_IDS.FORWARD),
            shuffle: dom.getById(BAR_IDS.SHUFFLE),
        },
    };
}

export default class Bar extends Component<'div'> {
    private json!: ExerciseCardsModelAdapted;
    private tabs: HTMLElement[];
    private elements!: BarElements;
    private activeTabs!: boolean[];

    // elements.control
    constructor(parent: HTMLElement) {
        super(parent, 'div', BAR_CLASSNAME, undefined);
        this.tabs = [];
    }
    render(jsonFile: ExerciseCardsModelAdapted) {
        super._reset();
        renderDom(this._element);
        this.elements = getBarElements();

        this.json = jsonFile;
        this.tabs.length = 0;
        // reference to localData
        this.activeTabs = this.json.state.tabs;
        this.onPlay(false);
        (this.elements.onPlay.row as HTMLButtonElement).disabled = true;

        for (let i = 0; i < this.activeTabs.length; i++) {
            this.tabs.push(dom.element('button', this.elements.tabs, {id: BAR_IDS.TAB + i, textContent: this.json.labels[i]}));
            this.setActiveTab(i, true);
        }
    }
    start() {
        this.json.state.status = true;
        this.setLabel(this.elements.start, 'Stop');
        this.setActive(this.elements.start, true);
        this.onPlay(true);
        this.resetTabs(true);
    }
    stop() {
        this.json.state.status = false;
        this.setLabel(this.elements.start, 'Start');
        this.setActive(this.elements.start, false);
        this.onPlay(false);
        this.resetTabs();
    }
    resetTabs(onPlay?: boolean) {
        for (let i = 0; i < this.activeTabs.length; i++) {
            const isActive = onPlay ? i !== this.json.state.card : true;
            this.setActiveTab(i, isActive);
        }
    }
    toggle(index: number) {
        this.setActiveTab(index, !this.activeTabs[index]);
    }
    setActiveTab(index: number, flag: boolean) {
        this.setActive(this.tabs[index], flag);
        this.activeTabs[index] = flag;
    }
    shuffle(flag: boolean) {
        this.setActive(this.elements.onPlay.shuffle, flag);
    }
    onPlay(flag: boolean) {
        Object.values(this.elements.onPlay).forEach((e) => (e.style.display = flag ? '' : 'none'));
    }
    getRow(): string | null {
        return this.elements.onPlay.row.children[0].textContent;
    }
    setRow(str: string) {
        this.elements.onPlay.row.children[0].textContent = str || '0';
    }
    setActive(e: HTMLElement, flag = true) {
        e.classList.toggle('active', flag);
    }
    setLabel(e: HTMLElement, str: string) {
        e.textContent = str;
    }
    isActive(index: number): boolean {
        return this.activeTabs[index];
    }
    // getTabIndex(e: HTMLElement) {
    //     return parseInt(e.getAttribute('key'));
    // }
}

// todo: BAR_IDS
function renderDom(parent: HTMLElement) {
    parent.innerHTML = `<div class="buttons">
        <button id="start">Start</button>
        <button id="back">
            <svg viewBox="0 0 32 32" width="15" height="15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4">
                <path d="M20 30 L8 16 20 2"/>
            </svg>
        </button>
        <button id="row" disabled><small></small></button>
        <button id="forward">
            <svg viewBox="0 0 32 32" width="15" height="15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4">
                <path d="M12 30 L24 16 12 2"/>
            </svg>
        </button>
    </div>
    <div class="toggles">
        <button id="shuffle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" shape-rendering="geometricPrecision">
                <path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/>
            </svg>
        </button>
    </div>
    <div class="toggles">
        <div class="toggles" id="tabs">
        </div>
        <button class="bar-menu" disabled>
            <svg width="14" height="14" viewBox="0 0 24 24" width="15" height="15" alt="menu">
                <path d="M24 6h-24v-4h24v4zm0 4h-24v4h24v-4zm0 8h-24v4h24v-4z" fill="currentColor"/>
            </svg>
        </button>
    </div>`;
}
