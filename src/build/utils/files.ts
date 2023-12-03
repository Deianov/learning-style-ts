import {Buffer} from 'node:buffer';
import {createReadStream, existsSync, mkdirSync, promises as fs, statSync} from 'node:fs';
import {join, resolve} from 'node:path';
import readline from 'readline';
// to import node_modules -> tsconfig.json -> module: NodeNext, moduleResolution: NodeNext
import {minify, MinifyOutput} from 'terser';

const log = (str: string | number) => console.log(str);
export const isFile = (f: string) => statSync(f).isFile();

export const mkdir = (dir: string): void => {
    if (!existsSync(dir)) {
        mkdirSync(dir);
    }
};

export const write = async (fileName: string, str: Buffer): Promise<Buffer> => {
    const promise = await fs.writeFile(resolve(fileName), str);
    return str;
};

export const readFolder = async (folderName: string): Promise<string[]> => {
    const res: string[] = await fs.readdir(resolve(folderName));
    const files: string[] = res.map((file) => join(folderName, file));
    return files.filter(isFile);
};

export const read = (fileName: string): Promise<Buffer> => {
    return fs.readFile(resolve(fileName));
};

export const concat = (files: Buffer[]): Buffer => {
    const totalLength = files.map((f) => f.length).reduce((a, b) => a + b, 0) + files.length;
    const res: Buffer = Buffer.alloc(totalLength, undefined, 'utf-8');
    let offset = 0;
    for (const file of files) {
        for (const bite of file) {
            // res.writeInt8(bite, offset++); // signed 8 bit integer: -128 to 127
            res.writeUint8(bite, offset++);
        }
        res.writeUint8(10, offset++); // \n
    }
    return res;
};

export const concatFolder = async (folder: string[] | string, outputFile: string): Promise<Buffer> => {
    const folders: string[] = typeof folder === 'string' ? await readFolder(folder) : folder;

    return Promise.all(folders.map(read))
        .then((files) => concat(files))
        .then((outputString: Buffer) => write(outputFile, outputString));
};

export type CallbackFilter = (line: string) => boolean;
export type CallbackFormatter = (line: string) => string;
export type CallbackMinify = (content: string) => Promise<string>;

export const processFile = async (
    fileName: string,
    filters?: CallbackFilter[],
    formatters?: CallbackFormatter[],
    minify?: CallbackMinify,
): Promise<Buffer> => {
    const fileStream = createReadStream(fileName);
    const lines: string[] = [];

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        let res: string = line;

        if (filters && res && filters.some((f) => f(res))) {
            res = '';
        }

        if (formatters && res) {
            for (const formatter of formatters) {
                res = formatter(res);
            }
        }

        if (res) {
            lines.push(res);
        }
    }

    let result = lines.join('\n');
    if (minify) {
        result = await minify(result);
    }

    return Buffer.from(result);
};

// minify(content.toString('utf-8')).then((min: MinifyOutput) => files.write(outputMin, Buffer.from(min.code || '')));
