// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

abstract class Flags {
    static set(flags: number, bitmask: number): number {
        return flags | bitmask;
    }
    static clear(flags: number, bitmask: number): number {
        return flags & ~bitmask;
    }
    static toggle(flags: number, bitmask: number): number {
        return flags ^ bitmask;
    }
    static isTrue(flags: number, bitmask: number): boolean {
        return (flags & bitmask) > 0;
    }
    static isFalse(flags: number, bitmask: number): boolean {
        return (flags & bitmask) === 0;
    }
    /**
     * Index to bitmask: 0, 1, 2, 3 ... 32  =>  1, 2, 4, 8, ...
     *
     * @param {number} index (max: 31)
     * @returns {number} bits
     */
    static toBits(index: number): number {
        return 1 << index;
    }
    /**
     * Array of booleans to flags: [true, false, true] => 5
     *
     * @param {boolean[]} arr
     * @returns {number} flags
     */
    static toNumber(arr: boolean[]): number {
        return arr.reduce((acc, c, i) => {
            return acc + (c ? 1 << i : 0);
        }, 0);
    }
    /**
     * Bits to index
     *
     * base 2: Math.log2(bits)
     * @returns: 0 for bits=0
     */
    static toIndex(bits: number): number {
        let log = 0;
        if ((bits & 0xffff0000) !== 0) {
            bits >>>= 16;
            log = 16;
        }
        if (bits >= 256) {
            bits >>>= 8;
            log += 8;
        }
        if (bits >= 16) {
            bits >>>= 4;
            log += 4;
        }
        if (bits >= 4) {
            bits >>>= 2;
            log += 2;
        }
        return log + (bits >>> 1);
    }
    /**
     * Flags to array of booleans: (5, 3) => [true, false, true]
     *
     * @param {number} flags
     * @param {number} length
     * @returns {boolean[]}
     */
    static toArray(flags: number, length: number): boolean[] {
        return Array.from({length}, (v, i) => Flags.isTrue(flags, Flags.toBits(i)));
    }
    /**
     * Set flags by length
     *
     * @param {number} length
     * @returns {number} flags
     */
    static byLength(length: number) {
        let flags = 0;
        for (let i = 0; i < length; i++) {
            flags = flags | (1 << i);
        }
        return flags;
    }
}

class ArrayOfFlags {
    private number: number;
    private _length: number;
    constructor() {
        this.number = 0;
        this._length = 0;
    }
    get length(): number {
        return this._length;
    }
    set length(length: number) {
        this._length = length;
        this.number = Flags.byLength(length);
    }
    getIndex(index: number): boolean {
        return Flags.isTrue(this.number, Flags.toBits(index));
    }
    setIndex(index: number, flag: boolean): void {
        this.number = flag ? Flags.set(this.number, Flags.toBits(index)) : Flags.clear(this.number, Flags.toBits(index));
    }
    toggle(index: number): void {
        this.number = Flags.toggle(this.number, Flags.toBits(index));
    }
    get array(): boolean[] {
        return Flags.toArray(this.number, this.length);
    }
    set array(arr: boolean[]) {
        this._length = arr.length;
        this.number = Flags.toNumber(arr);
    }
}

export {Flags, ArrayOfFlags};
