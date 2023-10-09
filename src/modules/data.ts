import {APP_IS_STATIC, PATH_JSON} from './constants.js';
import {Cashable, Category, ExerciseDataModel, ExerciseInfoModel, ExerciseModel, ExercisePropsModel, Link} from './types/models.js';
import {localRepository} from './web.js';

/**
 *  cashing in memory
 */
const inMemoryRepository = (function () {
    const files: {[key: string]: Cashable} = {};
    return {
        existsByName(name: string): boolean {
            return files.hasOwnProperty(name);
        },
        getByName(name: string): Cashable {
            return files[name];
        },
        save(name: string, obj: Cashable): Cashable {
            // todo:
            // console.log(JSON.stringify(files));
            files[name] = obj;
            return this.getByName(name);
        },
        remove(name: string): void {
            if (this.existsByName(name)) {
                delete files[name];
            }
        },
        reset(): void {
            for (const key of Object.keys(files)) {
                delete files[key];
            }
        },
    };
})();

/**
 *  fetch server data
 */
const repository = (function () {
    const isStatic = APP_IS_STATIC;
    const server = PATH_JSON;

    // static
    async function fetchStatic(fileName: string): Promise<Cashable> {
        const req = server + (fileName.startsWith('/') ? '' : '/') + fileName + '.json';
        const res = await fetch(req);
        return await res.json();
    }

    // api
    // async function fetchApi(apiPath: string): Promise<Cashable> {
    //     // toDo: sendRequest(apiPath)
    //     const result: Promise<Cashable> = new Promise((resolve) => {
    //         setTimeout(() => {
    //             resolve('foo');
    //         }, 300);
    //     });
    //     return await result;
    // }

    return {
        async getByName(name: string): Promise<Cashable> {
            // switch between static/api version
            const fun = fetchStatic;
            return await fun(name);
        },
    };
})();

class Data {
    /**
     * @param {string} name Relative resource path. ("fileName" || path/filename)
     * @param {boolean} cashable
     * @param {boolean} adaptable
     */
    async getJson(name: string, cashable?: boolean, adaptable?: boolean): Promise<Cashable | null> {
        let res;
        if (cashable) {
            res = this.getCashable(name);
            if (res) {
                return res;
            }
        }
        res = await repository.getByName(name);
        if (!res) {
            return null;
        }
        if (adaptable) {
            // res = this.adapt(res);
            return null;
        }
        if (cashable) {
            res = inMemoryRepository.save(name, res);
        }
        return res;
    }
    private getCashable(name: string) {
        if (inMemoryRepository.existsByName(name)) {
            // console.debug("cashed: " + name + ".json")
            return inMemoryRepository.getByName(name);
        }
    }
    removeCached(): void {
        inMemoryRepository.reset();
    }
    // private adapt(json: string) {
    //     return dataAdapter(json);
    // }
}

function arrayToMultidimensional(arr: string[], cols: number): string[][] {
    const res = [];
    let i = 0;
    for (let index = 0; index < arr.length; index += cols) {
        res[i++] = arr.slice(index, index + cols);
    }
    return res;
}

export {Data};
