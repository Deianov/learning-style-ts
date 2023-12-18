'use strict';
import {minify as minifyHTMLFile} from 'html-minifier-terser';
// to import node_modules -> tsconfig.json -> module: NodeNext, moduleResolution: NodeNext
import {minify, MinifyOutput} from 'terser';

import * as files from './files.js';
import {ExportLine, ImportLine} from './imports.js';

// utils
function replaceString(text: string, search: string, replace: string): string {
    const index = text.indexOf(search);
    if (index > -1) {
        return text.slice(0, index) + replace + text.slice(index + search.length);
    }
    return text;
}

// format
const changeSrc = (line: string): string => {
    return replaceString(line, 'dist/main.js', 'main.js');
};

// minify
const minifyJS = async (content: string): Promise<string> => {
    return (await minify(content)).code || '';
};
const minifyHTML = async (content: string): Promise<string> => {
    return await minifyHTMLFile(content, {
        html5: true,
        removeComments: true,
        collapseWhitespace: true,
    });
};
const minifyCSS = async (content: string): Promise<string> => {
    return await minifyHTMLFile(content, {
        minifyCSS: true,
        removeComments: true,
        collapseWhitespace: true,
    });
};

const EXT_NAMES = ['JS', 'CSS', 'HTML'] as const;
type Spies = {[key in (typeof EXT_NAMES)[number]]?: files.Spy};

export class Formatter {
    private static spies: Spies = {};
    private static default = Formatter.prototype.processJSFile;

    constructor() {}

    getDefaultFormatter() {
        return Formatter.default;
    }

    static setSpy(extname: keyof Spies, spy: files.Spy): void {
        Formatter.spies[extname] = spy;
    }
    static getSpy(extname: keyof Spies): files.Spy | undefined {
        return Formatter.spies[extname];
    }

    async processJSFile(fileName: string): Promise<Buffer> {
        return files.processFile(
            fileName,
            Formatter.getSpy('JS'),
            [ImportLine.isImport],
            [ExportLine.removeExportLine],
            undefined,
            minifyJS,
        );
    }
    async processJSFileSkipMinify(fileName: string): Promise<Buffer> {
        return files.processFile(fileName, Formatter.getSpy('JS'), [ImportLine.isImport], [ExportLine.removeExportLine], undefined);
    }
    async processHtmlFile(fileName: string): Promise<Buffer> {
        return files.processFile(fileName, undefined, undefined, [changeSrc], undefined, minifyHTML);
    }
    async processCssFile(fileName: string): Promise<Buffer> {
        return files.processFile(fileName, undefined, undefined, undefined, undefined, minifyCSS);
    }
}
