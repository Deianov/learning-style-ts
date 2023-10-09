import {IS_MOBILE} from './constants';
import {toBase64, toUTF8} from './utils/strings.js';

interface Storage {
    getItem(key: string): string | null;
    setItem(key: string, data: string, options?: Options): any;
}

/**
 *  save/read State in cookie|localStorage
 */
export const localRepository: Storage = (function () {
    const storage: Storage = IS_MOBILE || !localStorage ? Cookie : localStorage;
    return {
        getItem(key: string): string | null {
            return storage.getItem(key);
        },
        setItem(key: string, data: string): void {
            storage.setItem(key, data);
        },
    };
})();

type Options = {
    expires?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    suffix?: string;
};

/** toDo: testing
 * https://www.npmjs.com/package/typescript-cookie
 * https://www.quirksmode.org/js/cookies.html
 * https://gist.github.com/daxartio/f387e811ba38eca5d5f8bff53f9fadb1
 */
// refactoring from gist.github.com/daxartio
export class Cookie {
    private constructor() {}
    /**
     * @param {string} name
     * @param {string} value
     * @param {Options} options
     */
    static setItem(name: string, value: string, options?: Options) {
        const {expires, path, domain, secure, suffix} = options || {};

        const DEFAULT_DAYS = 365; // 365 * 24 * 60 * 60 = 31536000 (1 year)
        const expiresDate = new Date(Date.now() + (expires || DEFAULT_DAYS) * 864e5).toUTCString();

        let updatedCookie = name + '=' + toBase64(value);
        updatedCookie += '; expires=' + expiresDate;

        if (typeof path === 'string') {
            updatedCookie += '; path=' + path;
        }

        if (typeof domain === 'string') {
            updatedCookie += '; domain=' + domain;
        }

        if (secure) {
            updatedCookie += ';secure';
        }

        if (typeof suffix === 'string') {
            updatedCookie += (suffix.charAt(0) === ';' ? '' : '; ') + suffix;
        }

        document.cookie = updatedCookie;
    }

    static getItem(name: string): string {
        let matches =
            document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')) || '';
        let match = matches[1];
        return match ? toUTF8(match) : '';
    }

    static delete(name: string) {
        Cookie.setItem(name, '', {
            expires: -1,
        });
    }
}
