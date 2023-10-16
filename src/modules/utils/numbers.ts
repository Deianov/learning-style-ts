export const numbers = {
    /** The maximum is exclusive and the minimum is inclusive
     * @param min  (inclusive)
     * @param max  (exclusive)
     * @returns {number}
     */
    getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    },
    /** Generate a Random UUID: 128-bit value; */
    getRandomUUID,
    /** Timer */
    timer: () => new Timer(),
};

function getRandomUUID(): string {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
    return uuid;
}

export enum TimerOption {
    hours = 1,
    minutes = 2, // allays in
    seconds = 4,
    milliseconds = 8,
}
type TimerResult = {
    time: number;
    label: string;
};

export class Timer {
    private static DEFAULT_OPTIONS: number = TimerOption.minutes + TimerOption.seconds;
    private static LOCALE = 'de-DE';
    private static DIGITS = 2;
    private static DIGITS_HUNDREDTHS = 4;
    private static USE_GROUPING = false;
    private startTime!: number;
    private endTime!: number;
    private flags: number;

    constructor() {
        this.start();
        this.flags = Timer.DEFAULT_OPTIONS;
    }
    start(): void {
        this.startTime = new Date().getTime();
        this.endTime = this.startTime;
    }
    stop(): void {
        this.endTime = new Date().getTime();
    }
    setOptions(...args: TimerOption[]): void {
        if (args.length === 0) {
            this.flags = Timer.DEFAULT_OPTIONS;
        } else {
            this.flags = args.reduce((a, b) => a + b, 0);
        }
    }
    private isTrue(bitmask: TimerOption): boolean {
        return (this.flags & bitmask) > 0;
    }
    result(...args: TimerOption[]): TimerResult {
        // save options
        const flags_save = this.flags;

        // time in milliseconds
        const time = this.endTime - this.startTime;

        // result with custom options
        if (args.length > 0) {
            this.setOptions(...args);
        }

        // create label
        const SEC: number = 1000;
        const MIN: number = SEC * 60;
        const HRS: number = MIN * 60;
        let label: string = '';

        // hours (Optional)
        if (this.isTrue(TimerOption.hours)) {
            label = label.concat(Number(Math.floor(time / HRS)).toString(), ':');
        }

        // minutes
        label = label.concat(Math.floor((time % HRS) / MIN).toLocaleString(Timer.LOCALE, {minimumIntegerDigits: Timer.DIGITS}));

        // seconds (Optional)
        if (this.isTrue(TimerOption.seconds) || this.isTrue(TimerOption.milliseconds)) {
            label = label.concat(':', Math.floor((time % MIN) / SEC).toLocaleString(Timer.LOCALE, {minimumIntegerDigits: Timer.DIGITS}));
        }

        // milliseconds (Optional)
        if (this.isTrue(TimerOption.milliseconds)) {
            label = label.concat(
                '.',
                Math.floor(time % SEC).toLocaleString(Timer.LOCALE, {
                    minimumIntegerDigits: Timer.DIGITS_HUNDREDTHS,
                    useGrouping: Timer.USE_GROUPING,
                }),
            );
        }
        this.flags = flags_save;

        return {
            time,
            label,
        };
    }
}

export default numbers;
