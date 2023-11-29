import dom from '../utils/dom.js';
import {strings} from '../utils/strings.js';
import {Component} from './components.js';

type ListOptions = {
    contenteditable: boolean;
};

export default class List extends Component<'table'> {
    private static CLASSNAME = 'lists';
    private static CLASSNAME_NUMBERING = 'numbering';

    private table!: HTMLTableElement;
    private data: string[][] = [];

    private cols: number = 0;
    private options: ListOptions | undefined;
    private isEditable: boolean = false;

    // elements.content
    constructor(parent: Element) {
        super(parent, 'table', List.CLASSNAME);
    }
    async render(data: string[][], options?: ListOptions) {
        super._reset();
        this.table = this._element;
        this.data = data;
        this.cols = data[0]?.length || 0;
        this.options = options;
        /** editable */
        if (this.options?.contenteditable) {
            this.isEditable = true;
            this.cols++;
            dom.setOptions(this.table, {spellcheck: 'false', autocapitalize: 'none', autocomplete: 'off'});
            this.table.classList.toggle(List.CLASSNAME_NUMBERING, true);
        } else {
            this.table.classList.toggle(List.CLASSNAME_NUMBERING, false);
            this.isEditable = false;
        }
        List.renderRows(this.table, this.cols, this.data, this.isEditable, this.options);
    }
    // this.json.state.tabs === view
    updateColumnView(column: number | null, view: boolean[]) {
        if (column) {
            List.setColumnView(this.table, column, view[column]);
        } else {
            for (let col = 0; col < this.cols; col++) {
                List.setColumnView(this.table, col, view[col]);
            }
        }
    }
    // this.json.data.length; === rows
    isValidRow(row: number, rows: number) {
        return Number.isInteger(row) && row > -1 && row < rows;
    }
    isFilled(row: HTMLCollectionOf<HTMLTableCellElement>) {
        for (let c = 0; c < row.length; c++) {
            const cell: HTMLTableCellElement = row[c];
            if (strings.isBlank(cell.textContent || '')) {
                return false;
            }
        }
        return true;
    }
    read(): string[][] {
        const rows: number = this.table.rows.length;
        const cols: number = this.table.rows[0].cells.length;
        const tableContent: string[][] = [];
        const empty: HTMLTableRowElement[] = [];
        for (let r = 0; r < rows; r++) {
            const cellsText: string[] = Array(cols);
            const cells = this.table.rows[r].cells;
            /** skip rows with empty cell */
            if (this.isFilled(cells)) {
                for (let c = 0; c < cols; c++) {
                    cellsText[c] = cells[c].textContent || '';
                }
                /** skip duplicates */
                if (!tableContent.some((rowContent) => List.equals(rowContent, cellsText, this.isEditable))) {
                    tableContent.push(cellsText);
                }
            } else {
                empty.push(this.table.rows[r]);
            }
        }
        empty.forEach((tr) => dom.remove(tr));
        return tableContent;
    }
    appendRow() {
        List.renderRow(this.table, this.cols, this.isEditable ? [(this.table.rows.length + 1).toString()] : [], this.options);
    }
    static equals(arr1: string[], arr2: string[], isEditable: boolean) {
        const fromIndex = isEditable ? 1 : 0;
        const tmp = arr2.slice(fromIndex);
        return arr1.slice(fromIndex).every((v, i) => v === tmp[i]);
    }
    static renderRow(table: HTMLTableElement, cols: number, data: string[], options?: ListOptions) {
        const tr = dom.element('tr', table);
        for (let column = 0; column < cols; column++) {
            dom.text('th', tr, data[column] || '', options);
        }
    }
    static renderRows(table: HTMLTableElement, cols: number, data: string[][], isEditable: boolean, options?: ListOptions) {
        let i = 1;
        for (const row of data) {
            const cells: string[] = isEditable ? [(i++).toString(), row].flat() : row;
            List.renderRow(table, cols, cells, options);
        }
    }
    static setColumnView(table: HTMLTableElement, col: number, flag: boolean) {
        const rows: HTMLCollectionOf<HTMLTableRowElement> = table.getElementsByTagName('tr');
        for (let row = 0; row < rows.length; row++) {
            const tableRow = rows[row];
            const cell = tableRow.cells[col];
            cell.style.display = flag ? '' : 'none';
        }
    }
    /** debug only
     * @param colors  - {{name: "colorName", colors: ["color1", "colorN"]}}
     */
    coloredTable(colors: {[key: string]: {name: string; colors: string[]}}) {
        super._reset();
        for (const key in colors) {
            const obj = colors[key];
            const tr = dom.element('tr', this.table);
            if (obj.name) {
                dom.text('th', tr, obj.name);
                obj.colors.forEach((c) => {
                    const e = dom.text('th', tr, c);
                    e.style.backgroundColor = c;
                });
            }
        }
    }
}
