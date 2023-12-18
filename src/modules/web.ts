import {IS_MOBILE} from './constants.js';
import {toBase64, toUTF8} from './utils/strings.js';

interface Storage {
    getItem(key: string): string | null;
    setItem(key: string, data: string, options?: Options): void;
}

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
    static setItem(name: string, value: string, options?: Options): void {
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
        const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
        for (const cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split('=');
            if (cookieName === name) {
                return toUTF8(cookieValue);
            }
        }
        return '';
    }

    static delete(name: string) {
        Cookie.setItem(name, '', {
            expires: -1,
        });
    }
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
