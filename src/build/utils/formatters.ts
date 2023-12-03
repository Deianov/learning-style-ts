import {minify as minifyHTML} from 'html-minifier-terser';
// to import node_modules -> tsconfig.json -> module: NodeNext, moduleResolution: NodeNext
import {minify, MinifyOutput} from 'terser';

import {DateUtils} from '../../modules/utils/numbers.js';
import * as files from './files.js';

const DATE_STRING = DateUtils.getDateString();

// utils
function replaceString(text: string, search: string, replace: string): string {
    const index = text.indexOf(search);
    if (index > -1) {
        return text.slice(0, index) + replace + text.slice(index + search.length);
    }
    return text;
}
function replaceStringWithPrefix(text: string, prefix: string, replace: string): string {
    const index = text.indexOf(prefix);
    if (index > -1) {
        const len = prefix.length + replace.length;
        return text.slice(0, index) + prefix + replace + text.slice(index + len);
    }
    return text;
}

// filters
const filterImports = (line: string): boolean => {
    return line.startsWith('import');
};
const filterImportsWithoutModules = (line: string): boolean => {
    return line.startsWith('import') && !line.includes('modules.js');
};

// format
const formatExports = (line: string): string => {
    const exportSpace = 'export ';

    // not found export or save exports;
    if (!line.startsWith(exportSpace) || line.startsWith('export {') || line.startsWith('export default')) {
        return line;
    }

    if (
        line.startsWith('export const') ||
        line.startsWith('export let') ||
        line.startsWith('export var') ||
        line.startsWith('export class') ||
        line.startsWith('export function') ||
        line.startsWith('export async')
    ) {
        return line.slice(exportSpace.length);
    }
    return '';
};
const formatChangeAppVersion = (line: string): string => {
    return replaceStringWithPrefix(line, 'const APP_VERSION = ', `'${DATE_STRING}'`);
};
const formatChangeHrefVersion = (line: string): string => {
    return replaceStringWithPrefix(line, '?v=', DATE_STRING);
};
const formatChangeSrc = (line: string): string => {
    return replaceString(line, 'dist/main.js', 'main.js');
};

// minify
const formatMinifyJS = async (content: string): Promise<string> => {
    return (await minify(content)).code || '';
};
const formatMinifyHTML = async (content: string): Promise<string> => {
    return await minifyHTML(content, {
        html5: true,
        removeComments: true,
        collapseWhitespace: true,
    });
};
const formatMinifyCSS = async (content: string): Promise<string> => {
    return await minifyHTML(content, {
        minifyCSS: true,
        removeComments: true,
        collapseWhitespace: true,
    });
};

// formatters
export const processJSFile = async (fileName: string): Promise<Buffer> => {
    return files.processFile(fileName, [filterImports], [formatExports], formatMinifyJS);
};
export const processJSFileSkipMinify = async (fileName: string): Promise<Buffer> => {
    return files.processFile(fileName, [filterImports], [formatExports]);
};
export const processJSFileSaveModulesImports = async (fileName: string): Promise<Buffer> => {
    return files.processFile(fileName, [filterImportsWithoutModules], undefined, formatMinifyJS);
};
export const processJSConstantsFile = async (fileName: string): Promise<Buffer> => {
    return files.processFile(fileName, [filterImports], [formatExports, formatChangeAppVersion], formatMinifyJS);
};
export const processHtmlFile = async (fileName: string): Promise<Buffer> => {
    return files.processFile(fileName, undefined, [formatChangeHrefVersion, formatChangeSrc], formatMinifyHTML);
};
export const processCssFile = async (fileName: string): Promise<Buffer> => {
    // return files.read(fileName);
    return files.processFile(fileName, undefined, undefined, formatMinifyCSS);
};
