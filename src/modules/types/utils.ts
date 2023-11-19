// @ts-nocheck
import { RouterInterface } from '../routes/routes.js';

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

// EVENTS
export type MouseEvents = 'click' | 'dblclick' | 'mouseup' | 'mousedown';
export type EventCallback = EventListener | EventListenerObject;

// FUNCTIONS
export type Callback = () => void;
export type CallbackPromise = () => Promise<void>;
export type CallbackPromiseArgBoolean = (flag?: boolean) => Promise<void>;
export type CallbackRenderPage = (router: RouterInterface, content: boolean) => Promise<void>;
export type CallbackRenderContent = (parent: HTMLElement) => Promise<void>;
export type CallbackWithArgs = (...args: any[]) => any;

// DOM
export type TagName = keyof HTMLElementTagNameMap;

// WEB
export type UrlSearchParams = {
    [key: string]: string | null;
};
