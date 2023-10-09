import {EventType, Type, TypeWithArgs} from './types/utils.js';

// CONSTANTS: MODULES - relative paths to factory
export const PATH_SERVICES: string = './services/';
export const PATH_RESOURCES_MAPS: string = './components/maps/';

interface Props {
    instance?: any;
    path?: string;
    eventType?: EventType;
    event?: EventListenerOrEventListenerObject;
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
     * @param {Function} ctor  Constructor
     * @returns {Function} singleton instance of class
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

    function saveInstance(name: string, instance: any): void {
        const props: Props = dictionary[name] || {};
        props.instance = instance;
        dictionary[name] = props;

        if (props.event && props.eventType) {
            instance.setEvent(props.eventType, props.event || EventType.click);
        }
    }

    // variant: 2 => function name<T>(): Promise<Type<T>> { return module.default; }
    async function importClass<T>(path: string, file: string): Promise<new () => T> {
        const module = await import(path + encodeURIComponent(file));
        if (typeof module.default === 'function') {
            return module.default as new () => T;
        } else {
            throw new Error(`Module does not export a default class constructor.`);
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
        importResource,
    };
})();
