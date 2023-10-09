import {router} from '../../main.js';
import {EventType} from '../types/utils.js';

export class Menu {
    private element: HTMLElement;
    private active: HTMLElement | null = null;
    constructor(element: HTMLElement) {
        this.element = element;
        this.element.addEventListener(EventType.click, this);
    }
    click(e: HTMLElement | null) {
        if (e) {
            this.setActive(this.active, false);
            this.setActive(e.parentNode as HTMLElement, true); // set active to parentNode <li> element
        }
    }
    setActive(e: HTMLElement | null, flag: boolean) {
        if (e) {
            e.classList.toggle('active', flag);
        }
        this.active = flag ? e : null;
    }
    navigateByIndex(index: number) {
        this.click(this.element.querySelector(`a[value = "${index}"]`));
    }
    async handleEvent(e: Event) {
        if (e.type === EventType.click) {
            await this.onclick(e.target as HTMLElement);
        }
    }
    async onclick(e: HTMLElement) {
        if (e.tagName === 'A' && e.hasAttribute('value')) {
            this.click(e);
            await router.navigate(e.getAttribute('value'));
        }
    }
}
