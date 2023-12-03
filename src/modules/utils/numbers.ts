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
    private static DIGITS = 2;
    private static DIGITS_HUNDREDTHS = 4;
    private static USE_GROUPING = false;
    private startTime: number = 0;
    private endTime: number = 0;
    private flags: number = Timer.DEFAULT_OPTIONS;

    constructor() {}
    static formatNumber(value: number, minimumIntegerDigits: number = 1, useGrouping: boolean = false): string {
        const options: Intl.NumberFormatOptions = {
            minimumIntegerDigits,
            useGrouping,
        };
        return new Intl.NumberFormat(undefined, options).format(value);
    }
    start(): void {
        this.startTime = new Date().getTime();
        this.endTime = this.startTime;
    }
    stop(): void {
        this.endTime = new Date().getTime();
    }
    setTime(time: number): Timer {
        this.startTime = 0;
        this.endTime = time;
        return this;
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
        const flags_save = this.flags;
        const time = this.endTime - this.startTime;
        if (args.length > 0) {
            this.setOptions(...args);
        }

        const hours = Timer.formatNumber(Math.floor(time / (1000 * 60 * 60)), 1);
        const minutes = Timer.formatNumber(Math.floor((time % (1000 * 60 * 60)) / (1000 * 60)), Timer.DIGITS);
        const seconds = Timer.formatNumber(Math.floor((time % (1000 * 60)) / 1000), Timer.DIGITS);
        const milliseconds = Timer.formatNumber(time % 1000, Timer.DIGITS_HUNDREDTHS, Timer.USE_GROUPING);

        let label: string = '';

        if (this.isTrue(TimerOption.hours)) {
            label = hours;
        }

        if (this.isTrue(TimerOption.minutes)) {
            label = (label ? label + ':' : '') + minutes;
        }

        if (this.isTrue(TimerOption.seconds)) {
            label = (label ? label + ':' : '') + seconds;
        }

        if (this.isTrue(TimerOption.milliseconds)) {
            label = (label ? label + '.' : '') + milliseconds;
        }

        this.flags = flags_save;

        return {
            time,
            label,
        };
    }
}

export class DateUtils {
    private static DEFAULT_LOCALE = 'de-DE';
    private static formatter = new Intl.DateTimeFormat(DateUtils.DEFAULT_LOCALE, {year: 'numeric', month: '2-digit', day: '2-digit'});

    static getDateString(): string {
        return DateUtils.formatter.format(new Date());
    }
}
