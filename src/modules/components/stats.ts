import dom from '../utils/dom.js';

/**
 <div>
    <div class="stats right">
        <small>error</small>
        <small>success</small>
        <img src="./assets/images/award.svg" alt="award" width="18" height="18">
    </div>
    <div class="counts left">
        <small>done</small>
        <span>|</span>
        <small>rows</small>
    </div>
 </div>
*/
type StatsOptions = {
    stats: {className: string};
    award: {src: string; alt: string; width: string; height: string};
    counts: {className: string};
};
const StatsKeys = ['error', 'success', 'done', 'rows'] as const;
type StatsElements = {
    [key in (typeof StatsKeys)[number]]: HTMLElementTagNameMap['small'];
};
type StatsValues = {
    [key in (typeof StatsKeys)[number]]: string | null;
};

export class Stats {
    private static defaultOptions = {
        stats: {className: 'stats right'},
        award: {src: './assets/images/award.svg', alt: 'award', width: '18', height: '18'},
        counts: {className: 'counts left'},
    };
    private elements?: StatsElements;

    constructor() {}
    render(parent: Element, opt?: StatsOptions) {
        const options = opt || Stats.defaultOptions;
        const element = dom.element('div', parent);
        const elements: {[key in (typeof StatsKeys)[number]]?: HTMLElementTagNameMap['small']} = {};

        const stats = dom.element('div', element, options.stats);
        elements.error = dom.element('small', stats);
        elements.success = dom.element('small', stats);
        dom.element('img', stats, options.award);

        const counts = dom.element('div', element, options.counts);
        elements.done = dom.element('small', counts);
        dom.text('span', counts, '|');
        elements.rows = dom.element('small', counts);
        this.elements = elements as StatsElements;

        this.setStats(0, 0, 0, 0);
    }
    getStats(): StatsValues {
        return {
            done: this.elements?.done.textContent || '0',
            rows: this.elements?.rows.textContent || '0',
            error: this.elements?.error.textContent || '0',
            success: this.elements?.success.textContent || '0',
        };
    }
    setStats(done: number, rows: number, error: number, success: number) {
        if (this.elements) {
            this.elements.done.textContent = done.toString();
            this.elements.rows.textContent = rows.toString();
            this.elements.error.textContent = error.toString();
            this.elements.success.textContent = success.toString();
        }
    }
    change(name: (typeof StatsKeys)[number], value: number) {
        if (this.elements) {
            this.elements[name].textContent = value.toString();
        }
    }
    plus(name: (typeof StatsKeys)[number]) {
        if (this.elements) {
            this.elements[name].textContent = (Number.parseInt(this.elements[name].textContent || '0') + 1).toString();
        }
    }
}
