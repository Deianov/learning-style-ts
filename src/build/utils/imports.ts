'use strict';
import {Buffer} from 'node:buffer';
import {basename, extname, relative} from 'node:path';

import {BuffersMap} from './build.js';
import {formatPath, Spy} from './files.js';

// todo: ???
const RELATIVE_PATH_CORRECTION = 1;

type FileData = {
    dest: string;
    imports: ImportLine[];
    exports: ExportLine;
};

class ImportsManager implements Spy {
    private lines: Map<string, string[]> = new Map<string, string[]>();
    private files: Map<string, FileData> = new Map<string, FileData>();

    constructor() {}

    read(line: string, fileName: string): void {
        if (ImportLine.isImport(line)) {
            (this.lines.get(fileName) || this.lines.set(fileName, []).get(fileName))?.push(line);
        }
    }

    print() {
        this.files.forEach((value, key) => {
            console.log('[- ' + key + ' -]');
            console.log(value.dest);
            value.imports.forEach((imp) => imp.print());
            console.log(value.exports.toString());
        });
    }

    private getDestinationOfFile(fileName: string, buffersMap: BuffersMap): string {
        for (const [dest, buffersData] of buffersMap) {
            if (buffersData.destName === fileName || buffersData.files.includes(fileName)) {
                return dest;
            }
        }
        throw new Error('Not found buffers data for file: ' + fileName);
    }

    async processImports(buffersMap: BuffersMap): Promise<void> {
        // process destinations
        for (const [dest, buffersData] of buffersMap) {
            if (extname(dest) !== '.js') {
                continue;
            }
            const destName = basename(dest);

            if (this.files.has(destName)) {
                const msg = 'Duplicated destination name: ' + destName;
                throw Error(msg);
            }
            this.files.set(destName, {dest, imports: [], exports: new ExportLine()});
        }

        // process imports
        for (const [fileName, lines] of this.lines) {
            const dest = this.getDestinationOfFile(fileName, buffersMap);
            const fileData = this.files.get(basename(dest));

            for (const line of lines) {
                const parse = ImportLine.parse(line);

                if (parse) {
                    const destOfFrom = this.getDestinationOfFile(basename(parse.from), buffersMap);

                    // set the new project destination of 'from'
                    parse.from = destOfFrom;
                    const importLine = new ImportLine(dest, parse);
                    const exportLine = this.files.get(basename(destOfFrom))?.exports;

                    // skip imports with same (from, to) destination
                    if (importLine.isValid()) {
                        fileData?.imports.push(importLine);
                        parse.imports.forEach((imp) => exportLine?.exports.add(imp));
                    }
                }
            }
        }

        // concatenated files, that have the same import -> concat imports with the same 'from' destination
        for (const [destName, fileData] of this.files) {
            const byFrom: Map<string, ImportLine> = new Map<string, ImportLine>();

            for (const importLine of fileData.imports) {
                if (byFrom.has(importLine.from)) {
                    byFrom.get(importLine.from)?.concat(importLine.imports);
                } else {
                    byFrom.set(importLine.from, importLine);
                }
            }
            fileData.imports = Array.from(byFrom.values());
        }

        // append to buffers
        for (const [destName, fileData] of this.files) {
            const buffersData = buffersMap.get(fileData.dest);

            // imports
            const importsString = fileData.imports
                .filter(Boolean)
                .map((imp) => imp.toString())
                .join('\n');
            if (importsString) {
                buffersData?.buffers.unshift(Buffer.from(importsString));
            }

            // exports
            const exportsString: string = fileData.exports.toString();
            if (exportsString) {
                buffersData?.buffers.push(Buffer.from(exportsString));
            }
        }
    }
}

/* eslint-disable-next-line no-useless-escape */
const REGEXP_IMPORT_LINE: RegExp = /import\s?([\w\s]+)?,?\s?{?([\w\s,]+)}?\s?from\s?['|"]([\w.\\\/]+)['|"];/;

class ImportLine {
    public file: string;
    public from: string;
    public imports: string[] = [];

    constructor(file: string, parse?: {imports: string[]; from: string}) {
        this.file = file;
        this.from = parse?.from || '';
        this.concat(parse?.imports);
    }

    static isImport(line: string): boolean {
        if (line.startsWith('import ')) {
            if (line.startsWith('import *')) {
                throw new Error('Not supported import format: ' + line);
            }
            return true;
        }
        return false;
    }

    isValid(): boolean {
        return this.from !== undefined && basename(this.from) !== basename(this.file);
    }

    static getDestination(from: string, to: string) {
        const rel = formatPath(relative(formatPath(from), formatPath(to)));
        return rel.slice(RELATIVE_PATH_CORRECTION);
    }

    static parse(line: string): {imports: string[]; from: string} | undefined {
        if (ImportLine.isImport(line)) {
            const match: RegExpExecArray | null = REGEXP_IMPORT_LINE.exec(line);

            if (match) {
                const [, def, imps, from] = match;

                const imports: string[] = imps
                    .split(',')
                    .map((name) => name.trim())
                    .filter(Boolean);

                if (imports.length > 0 && from.trim()) {
                    return {imports, from: from.trim()};
                }
            } else {
                throw new Error('Unable to parse import line: ' + line);
            }
        }
        return undefined;
    }

    concat(imports?: string[]): void {
        if (imports) {
            for (const i of imports) {
                if (i && !this.imports.includes(i)) {
                    this.imports.push(i);
                }
            }
        }
    }

    toString(): string {
        if (this.from && this.imports.length > 0) {
            return `import {${this.imports.join(', ')}} from '${ImportLine.getDestination(this.file, this.from)}';`;
        }
        return '';
    }

    print() {
        console.log(JSON.stringify(this.imports));
    }
}

class ExportLine {
    private static EXPORT_PREFIX = 'export ';
    private static EXPORT_PREFIX_SKIP = 'export default';
    private static SAVE = ['const', 'let', 'var', 'class', 'function', 'async'];
    private static REMOVE = ['export {}'];
    public exports: Set<string> = new Set();

    constructor() {}

    static isExport(line: string): boolean {
        return line.startsWith(ExportLine.EXPORT_PREFIX) && !line.startsWith(ExportLine.EXPORT_PREFIX_SKIP);
    }

    static removeExportLine(line: string): string {
        if (!ExportLine.isExport(line)) {
            return line;
        }

        for (const item of ExportLine.SAVE) {
            if (line.startsWith(ExportLine.EXPORT_PREFIX + item)) {
                return line.slice(ExportLine.EXPORT_PREFIX.length);
            }
        }
        return '';
    }

    toString(): string {
        if (this.exports.size > 0) {
            const exports = Array.from(this.exports.values()).filter(Boolean).sort().join(', ');
            return `export {${exports}};`;
        }
        return '';
    }
}

export {ImportsManager, ImportLine, ExportLine};
