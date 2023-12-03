import {ExerciseInfoModel} from '../types/models.js';
import {dom} from '../utils/dom.js';

type SubjectElements = [string | null, string | null, string | null, string | null];
const SUBJECT_ELEMENTS_LENGTH = 4;

export const subject = (function () {
    return {
        renderSubject,
    };
})();

/**
 *  <article>
 *    <header id="header">
 *      <div class="row">
 *      <div class="row">
 *        <div class="subject">
 *          <h3>Home</h3>
 *
 * @param {HTMLElement} parent
 * @param {string} subject
 * @param {ExerciseInfoModel | undefined} obj
 */
function renderSubject(parent: HTMLElement, subject: string, obj?: ExerciseInfoModel): void {
    const data: SubjectElements[] = [];
    parent.innerHTML = '';
    if (subject) {
        dom.text('h3', parent, subject);
    }

    if (obj) {
        const arr: SubjectElements = [obj.source, obj.sourceUrl, obj.author, obj.authorUrl];

        /* separate multiple authors */
        for (const elements of splitSubjectElements(arr)) {
            data.push(elements);
        }
    }

    for (let i = 0; i < data.length; i++) {
        const [source, sourceUrl, author, authorUrl] = data[i];
        const small = dom.element('small', parent);
        renderSubjectItem((i > 0 ? '; ' : '') + 'source: ', source, sourceUrl, small);
        renderSubjectItem(source ? ', author: ' : 'author: ', author, authorUrl, small);
    }
}

function renderSubjectItem(prefix: string, label: string | null, href: string | null, parent: HTMLElement): void {
    if (label || href) {
        dom.node(prefix, parent);
        if (href) {
            const target = href.at(0) === '/' ? '_self' : '_blank';
            dom.text('a', parent, label || href, {href, target});
        } else if (label) {
            // todo: static color
            dom.text('span', parent, label, 'gray-light');
        }
    }
}

/**
 * @param {SubjectElements} arr [source, sourceUrl, author, authorUrl]
 *
 * ["a1;a2", "b1;b2", "c1;c2", "d1;d2"]
 * =>
 * [["a1", "b1", "c1", "d1"], ["a2", "b2", "c2", "d2"]]
 */
function splitSubjectElements(arr: SubjectElements): SubjectElements[] {
    const tmp: string[][] = arr.map((value) => (typeof value === 'string' ? value.split(';') : ['']));
    const maxLength = Math.max(...tmp.map((e) => e.length));
    const result: SubjectElements[] = [];
    for (let i = 0; i < maxLength; i++) {
        const elements = new Array<string>(SUBJECT_ELEMENTS_LENGTH);
        for (let e = 0; e < SUBJECT_ELEMENTS_LENGTH; e++) {
            const element = tmp[e];
            elements[e] = element ? element[i] || '' : '';
        }
        result.push(elements as SubjectElements);
    }
    return result;
}
