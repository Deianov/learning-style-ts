import {dom} from '../../utils/dom.js';

export type CountryResource = {
    flag: string;
    meta: Meta;
    lands: Land;
};
type Land = {svg: string; meta?: Meta[]};
type Meta = {
    id: string;
    flag: string;
    state: string;
    ISO3166_2: string;
    coat_of_arms?: string;
    capital: string;
    most_populated: string;
    area: number;
    population: number;
};

export class Country {
    private wrapper: HTMLElement;
    private element: HTMLElement;
    private info: HTMLElement;
    private textElement?: HTMLElement | null;
    private active?: HTMLElement | null;

    public meta: Meta[] | undefined;

    constructor(parent: HTMLElement) {
        this.wrapper = dom.element('div', parent, 'row maps');
        this.element = dom.element('div', this.wrapper);
        this.info = dom.element('div', this.wrapper, 'column');
        this.element.addEventListener('click', this);
    }
    async render(obj: Land) {
        this.reset();
        this.element.innerHTML = obj.svg;
        this.meta = obj.meta as Meta[];
    }
    renderInfo(meta: Meta) {
        this.info.innerHTML = '';
        dom.element('div', this.info).innerHTML = meta.flag || meta.coat_of_arms || '';
        dom.text('h3', this.info, `${meta.state} (${meta.ISO3166_2})`);
        dom.element('div', this.info).innerHTML = `<strong>Fläche</strong> : ${meta.area} km<sup>2</sup>`;
        dom.element('div', this.info).innerHTML = `<strong>Einwohner (2018)</strong> : ${numberWithCommas(meta.population)} Mio.`;

        this.textElement = this.textElement || document.getElementById('map-text')!;
        this.textElement.textContent = meta.state;
    }
    reset() {
        this.textElement = null;
        this.element.innerHTML = '';
        this.info.innerHTML = '';
    }
    setActive(e: HTMLElement | null): void {
        if (e && this.active) {
            this.active.classList.toggle('active', undefined);
        }
        if (e) {
            e.classList.toggle('active', true);
        }
        this.active = e;
    }
    navigateByIndex(index: string): void {
        this.setActive(document.getElementById(index));
    }
    handleEvent(e: Event): void {
        if (e.type === 'click') {
            this.onClick(e.target as HTMLElement);
        }
    }
    onClick(e: HTMLElement): void {
        if (e.tagName === 'path') {
            this.setActive(e);
            const meta: Meta | null = this.meta ? this.meta[Number.parseInt(e.id)] : null;
            if (meta) {
                this.renderInfo(meta);
            }
        }
    }
}

function numberWithCommas(x: number) {
    return x >= 1000 ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0,' + x;
}
