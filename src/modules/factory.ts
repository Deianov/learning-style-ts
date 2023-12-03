import {EventCallback, MouseEvents, Type, TypeWithArgs} from './types/utils.js';

interface Props {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    instance?: any;
    path?: string;
    eventType?: MouseEvents;
    event?: EventCallback;
}

export const factory = (function () {
    const dictionary: {[key: string]: Props} = {};

    function addProps(className: string, newProps: Props) {
        const props: Props = dictionary[className] || {};
        Object.assign(props, newProps);
        dictionary[className] = props;
    }

    /**
     * The factory defines the `getInstance' method, which takes care of
     * accessing the unique singleton instance.
     *
     * @param {Type<T>} ctor  Constructor
     * @returns {Promise<Awaited<T>>} singleton instance of class
     */
    // todo: asynchronous ?
    async function getInstance<T>(ctor: Type<T>): Promise<Awaited<T>> {
        const name: string = ctor.name || ctor.constructor.name;
        let instance = dictionary[name]?.instance;
        if (!instance) {
            instance = new ctor();
            saveInstance(name, instance);
        }
        return instance;
    }

    async function getInstanceWithArgs<T, A>(ctor: TypeWithArgs<T, A[]>, ...args: A[]): Promise<Awaited<T>> {
        const name: string = ctor.name || ctor.constructor.name;
        let instance = dictionary[name]?.instance;
        if (!instance) {
            instance = new ctor(...args);
            saveInstance(name, instance);
        }
        return instance;
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    function saveInstance(name: string, instance: any): void {
        const props: Props = dictionary[name] || {};
        props.instance = instance;
        dictionary[name] = props;

        if (props.event && props.eventType) {
            instance._addEvent(props.eventType, props.event);
        }
    }

    // variant: 2 => function name<T>(): Promise<Type<T>> { return module.default; }
    async function importClass<T>(path: string, file: string): Promise<new () => T> {
        const module = await import(path + encodeURIComponent(file));
        if (typeof module.default === 'function') {
            return module.default as new () => T;
        } else {
            throw new Error('Module does not export a default class constructor.');
        }
    }
    async function importClassWithArgs<T, A>(path: string, file: string): Promise<new (...args: A[]) => T> {
        const module = await import(path + encodeURIComponent(file));
        if (typeof module.default === 'function') {
            return module.default as new (...args: A[]) => T;
        } else {
            throw new Error('Module does not export a default class constructor.');
        }
    }

    async function importResource<T>(path: string, file: string): Promise<T> {
        const imp = await import(path + encodeURIComponent(file));
        const res: T = imp.default;
        return res;
    }

    return {
        addProps,
        getInstance,
        getInstanceWithArgs,
        importClass,
        importClassWithArgs,
        importResource,
    };
})();
