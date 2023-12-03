'use strict';
import {build} from './utils/builders.js';
import {deployToTomcat} from './utils/deploy.js';
import * as files from './utils/files.js';
import * as formatters from './utils/formatters.js';

console.log('Postbuild formats...');
const PROJECT = 'D:/Development/github/learning-style-ts/';
const PROJECT_JS = PROJECT + 'dist/';
const PUBLIC = PROJECT + 'public/';

files.mkdir(PUBLIC);
files.mkdir(PUBLIC + 'modules');
files.mkdir(PUBLIC + 'modules/services');
files.mkdir(PUBLIC + 'modules/components');
files.mkdir(PUBLIC + 'modules/components/maps');

const projectJsFiles = [
    {copy: 'main.js'},
    // modules.js
    {concat: 'modules/constants.js', formatter: formatters.processJSConstantsFile},
    {concat: 'modules/utils'},
    {concat: 'modules/data.js'},
    {concat: 'modules/factory.js'},
    {concat: 'modules/web.js'},
    {concat: 'modules/components'},
    {concat: 'modules/components/cards'},
    {concat: 'modules/components/maps/country.js'},
    {concat: 'modules/components/quizzes'},
    {concat: 'modules/routes'},
    {concat: 'modules/services/exercise.js'},
    {concat: 'modules/modules.js', formatter: formatters.processJSFileSkipMinify},
    // {concatString: 'export {Timer, TimerOption, ScopeCounter, removeHTML, }'},
    // modules/services
    {format: 'modules/services/flashcards.js', formatter: formatters.processJSFileSaveModulesImports},
    {format: 'modules/services/quizzes.js', formatter: formatters.processJSFileSaveModulesImports},
    {format: 'modules/services/maps.js', formatter: formatters.processJSFileSaveModulesImports},
    // modules/components
    {copy: 'modules/components/maps/maps-de.js'},
    {copy: 'modules/components/maps/maps-de-full.js'},
];

const projectFiles = [
    // HTML/CSS
    {format: 'index.html', formatter: formatters.processHtmlFile},
    {format: 'login.html', formatter: formatters.processHtmlFile},
    {format: 'style.css', formatter: formatters.processCssFile},
    // other
    {copy: 'json'},
    {copy: 'assets/fonts'},
    {copy: 'assets/images/loaders'},
    {copy: 'assets/images/award.svg'},
    {copy: 'favicon.ico'},
    {copy: 'README.md'},
    {copy: 'robots.txt'},
];

// BUILD
const jsSingleFile: Buffer[] = await build(PROJECT_JS, PUBLIC, projectJsFiles, formatters.processJSFile);
let promise;
promise = await files.write(PUBLIC + 'modules/modules.js', files.concat(jsSingleFile));
promise = await build(PROJECT, PUBLIC, projectFiles);

// DEPLOY
deployToTomcat(PUBLIC);
