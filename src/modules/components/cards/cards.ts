import {ExerciseCardsModelAdapted} from '../../types/models.js';
import dom from '../../utils/dom.js';
import {maskMiddleChars} from '../../utils/strings.js';
import {Component} from '../components.js';

const CARDS_CLASSNAME = 'cards';
const CARDS_MASK_CHARACTER = '_';

class Cards extends Component<'div'> {
    private json!: ExerciseCardsModelAdapted;
    private cards: Element[];
    private active: number;
    private words: string[];
    private status: string | undefined;

    // content
    constructor(parent: HTMLElement) {
        super(parent, 'div', CARDS_CLASSNAME);
        this.cards = [];
        this.words = [];
        this.active = -1;
    }
    render(jsonFile: ExerciseCardsModelAdapted) {
        super._reset();
        this.json = jsonFile;
        this.resetCards();

        for (let tab = 0; tab < this.json.state.tabs.length; tab++) {
            this.createCard(this._element);
        }
        this.setActive(this.json.state.card);
    }
    setActive(index: number) {
        if (this.active > -1) {
            this.cards[this.active].classList.toggle('active', false);
        }
        this.json!.state.card = index;
        this.active = index;
        this.cards[this.active].classList.toggle('active', true);
    }
    populate(row: number) {
        if (typeof row === 'number') {
            this.json.state.row = row;
        }
        this.words = this.json.data[this.json.state.row];
        for (let index = 0; index < this.cards.length; index++) {
            this.setContent(index, this.words ? this.words[index] : '');
        }
        this.update();
    }
    setContent(index: number, str: string) {
        const card = this.cards[index]?.firstChild;
        if (card) {
            card.textContent = str;
        }
    }
    setStatus(status: string, flag: boolean) {
        this.cards[this.active].classList.toggle(status, flag);
        this.cards[this.active].classList.toggle('active', !flag);
        this.status = flag ? status : undefined;
    }
    update(index?: number) {
        if (this.active === -1 || !this._element) {
            return;
        }
        if (typeof index === 'number') {
            this.updateIndex(index);
        } else {
            for (let i = 0; i < this.cards.length; i++) {
                this.updateIndex(i);
            }
        }
    }
    updateIndex(i: number) {
        const isActiveTab = this.json.state.tabs[i];
        if (i === this.active) {
            this.visibleContent(i, true);
            if (isActiveTab || this.status === 'error') {
                this.setContent(i, this.words[i]);
            } else {
                this.setContent(i, maskMiddleChars(this.words[i], CARDS_MASK_CHARACTER));
            }
        } else {
            this.visibleContent(i, isActiveTab);
        }
    }
    createCard(parent: HTMLElement) {
        const index = this.cards.length || 0;
        const card = dom.element('div', parent);
        card.id = 'card' + (index + 1);
        card.classList.add('card');
        dom.element('h4', card);
        this.cards.push(card);
    }
    isValid() {
        return this.active > -1 && this.cards.length > this.active;
    }
    visibleContent(index: number, flag: boolean) {
        const card = this.cards[index]?.firstChild;
        if (card) {
            (card as HTMLElement).style.visibility = flag ? '' : 'hidden';
        }
    }
    resetCards() {
        this.cards.length = 0;
        this.json.state.row = 0;
        this.active = -1;
        this.status = undefined;
    }
}

export default Cards;
