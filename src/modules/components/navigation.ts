import {router} from '../../main.js';

export class Menu {
    private element: Element;
    private active: Element | null = null;
    constructor(element: Element) {
        this.element = element;
        this.element.addEventListener('click', this);
    }
    click(e: Element) {
        this.setActive(this.active, false);
        this.setActive(e.parentNode as Element, true); // set active to parentNode <li> element
    }
    setActive(e: Element | null, flag: boolean) {
        if (e) {
            e.classList.toggle('active', flag);
        }
        this.active = flag ? e : null;
    }
    navigateByIndex(index: number) {
        const href = router.toPath(index, null);
        const e = this.element.querySelector(`a[href = "${href}"]`);
        if (e) {
            this.click(e);
        }
    }
    handleEvent(e: Event) {
        if (e?.type === 'click') {
            this.onclick(e);
        }
    }
    onclick(e: Event) {
        if (e.target instanceof Element) {
            const target = e.target;
            const params = router.urlSearchParams(target.getAttribute('href') || '');
            const pageIndex = params?.page;

            // single page routing
            if (pageIndex && pageIndex !== '0') {
                e.preventDefault();
                this.click(target);
                router.navigate(pageIndex, null);
            }
        }
    }
}
