import {DEBUG_CONTENT, MSG_BNT, QUIZ_CORRECT_QUESTION_SVG} from '../../constants.js';
import {AnswerModel, ExerciseQuizModel, QuestionModel} from '../../types/models.js';
import dom from '../../utils/dom.js';
import {Flags} from '../../utils/flags.js';

const QUIZ_QUESTIONS_CLASSNAME = 'questions';
const QUIZ_RESULTS_CLASSNAME = 'results';
const QUIZ_CARD_CLASSNAME = 'card';
const QUIZ_VALIDATE_CLASSNAME = 'validate';
const QUIZ_BNT_CLEAR_CLASSNAME = 'clear';

type Result = {correct: number; from: number};

export class Quiz {
    private static instance: Quiz;

    private parent: HTMLElement;
    private element?: HTMLElement;
    private bnt?: HTMLElement;
    private questions: QuestionModel[] = [];
    private validator?: EventListenerOrEventListenerObject;

    public json?: ExerciseQuizModel;
    public isValidated: boolean = false;

    constructor(parent: HTMLElement) {
        this.parent = parent;
        Quiz.instance = this;
    }
    async render(jsonFile: ExerciseQuizModel | undefined, validator: EventListenerOrEventListenerObject) {
        if (!jsonFile) {
            return;
        }

        this.json = jsonFile;
        this.questions = jsonFile.questions;
        this.isValidated = false;
        this.validator = validator;

        // kiwi
        this.parent.innerHTML = DEBUG_CONTENT;

        // top
        const resultsElement = this.renderResult(this.parent, QUIZ_RESULTS_CLASSNAME, QUIZ_CARD_CLASSNAME)?.firstChild?.lastChild;
        if (resultsElement instanceof HTMLElement) {
            resultsElement.textContent = MSG_BNT.view;
            resultsElement.addEventListener('click', validator);
        }

        // table
        this.element = dom.element('ol', this.parent, QUIZ_QUESTIONS_CLASSNAME);
        for (let i = 0; i < this.questions.length; i++) {
            this.renderQuestion(this.element, this.questions[i], i);
        }

        // bottom
        this.bnt = dom.text('button', this.parent, MSG_BNT.validate, QUIZ_VALIDATE_CLASSNAME);
        this.bnt.addEventListener('click', validator);
    }
    renderResult(parent: HTMLElement, className: string, classNameCard: string): HTMLElement {
        const element = dom.element('div', parent, className);
        const card = dom.element('div', element, classNameCard);
        dom.element('span', card);
        dom.element('div', card, {style: 'cursor: pointer;'});

        return element;
    }
    renderQuestion(parent: HTMLElement, question: QuestionModel, questionNumber: number): void {
        const div1 = dom.element('div', parent, 'question');
        dom.text('span', dom.element('li', div1), question.text);
        const div2 = dom.element('div', div1);
        for (let i = 0; i < question.answers.length; i++) {
            this.renderAnswer(div2, question.answers[i], i, questionNumber);
        }
    }
    renderAnswer(parent: HTMLElement, answer: AnswerModel, value: number, questionNumber: number): void {
        const label = dom.element('label', parent, 'answer');
        dom.element('input', label, {name: `question${questionNumber}`, type: 'checkbox', value});
        dom.text('span', label, answer.text);
    }
    reset() {
        this.render(this.json, this.validator!);
    }
    validate(correct: number[]): Result {
        Quiz.instance.bnt!.textContent = MSG_BNT.clear;
        Quiz.instance.bnt!.classList.toggle(QUIZ_BNT_CLEAR_CLASSNAME, true);

        const results = this.validateQuestions(correct);
        const from = results.length;
        const correctByUser = results.filter(Boolean).length;

        // replace the correct answers with svg
        const questions = Array.from(document.getElementsByClassName(QUIZ_QUESTIONS_CLASSNAME)[0].children);
        questions.map((question, index) => {
            if (results[index]) {
                question.innerHTML = `<li>${QUIZ_CORRECT_QUESTION_SVG}</li>`;
            }
        });

        const resultElement = document.getElementsByClassName(QUIZ_RESULTS_CLASSNAME)[0]?.firstChild;
        if (resultElement) {
            resultElement.firstChild!.textContent = `${correctByUser}/${from}`;
            resultElement.lastChild!.textContent = MSG_BNT.clear;
        }

        this.isValidated = true;

        return {correct: correctByUser, from};
    }
    validateQuestions(correct: number[]): boolean[] {
        const parent = document.getElementsByClassName(QUIZ_QUESTIONS_CLASSNAME)[0];
        const questions: Element[] = Array.from(parent.children);
        let i = 0;
        return questions.map((question) => this.validateQuestion(question as HTMLElement, correct[i++]));
    }
    validateQuestion(question: HTMLElement, flags: number): boolean {
        const answers: HTMLCollectionOf<HTMLInputElement> = question.getElementsByTagName('input');
        let input: HTMLInputElement;
        let hasChecked: boolean = false,
            hasError: boolean = false,
            isChecked: boolean;

        for (let index = 0; index < answers.length; index++) {
            input = answers[index];
            isChecked = input.checked;
            hasChecked = hasChecked || isChecked;

            if (Flags.isTrue(flags, Flags.toBits(index))) {
                (input.parentNode as HTMLElement).classList.toggle('correct', true);
            } else if (isChecked) {
                (input.parentNode as HTMLElement).classList.toggle('wrong', true);
                hasError = true;
            }
        }
        return !hasError && hasChecked;
    }
    /**
     * Used by server validation
     *
     * @returns {number[]} Array of flags -> user answers
     */
    getUserAnswers(): number[] {
        const parent: Element = document.getElementsByClassName(QUIZ_QUESTIONS_CLASSNAME)[0];
        const questions: Element[] = Array.from(parent.children);
        const userAnswers: number[] = Array(questions.length);
        let flags: number;
        for (let index = 0; index < questions.length; index++) {
            const answers: HTMLCollectionOf<HTMLInputElement> = questions[index].getElementsByTagName('input');
            flags = 0;
            for (let i = 0; i < answers.length; i++) {
                if (answers[i].checked) {
                    flags = Flags.set(flags, Flags.toBits(i));
                }
            }
            userAnswers[index] = flags;
        }
        return userAnswers;
    }
}
