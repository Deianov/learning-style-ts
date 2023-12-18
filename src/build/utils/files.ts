'use strict';
import {Buffer} from 'node:buffer';
import {createReadStream, Dirent, existsSync, mkdirSync, promises, statSync, writeFileSync} from 'node:fs';
import {basename, resolve} from 'node:path';
import * as readline from 'node:readline';

// export const isFile = (f: string) => statSync(f).isFile();

const mkdir = (dir: string): void => {
    if (!existsSync(dir)) {
        mkdirSync(dir);
    }
};

const formatPath = (path: string): string => {
    const formatted = path.replaceAll('\\', '/').replaceAll('//', '/').replaceAll('//', '/');
    const first = formatted.charAt(0);
    const prefix: '/' | '' = first === '/' || first === '.' ? '' : '/';
    return prefix + formatted;
};

const write = async (fileName: string, content: Buffer): Promise<Buffer> => {
    const data = new Uint8Array(content);
    promises.writeFile(resolve(fileName), data, {encoding: 'binary'});
    return content;
};

const writeSync = (fileName: string, content: Buffer): Buffer => {
    const data = new Uint8Array(content);
    writeFileSync(resolve(fileName), data, {encoding: 'binary'});
    return content;
};

async function replaceString(fileName: string, regex: RegExp, replacement: string): Promise<void> {
    try {
        const contents = await promises.readFile(resolve(fileName), 'utf8');
        const replaced = contents.replace(regex, replacement);

        await promises.writeFile(resolve(fileName), replaced);
    } catch (err) {
        console.log(err);
    }
}

async function get(dir: string, recursive?: boolean, isFile?: boolean): Promise<string[]> {
    const dirents: Promise<Dirent[]> = promises.readdir(dir, {recursive, withFileTypes: true}).then((dirents) => {
        if (isFile !== undefined) {
            return dirents.filter((d) => (isFile ? d.isFile() : d.isDirectory()));
        }
        return dirents;
    });
    return (await dirents).map((dirent) => resolve(dirent.path, dirent.name));
}

const read = async (fileName: string): Promise<Buffer> => {
    return await promises.readFile(resolve(fileName));
};

const concat = (files: Buffer[]): Buffer => {
    const totalLength = files.map((f) => f.length).reduce((a, b) => a + b, 0) + files.length - 1;
    const res: Buffer = Buffer.alloc(totalLength, undefined, 'binary');
    let offset = 0;
    let i = 0;
    for (const file of files) {
        if (i > 0) {
            res.writeUint8(10, offset++); // \n
        }
        for (const bite of file) {
            res.writeUint8(bite, offset++);
        }
        i++;
    }
    return res;
};

const concatFolder = async (folder: string[] | string, outputFile: string): Promise<Buffer> => {
    const folders: string[] = typeof folder === 'string' ? await get(folder, false, true) : folder;

    return Promise.all(folders.map(read))
        .then((files) => concat(files))
        .then((outputString: Buffer) => write(outputFile, outputString));
};

type LineFilter = (line: string) => boolean;
type LineFormatter = (line: string) => string;
type LinesFormatter = (lines: string[]) => Promise<void>;
type ContentFormatter = (content: string) => Promise<string>;

interface Spy {
    read(line: string, fileName: string): void;
}

async function processFile(
    filePath: string,
    spy?: Spy,
    filters?: LineFilter[],
    formatters?: LineFormatter[],
    formatLines?: LinesFormatter,
    formatContent?: ContentFormatter,
): Promise<Buffer> {
    const fileStream = createReadStream(filePath);
    const lines: string[] = [];
    const name = basename(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        let res: string = line;

        spy?.read(line, name);
        res = filters?.some((f) => f(res)) ? '' : res;
        formatters?.forEach((formatter) => (res = formatter(res)));

        if (res) {
            lines.push(res);
        }
    }

    if (formatLines) {
        await formatLines(lines);
    }

    let result = lines.join('\n');

    if (formatContent) {
        result = await formatContent(result);
    }

    return Buffer.from(result);
}

export type {Spy, LineFilter, LineFormatter, LinesFormatter, ContentFormatter};
export {processFile, concat, concatFolder, read, get, write, writeSync, replaceString, formatPath, mkdir};
