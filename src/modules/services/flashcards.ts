import {data, notify, page} from '../../main.js';
import Bar, {BAR_IDS} from '../components/bar.js';
import {Tags} from '../components/components.js';
import Cards from '../components/exercises/cards.js';
import {UserInput} from '../components/input.js';
import List from '../components/list.js';
import {APP_IS_STATIC, APP_NAME, MSG_SERVER_REQUIRED, USER} from '../constants.js';
import {factory} from '../factory.js';
import {elements} from '../routes/page.js';
import {ExerciseCardsModelAdapted, ExerciseDataModel} from '../types/models.js';
import {CallbackWithArgs} from '../types/utils.js';
import {ScopeCounter} from '../utils/counters.js';
import {Timer, TimerOption} from '../utils/numbers.js';
import {removeHTML} from '../utils/strings.js';
import {localRepository} from '../web.js';
import {Controllable, Playable, Result} from './exerciseInterfaces.js';

const FLASHCARDS_WAITING_TO_REPEAT = 5;

enum PLAY_STEP {
    NEXT = 1,
    SKIP = 2,
    PREVIOUS = -1,
    REPEAT = 0,
}

export default class Flashcards implements Playable {
    private key: string = '';
    private controller?: Controllable;
    private json!: ExerciseCardsModelAdapted;
    private counter: ScopeCounter;
    private bar!: Bar;
    private list!: List;
    private cards!: Cards;
    private input!: UserInput;
    private tags!: Tags;
    private static instance: Flashcards;
    private btnEdit: CallbackWithArgs;
    private btnAdd: CallbackWithArgs;
    private timer: Timer;

    constructor() {
        Flashcards.instance = this;
        this.btnEdit = () => notify.btn('info', 'edit', Flashcards.edit, {hideSvg: false, button: {svg: {id: 'edit', width: 14}}});
        this.btnAdd = notify.addCustomMethod('btnAdd', elements.messages, 'msg', notify.renders.BUTTON, {
            capacity: 1,
            button: {func: () => Flashcards.instance.list.appendRow(), svg: {id: 'plus', width: 22, height: 22, color: 'green'}},
        });
        this.timer = new Timer();
        this.counter = new ScopeCounter(0, 0, undefined);
    }

    async render(jsonFile: ExerciseCardsModelAdapted): Promise<void> {
        this.json = jsonFile;
        this.key = APP_NAME + '/' + this.json.exercise.path;
        this.counter.resetRange(0, this.json.state.rows);

        this.bar = await factory.getInstanceWithArgs(Bar, elements.control);
        this.list = await factory.getInstanceWithArgs(List, elements.content);
        this.cards = await factory.getInstanceWithArgs(Cards, elements.content);
        this.input = await factory.getInstanceWithArgs(UserInput, elements.content);
        this.tags = await factory.getInstanceWithArgs(Tags, elements.bottom);

        this.bar.render(this.json);
        this.list.render(this.json.data);
        this.tags.render();
        this.btnEdit();
    }
    start() {
        if (page.isActive) {
            this.stop();
            return;
        }
        this.counter.reset();
        this.bar.start();
        this.list._remove();
        this.tags._remove();
        this.cards.render(this.json);
        this.input.render(this.json, Flashcards.onTextareaChange);
        this.play(PLAY_STEP.NEXT);
        page.play(true);
        printResultsHistoryFromLocalState(this.key, this.timer);
        this.timer.start();
    }
    play(step: PLAY_STEP) {
        let row = -1;

        // finish
        if (!this.counter.hasNext() && (step === PLAY_STEP.NEXT || step === PLAY_STEP.SKIP)) {
            this.timer.stop();
            this.finish({
                path: this.json.exercise.path,
                count: this.counter.getPreviousCount(),
                stack: this.counter.getResults().stack,
                success: this.input.successCounter.value(),
                errors: this.input.errorsCounter.value(),
                timer: this.timer.result(TimerOption.minutes, TimerOption.seconds),
            });
            return;
        }

        // next
        if (step === PLAY_STEP.NEXT) {
            row = this.counter.next().getValue();
            // skip
        } else if (step === PLAY_STEP.SKIP) {
            this.input.clear();
            row = this.counter.skip().getValue();
            // previous
        } else if (step === PLAY_STEP.PREVIOUS) {
            this.input.stats.change('success', this.input.successCounter.back());
            row = this.counter.previous().getValue() || 0;
            // repeat
        } else if (step === PLAY_STEP.REPEAT) {
            row = this.counter.repeat(FLASHCARDS_WAITING_TO_REPEAT).getValue();
        }

        if (!this.list.isValidRow(row, this.json.data.length)) {
            console.error('Bad row number!');
        } else if (this.input.state.error) {
            this.cards.setStatus('error', true);
            this.cards.update(this.json.state.card);
            this.input.repeat();
        } else {
            this.cards.setStatus('error', false);
            this.input.stats.change('done', this.counter.getPreviousCount() || 1);
            this.cards.populate(row);
            this.input.next();
            this.bar.setRow((row + 1).toString());
        }
    }
    stop() {
        if (!page.isActive) {
            return;
        }
        this.bar.stop();
        this.cards._remove();
        this.input._remove();
        elements.content.innerHTML = '';
        this.list.render(this.json.data);
        this.tags.render();
        page.play(false);
    }
    finish(result: Result): void {
        this.stop();
        this.list._visible(false);
        this.controller?.processResult(result);
        processExerciseResult(this.key, result);
    }
    toggleShuffle() {
        this.bar.shuffle(this.counter.toggleShuffle());
        this.input.reset();
        this.play(PLAY_STEP.NEXT);
    }
    static edit() {
        Flashcards.instance.stop();
        notify.btn('error', 'save', Flashcards.save);
        Flashcards.instance.btnAdd('info', 'add');
        const that = Flashcards.instance;
        that.list.render(that.json.data, {contenteditable: true});
    }
    static async save() {
        const that = Flashcards.instance;
        that.btnEdit();
        notify.with('btnAdd').clear();

        const tmp: string[][] = [];
        for (const row of that.list.read()) {
            tmp.push(row.map((c) => removeHTML(c)));
        }

        // static
        if (APP_IS_STATIC) {
            // sort and remove numbering
            const newData: ExerciseDataModel = tmp.sort((a, b) => a[0].localeCompare(b[0])).map((d) => d.slice(1));
            that.json.data = newData;
            that.list.render(newData);

            notify.alert('error', MSG_SERVER_REQUIRED);
            return;
        }

        // server
        const res = await data.getJsonWithPayload(that.json.exercise.path, {
            username: USER.username || '',
            data: tmp,
        });

        if (res) {
            // update data
            if (res.status === 200) {
                // that.json.data = res.data || [];
            }
            // notify.alert(res.status === 200 ? 'success' : 'error', res.message);
        }
        that.list.render(that.json.data);
    }
    private static onTextareaChange(input: UserInput): void {
        Flashcards.instance.play(input.state.success ? 1 : 0);
    }
    clickButton(id: string | null | undefined): void {
        if (id) {
            if (id === BAR_IDS.START) {
                Flashcards.instance.start();
            } else if (id === BAR_IDS.BACK) {
                Flashcards.instance.play(PLAY_STEP.PREVIOUS);
            } else if (id === BAR_IDS.FORWARD) {
                Flashcards.instance.play(PLAY_STEP.SKIP);
            } else if (id === BAR_IDS.SHUFFLE) {
                Flashcards.instance.toggleShuffle();
            } else if (id.startsWith(BAR_IDS.TAB)) {
                const index = parseInt(id.slice(BAR_IDS.TAB.length));
                Flashcards.instance.bar.toggle(index);
                Flashcards.instance.list.updateColumnView(index, Flashcards.instance.json.state.tabs);
                Flashcards.instance.cards.update(index);
            }
            Flashcards.instance.input.visible(true);
        }
    }
    setController(controller: Controllable): void {
        this.controller = controller;
    }
}

function printResultsHistoryFromLocalState(key: string, thisTimer: Timer): void {
    const storage = localRepository.getItem(key);
    if (storage) {
        const obj: {games: number; count: number; stack: number; success: number; errors: number; timer: number} = JSON.parse(storage);
        if (obj?.games) {
            const {stack, success, errors, timer} = obj;
            const timeLabel = thisTimer.setTime(timer).result(TimerOption.minutes, TimerOption.seconds).label;
            const func = () => {
                notify.alert('info', `Top result - successes: ( ${success} / ${stack} ), errors: ( ${errors} ), time: ${timeLabel}`);
            };
            notify.btn('', 'successful: ' + obj.games, func, {hideSvg: true, button: {tag: 'small'}});
        }
    }
}

// todo: TS
function processExerciseResult(key: string, result: Result): void {
    const {count, stack, success, errors, timer} = result;
    const storage = localRepository.getItem(key);

    // const msg = `${count} | ${stack} (${success} successes, ${errors} errors, ${timer.label} time)`;
    // notify.msg('success', msg, {prefix: 'Done!'});

    const rate: number = success / stack;
    if (isNaN(rate) || rate < 0.9) {
        notify.alert('info', 'Done with less than 90%.');
        notify.alert('info', 'Play again ?');
        return;
    }
    notify.alert('success', 'Well done !!!');
    notify.alert('info', 'Play again ?');

    if (!storage) {
        localRepository.setItem(key, JSON.stringify({games: 1, count, stack, success, errors, timer: timer.time}));
        return;
    }
    const obj = JSON.parse(storage);
    obj.games++;
    notify.msg('success', `${obj.games} ${obj.games === 1 ? 'time' : 'times'}`, {prefix: 'Finished: '});

    if (success > obj.success) {
        obj.success = success;
        notify.alert('success', `Top success points: ${success} !!!`);
        notify.msg('success', `${success} !!!`, {prefix: 'Top success points: '});
    }
    if (timer.time < obj.timer) {
        obj.timer = timer.time;
        notify.alert('success', `Top time: ${timer.label} !!!`);
        notify.msg('success', `${timer.label} !!!`, {prefix: 'Top time: '});
    }
    if (errors < obj.errors) {
        obj.errors = errors;
        notify.alert('success', `Top errors points: ${success} !!!`);
        notify.msg('success', `${success} !!!`, {prefix: 'Top errors points: '});
    }
    localRepository.setItem(key, JSON.stringify(obj));
}
