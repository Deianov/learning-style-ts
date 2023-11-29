import {PATH_JSON} from './constants.js';
import {Cashable, ExerciseCardsModel, ExerciseCardsModelAdapted} from './types/models.js';

/**
 *  cashing in memory
 */
const inMemoryRepository = (function () {
    const cashed: {[key: string]: Cashable} = {};
    return {
        existsByName(name: string): boolean {
            // return files.hasOwnProperty(name);
            return Object.prototype.hasOwnProperty.call(cashed, name);
        },
        getByName(name: string): Cashable | undefined {
            return cashed[name];
        },
        save(name: string, obj: Cashable): Cashable {
            // todo:
            // console.log(JSON.stringify(files));
            cashed[name] = obj;
            return this.getByName(name)!;
        },
        remove(name: string): void {
            if (this.existsByName(name)) {
                delete cashed[name];
            }
        },
        reset(): void {
            for (const key of Object.keys(cashed)) {
                delete cashed[key];
            }
        },
    };
})();

/**
 *  top level of cashing
 */
const cashingRepository = (function () {
    return {
        getByName(name: string): Cashable | undefined {
            return inMemoryRepository.getByName(name);
        },
        save(name: string, obj: Cashable): Cashable {
            return inMemoryRepository.save(name, obj);
        },
        reset(): void {
            inMemoryRepository.reset();
        },
    };
})();

/**
 *  fetch server data
 */
const repository = (function () {
    const server = PATH_JSON;

    async function fetchStatic(fileName: string): Promise<Cashable | null> {
        const req: string = server + (fileName.startsWith('/') ? '' : '/') + fileName + '.json';
        const res: Response = await fetch(req);

        if (!res.ok) {
            const msg = 'Failed to fetch data: ' + res.statusText;
            console.error(msg);
            // throw new Error(msg);
            return null;
        }

        const json: Cashable = await res.json();
        return json;

        // } catch (error) {
        //     if (objects.isError(error)) {
        //         const msg = error.message;
        //         console.error(msg);
        //     } else {
        //         console.error('Unknown error');
        //     }
        //     throw error;
        // }
    }

    // async function fetchApi(apiPath: string): Promise<Cashable> {
    //     const result: Promise<Cashable> = new Promise((resolve) => {
    //         setTimeout(() => {
    //             resolve('foo');
    //         }, 300);
    //     });
    //     return await result;
    // }

    return {
        async getByName(name: string): Promise<Cashable | null> {
            // switch between static/api version
            const fun = fetchStatic;
            return await fun(name);
        },
    };
})();

/**
 *  top level of repositories: exposed in services
 */
class Data {
    /**
     * @param {string} name Relative resource path. ("fileName" || path/filename)
     * @param {boolean} cashable
     * @param {boolean} adaptable
     */
    async getJson(name: string, cashable?: boolean, adaptable?: boolean): Promise<Cashable | null> {
        let res;
        if (cashable) {
            res = cashingRepository.getByName(name);
            if (res) {
                return res;
            }
        }
        res = await repository.getByName(name);
        if (!res) {
            return null;
        }
        if (adaptable) {
            res = dataAdapter(res as ExerciseCardsModel);
            return res;
        }
        if (cashable) {
            res = cashingRepository.save(name, res);
        }
        return res;
    }
    removeCached(): void {
        cashingRepository.reset();
    }
    // todo
    async getJsonWithPayload(api: string, data: {username: string; data: string[][]}): Promise<Response> {
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const init = {status: 200, statusText: 'OK'};
        const res = new Response(blob, init);
        return res;
    }
}

// function arrayToMultidimensional(arr: string[], cols: number): string[][] {
//     const res = [];
//     let i = 0;
//     for (let index = 0; index < arr.length; index += cols) {
//         res[i++] = arr.slice(index, index + cols);
//     }
//     return res;
// }

/**
 * @param {{}} jsonFile base format from server
 * @returns {{}} result {..., "data":[adapted data], state: {}}
 */
function dataAdapter(jsonFile: ExerciseCardsModel): ExerciseCardsModelAdapted {
    const json = jsonFile;
    const labels = Object.entries(json.props)
        .filter((en) => en[0].startsWith('label'))
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map((en) => en[1]);
    const state = {
        counts: Array(json.data.length).fill(0),
        status: false,
        rows: json.data.length,
        row: 0,
        tabs: Array(labels.length).fill(true),
        card: parseInt(json.props.card),
    };
    state.tabs[state.card] = false;
    const result = {exercise: json.exercise, props: json.props, data: json.data, labels, state};
    return result;
}

export {Data};
