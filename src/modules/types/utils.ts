/**
 * https://stackoverflow.com/questions/39392853/is-there-a-type-for-class-in-typescript-and-does-any-include-it
 * Angular internally declare Type as:
 */

/** Class */
export interface Type<T> extends Function {
    new (...args: any[]): T;
}

/** Class with arguments */
export interface TypeWithArgs<T, A extends any[]> extends Function {
    new (...args: A): T;
}

/** Class - variant 2 */
export type Class = {new (...args: any[]): any};

// events
export enum EventType {
    click = 'click',
}

type EventCallback = (this: HTMLElement) => any;

// interface for dynamic prototype method
interface Notify {
    [key: string]: (status: string | null, text: string, options: object) => void;
}
