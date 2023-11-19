import {UrlSearchParams} from '../types/utils.js';

export const url = {
    getSearchString(urlString: string): string {
        const queryString = urlString.split('#')[0];
        const [, search] = queryString.split('?');
        return search;
        // todo: Url and relative Path
        // try {
        //     const url = new URL(urlString);
        //     return url.search;
        // } catch (error) {
        //     if (objects.isError(error)) {
        //         const msg: string = 'Error parsing URL: ' + error.message;
        //         console.error(msg);
        //     } else {
        //         console.error('Error parsing URL.');
        //     }
        //     return '';
        // }
    },
    getLocationSearchParams(): UrlSearchParams {
        const params = new URLSearchParams(window.location.search);
        const result: UrlSearchParams = {};

        for (const [key, value] of params) {
            result[key] = value || null;
        }
        return result;
    },
    parseUrlSearchParams(urlString: string): UrlSearchParams {
        const search = this.getSearchString(urlString);
        const params = new URLSearchParams(search);
        const result: UrlSearchParams = {};

        for (const [key, value] of params) {
            result[key] = value || null;
        }
        return result;
    },
};
