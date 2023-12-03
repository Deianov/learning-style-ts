import {copyFileSync, cpSync} from 'node:fs';

import * as files from './files.js';

type Formatter = (fileName: string) => Promise<Buffer>;
type Commands = {
    concat?: string;
    concatString?: string;
    format?: string;
    copy?: string;
    formatter?: Formatter;
};

export async function build(src: string, dest: string, commands: Commands[], defaultFormatter?: Formatter): Promise<Buffer[]> {
    const buffers: Buffer[] = [];

    for (const obj of commands) {
        const formatter = obj.formatter ?? defaultFormatter;
        const path = obj.concat || obj.format || obj.copy;
        const srcPath = src + path;
        const destPath = dest + path;

        if (obj.concat && formatter) {
            if (srcPath.slice(-3) === '.js') {
                const buffer = await formatter(srcPath);
                buffers.push(buffer);
            } else {
                const names = await files.readFolder(srcPath);
                names.map((name) => formatter(name)).forEach(async (buffer) => buffers.push(await buffer));
            }
        }

        if (obj.concatString) {
            buffers.push(Buffer.from(obj.concatString));
        }

        if (obj.format && formatter) {
            const buffer = await formatter(srcPath);
            await files.write(destPath, buffer);
        }

        if (obj.copy) {
            if (srcPath.slice(-6).includes('.')) {
                copyFileSync(srcPath, destPath);
            } else {
                cpSync(srcPath, destPath, {recursive: true});
            }
        }
    }
    return buffers;
}
