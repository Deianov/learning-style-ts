'use strict';
import {DateUtils} from '../modules/utils/numbers.js';
import * as files from './utils/files.js';

console.log('Prebuild formats...');

const DATE_STRING = DateUtils.getDateString();
const REGEXP_DATE = /^[\d]{2}.[\d]{2}.[\d]{4}$/;
const REGEXP_CONST_VERSION = /(APP_VERSION = '[\d]{2}.[\d]{2}.[\d]{4}';)/;
const REGEXP_HREF_PARAM_VERSION = /(\?v=[\d]{2}.[\d]{2}.[\d]{4})/g;

if (!new RegExp(REGEXP_DATE).test(DATE_STRING)) {
    const msg = 'Date string does not match the RegExp: ' + DATE_STRING;
    throw Error(msg);
}

const PROJECT_PATH = process.cwd();

await files.replaceString(PROJECT_PATH + '/src/modules/constants.ts', REGEXP_CONST_VERSION, `APP_VERSION = '${DATE_STRING}';`);
await files.replaceString(PROJECT_PATH + '/index.html', REGEXP_HREF_PARAM_VERSION, `?v=${DATE_STRING}`);
await files.replaceString(PROJECT_PATH + '/login.html', REGEXP_HREF_PARAM_VERSION, `?v=${DATE_STRING}`);
