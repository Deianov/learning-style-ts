// @ts-nocheck

/**
  @Singleton decorator (not used)
**/
// export const Singleton = (): ClassDecorator => {
export function Singleton(): ClassDecorator {
    let instance: any;

    return (target) => {
        const original = target;
        const f: any = function (...args: any[]) {
            if (!instance) {
                instance = Reflect.construct(original, args);
            }
            return instance;
        };
        f.prototype = original.prototype;
        return f;
    };
}
