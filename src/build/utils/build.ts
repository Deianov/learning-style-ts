'use strict';
import {Buffer} from 'node:buffer';
import {copyFileSync, cpSync, existsSync} from 'node:fs';
import {mkdir, rm} from 'node:fs/promises';
import {basename, default as nodePath} from 'node:path';

import * as files from './files.js';

interface Formatter {
    getDefaultFormatter(): CallbackFormatter;
}
type CallbackFormatter = (fileName: string) => Promise<Buffer>;
export type BuffersData = {destName: string; files: string[]; buffers: Buffer[]};
export type BuffersMap = Map<string, BuffersData>;

export type Task = {
    dest: string;
    src?: string;
    formatter?: CallbackFormatter | true;
    concat?: {src: string; formatter?: CallbackFormatter}[];
};

export class Builder {
    private static PUBLIC_DIRECTORY_NAME = 'public';
    private rootPath: string;
    private publicPath: string;
    private tasks: Task[];
    private buffers?: BuffersMap;
    private formatter: Formatter;

    constructor(rootPath: string, tasks: Task[], formatter: Formatter) {
        this.rootPath = rootPath;
        this.publicPath = nodePath.join(rootPath, Builder.PUBLIC_DIRECTORY_NAME);
        this.tasks = tasks;
        this.formatter = formatter;
    }

    async init(): Promise<void> {
        await updateSourcePathsFromRelativeToFull(this.rootPath, this.tasks);
        await removeProjectSubfolder(this.rootPath, Builder.PUBLIC_DIRECTORY_NAME);
    }

    async buildBuffers(): Promise<BuffersMap> {
        this.buffers = await createBuffersFromTasks(this.tasks, this.formatter.getDefaultFormatter());
        return this.buffers;
    }

    async toPublic(): Promise<void> {
        if (this.buffers) {
            await writeBuffersToDestination(this.publicPath, this.buffers);
        }
    }

    async cpSync(dest: string): Promise<void> {
        if (existsSync(dest) && existsSync(this.publicPath)) {
            console.log('Sync public to: ' + dest);
            cpSync(this.publicPath, dest, {recursive: true});
        }
    }

    getBuffers(): BuffersMap {
        if (!this.buffers) {
            throw Error('Buffers map is undefined!');
        }
        return this.buffers;
    }

    printTasks() {
        this.tasks.forEach((task) => console.log(task));
    }
    printBuffers() {
        this.buffers?.forEach((value, key) => console.log(key + ': ' + value.destName + '; ' + JSON.stringify(value.files)));
    }
}

async function createBuffersFromTasks(tasks: Task[], defaultFormatter?: CallbackFormatter): Promise<BuffersMap> {
    const buffersMap: BuffersMap = new Map<string, BuffersData>();

    const createBuffersMapObject = (dest: string): void => {
        if (buffersMap.has(dest)) {
            throw new Error('Duplicated destination : ' + dest);
        }

        buffersMap.set(dest, {destName: basename(dest), files: [], buffers: []});
    };
    const addToBuffersMap = (dest: string, fileName: string, buffer: Buffer): void => {
        const obj = buffersMap.get(dest);
        obj?.files.push(basename(fileName));
        obj?.buffers.push(buffer);
    };
    const createBuffer = async (src: string, formatter?: CallbackFormatter | undefined): Promise<Buffer> => {
        return await (formatter ? formatter(src) : files.read(src));
    };

    let formatter: CallbackFormatter | undefined;
    let buffer;

    for (const task of tasks) {
        formatter = task.formatter === true ? defaultFormatter : task.formatter;
        const {dest, src, concat} = task;

        if (concat) {
            createBuffersMapObject(dest);

            for (const obj of concat) {
                const fileFormatter = obj.formatter ?? formatter;

                if (nodePath.extname(obj.src)) {
                    addToBuffersMap(dest, obj.src, await createBuffer(obj.src, fileFormatter));
                } else {
                    const folder: string[] = await files.get(obj.src, false, true);

                    for (const fileName of folder) {
                        addToBuffersMap(dest, fileName, await createBuffer(fileName, fileFormatter));
                    }
                }
            }
        } else if (src) {
            if (nodePath.extname(src)) {
                createBuffersMapObject(dest);
                addToBuffersMap(dest, src, await createBuffer(src, formatter));
            } else {
                const tree: string[] = await files.get(src, true, true);

                for (const fileName of tree) {
                    const subDest = nodePath.join(dest, fileName.slice(src.length));
                    createBuffersMapObject(subDest);
                    addToBuffersMap(subDest, fileName, await createBuffer(fileName, formatter));
                }
            }
        } else {
            throw new Error('Not found src for destination: ' + dest);
        }
    }
    return buffersMap;
}

async function updateSourcePathsFromRelativeToFull(rootDirectory: string, tasks: Task[]) {
    const errors: string[] = [];
    let file;
    const isExits = (src: string): boolean => {
        return existsSync(src);
    };

    for (const task of tasks) {
        const {src, dest} = task;

        if (!dest) {
            const msg = 'Invalid BuildTask: dest is required!';
            throw new Error(msg);
        }

        if (task.concat) {
            for (const obj of task.concat) {
                file = nodePath.join(rootDirectory, obj.src);
                if (isExits(file)) {
                    obj.src = file;
                } else {
                    errors.push('Not found src: ' + obj.src);
                }
            }
            continue;
        }

        if (src) {
            if (src.slice(-3) === '...') {
                file = nodePath.join(rootDirectory, src.slice(0, -3), dest);
            } else {
                file = nodePath.join(rootDirectory, src);
            }
        } else {
            file = nodePath.join(rootDirectory, dest);
        }

        if (isExits(file)) {
            task.src = file;
        } else {
            errors.push('Not found src: ' + (task.src || task.dest));
        }
    }

    if (errors.length > 0) {
        console.log('\nPROJECT_BUILD:');
        errors.forEach((err) => console.log(err));
        console.log('\n');
        throw new Error('Unable to process sources.');
    }
}

async function writeBuffersToDestination(dir: string, buffersMap: BuffersMap): Promise<void> {
    for (const [dest, obj] of buffersMap) {
        const buffer = files.concat(obj.buffers);
        const filePath = nodePath.join(dir, dest);
        await mkdir(nodePath.dirname(filePath), {recursive: true});
        await files.write(filePath, buffer);
    }
}

async function removeProjectSubfolder(projectPath: string, folderName: string): Promise<void> {
    const MIN_PATH_DEPTH = 5;
    const ALLOWED = ['public'];
    const pathToRemove = nodePath.join(projectPath, folderName);
    const depth = pathToRemove.split(nodePath.sep).length;

    if (!ALLOWED.includes(folderName)) {
        console.log('Unable to remove project subfolder: Not allowed: ' + folderName);
        return;
    }

    if (depth < MIN_PATH_DEPTH) {
        console.log('Unable to remove project subfolder with depth: ' + depth);
        return;
    }

    if ((await files.get(projectPath, false, false)).includes(pathToRemove)) {
        await rm(pathToRemove, {recursive: true, force: true});
    } else {
        console.log('Unable to remove project subfolder: Not found: ' + pathToRemove);
    }
}
