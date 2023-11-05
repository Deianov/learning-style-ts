import {ExerciseInfoModel} from '../types/models.js';
import dom from '../utils/dom.js';

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
 *
 * @param {HTMLElement} parent
 * @param {string} subject  - name
 * @param {ExerciseInfoModel | undefined} obj    - {.... source, sourceUrl, author, authorUrl}
 */
function renderSubject(parent: HTMLElement, subject: string, obj?: ExerciseInfoModel): void {
    const data: SubjectElements[] = [];
    parent.innerHTML = '';
    if (subject) {
        dom.text('h3', parent, subject);
    }

    if (obj) {
        // split to array
        const arr: SubjectElements = [obj.source, obj.sourceUrl, obj.author, obj.authorUrl];

        /* separate multiple authors */
        for (const elements of splitSubjectElements(arr)) {
            data.push(elements);
        }
    }

    for (let i = 0; i < data.length; i++) {
        const sourceData: SubjectElements = data[i] || ['', '', '', ''];

        const [source, sourceUrl, author, authorUrl] = sourceData;

        const small = dom.element('small', parent);
        if (source || sourceUrl) {
            dom.node((i > 0 ? '; ' : '') + 'source: ', small);
            dom.text('a', small, source || '', formatLink(sourceUrl || ''));
        }
        if (author || authorUrl) {
            dom.node(source ? ', author: ' : 'author: ', small);
            dom.text('a', small, author || '', formatLink(authorUrl || ''));
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
    console.log(result);

    return result;
}

function formatLink(url: string) {
    const options: {href: string; target?: string} = {href: url || '#'};
    if (!['#', '/', '\\'].includes(options.href)) {
        options.target = '_blank';
    }
    return options;
}
