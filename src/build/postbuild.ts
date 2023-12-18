'use strict';
import {Builder, Task} from './utils/build.js';
import {Formatter} from './utils/formatters.js';
import {ImportsManager} from './utils/imports.js';

console.log('Postbuild formats...');

const PROJECT_PATH = process.cwd();
const importsManager = new ImportsManager();
const formatter = new Formatter();
Formatter.setSpy('JS', importsManager);

/**
 * {src = '?...'}: dest = path.join(PROJECT_ROOT, '?', dest);
 * {formatter = true} formatter = formatter.getDefaultFormatter();
 */
const PROJECT_TASKS: Task[] = [
    {dest: 'main.js', src: 'dist/...', formatter: true},
    // modules.js
    {
        dest: '/modules/app.js',
        concat: [
            {src: '/dist/modules/constants.js'},
            {src: '/dist/modules/utils'},
            {src: '/dist/modules/data.js'},
            {src: '/dist/modules/factory.js'},
            {src: '/dist/modules/web.js'},
            {src: '/dist/modules/components'},
            {src: '/dist/modules/components/cards'},
            {src: '/dist/modules/components/maps/country.js'},
            {src: '/dist/modules/components/quizzes'},
            {src: '/dist/modules/routes'},
            {src: '/dist/modules/services/exercise.js'},
            {src: '/dist/modules/app.js', formatter: formatter.processJSFileSkipMinify},
        ],
        formatter: true,
    },
    // services
    {dest: '/modules/services/flashcards.js', src: 'dist...', formatter: true},
    {dest: '/modules/services/quizzes.js', src: 'dist/...', formatter: true},
    {dest: '/modules/services/maps.js', src: '/dist...', formatter: true},
    // components
    {dest: '/modules/components/maps/maps-de.js', src: '/dist/...'},
    {dest: '/modules/components/maps/maps-de-full.js', src: '/dist/modules/components/maps/maps-de-full.js'},
    // HTML/CSS
    {dest: 'index.html', formatter: formatter.processHtmlFile},
    {dest: 'login.html', formatter: formatter.processHtmlFile},
    {dest: 'style.css', formatter: formatter.processCssFile},
    // other
    {dest: '/json'},
    {dest: '/assets/fonts'},
    {dest: '/assets/images/loaders'},
    {dest: '/assets/images/award.svg'},
    {dest: 'favicon.ico'},
    {dest: 'README.md'},
    {dest: 'robots.txt'},
];

const builder = new Builder(PROJECT_PATH, PROJECT_TASKS, formatter);
await builder.init();
await builder.buildBuffers();
await importsManager.processImports(builder.getBuffers());
await builder.toPublic();
await builder.cpSync('C:/dev/tomcat/webapps/ROOT/');
