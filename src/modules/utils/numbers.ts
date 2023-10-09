// const getRandomUUID = (a: number) =>
//     a ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, getRandomUUID);
const numbers = {
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
    // getRandomUUID,
    /** Timer */
    timer: {
        start(): Date {
            return new Date();
        },
        stop(startTime: number, hours: number, minutes: number, seconds: number, hundredths: number) {
            const diff = new Date().getDate() - startTime;
            const text = this.text(diff, hours, minutes, seconds, hundredths);
            return {
                diff,
                text,
            };
        },
        text(diff: number, hours: number, minutes: number, seconds: number, hundredths: number): string {
            const sec = 1000,
                min = 60 * sec,
                hrs = 60 * min;
            let text = '';
            text += hours ? `${Math.floor(diff / hrs)}:` : '';
            text += `${Math.floor((diff % hrs) / min).toLocaleString('de-DE', {minimumIntegerDigits: 2})}`;
            text += seconds ? `:${Math.floor((diff % min) / sec).toLocaleString('de-DE', {minimumIntegerDigits: 2})}` : '';
            text +=
                seconds && hundredths
                    ? `.${Math.floor(diff % sec).toLocaleString('de-DE', {minimumIntegerDigits: 4, useGrouping: false})}`
                    : '';
            return text;
        },
    },
};

export default numbers;
