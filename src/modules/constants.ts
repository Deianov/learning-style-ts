import {TagName} from './types/utils.js';

// CONSTANTS: SYSTEM
export const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
export const IS_DARK_MODE = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const IS_BROWSER = typeof window === 'object' && typeof document === 'object';
export const IS_HTTPS = location.protocol === 'https:';

// CONSTANTS: APP
export const APP_NAME = 'learning-style';
export const APP_TITLE = 'Learning-Style';
export const APP_IS_STATIC = true;
export const production = false;
export const APP_VERSION = '18.12.2023';
export const APP_LANG = 'en';
/** keyboard - 1: default, 2: virtual, 4: virtual (only word keys) **/
export const APP_KEYBOARD: {mode: number; size: number} = {mode: IS_MOBILE ? 2 : 1, size: 0};

// CONSTANTS: DEVELOPMENT STATE
const USER: {username?: string; pass?: string} = {};
export default USER;
export let INFO_STRING = `state: ${production ? 'production' : 'development'}, version: ${APP_VERSION} (${
    APP_IS_STATIC ? 'static' : 'api'
}), `;
INFO_STRING += IS_MOBILE ? 'mobile OS: ' : 'OS: ';
INFO_STRING += navigator.userAgent;
INFO_STRING += IS_DARK_MODE ? ', DarkMode' : '';
document.getElementsByClassName('version')[0]!.textContent = INFO_STRING;
export const CSS_COLORS = [
    {name: 'white', colors: ['white']},
    {name: 'black', colors: ['black']},
    {name: 'dark', colors: ['#373737']},
    {name: 'green', colors: ['#28a745']},
    {name: 'red', colors: ['#dc3545']},
    {name: 'orange', colors: ['#ff6600']},
    {name: '-', colors: ['']},
    {name: 'gray-dark', colors: ['#333333']},
    {name: 'gray', colors: ['#646464']},
    {name: 'gray-light', colors: ['#959595']},
    {name: 'gray-text', colors: ['#cacaca']},
    {name: 'gray-line', colors: ['#dedede']},
    {name: '--', colors: ['']},
    {name: 'light-red', colors: ['#feaec8']},
    {name: 'light-blue', colors: ['#99d9e9']},
    {name: 'light-yellow', colors: ['#efe4b0']},
    {name: 'light-pink', colors: ['#c7bfe6']},
    {name: '---', colors: ['']},
    {name: 'links', colors: ['#0275d8']},
    {name: 'color-bg', colors: ['#f1f1f1']},
    {name: 'color-bg-hover', colors: ['#ddd']},
    {name: 'hover', colors: ['#1795ec']},
    {name: 'active', colors: ['#4299E1']},
    {name: 'border', colors: ['#ccc']},
    {name: 'submit', colors: ['#4caf50']},
    {name: 'submit-hover', colors: ['#45a049']},
    {name: 'logo', colors: ['#517cc6']},
    {name: '----', colors: ['']},
    {name: 'success', colors: ['#c1ffde', '#c1ffde', '#dbfff8']},
    {name: 'danger', colors: ['#ffcede']},
    {name: 'error', colors: ['#e00']},
    {name: 'info', colors: ['#4299E1']},
    {name: 'alert-success', colors: ['#00A4A6']},
];

// CONSTANTS: SERVER
export const PATH_LOCAL = 'http://192.168.0.52:3000';
export const PATH_RELATIVE = '.';
export const PATH_URL = '.';
export const PATH_API = './api';
export const PATH_JSON = './json';

// CONSTANTS: DOM
/**
    <header>
        <nav class="navbar">
        <main>
            <aside>
            <article>
                <header id="header">
                <section id="control">
                <section id="content">
                <section id="messages">
                <section id="bottom">
    <footer>
            <span id="cdate">
*/
export const DOM_PAGEHEADER_TAGNAME: TagName = 'header';
export const DOM_MENU_CLASSNAME = 'navbar';
export const DOM_TOPICS_PARENT_TAGNAME: TagName = 'aside';
export const DOM_ARTICLE_TAGNAME: TagName = 'article';
export const DOM_HEADER_ID = 'header';
export const DOM_CONTROL_ID = 'control';
export const DOM_CONTENT_ID = 'content';
export const DOM_MESSAGES_ID = 'messages';
export const DOM_BOTTOM_ID = 'bottom';
export const DOM_CDATE_ID = 'cdate';
export const DOM_BREADCRUMB_CLASSNAME = 'breadcrumb';
export const DOM_BREADCRUMB_TAGNAME: TagName = 'ul';
export const DOM_SUBJECT_CLASSNAME = 'subject';
export const DOM_NOTIFY_CLASSNAME = 'notify-box';

export const CLASSNAME_FOCUS = 'focus';

// CONSTANTS ASSETS
export const ASSETS_LOADER_PUFF = `<img src="./assets/images/loaders/puff.svg" alt="loader" width="60" height="60"></img>`;
export const DEBUG_CONTENT = `<svg id="kiwi" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" viewBox="0 65.326 612 502.174" enable-background="new 0 65.326 612 502.174" xml:space="preserve"><ellipse class="ground" cx="283.5" cy="487.5" rx="259" ry="80"/><path class="kiwi" d="M210.333,65.331C104.367,66.105-12.349,150.637,1.056,276.449c4.303,40.393,18.533,63.704,52.171,79.03 c36.307,16.544,57.022,54.556,50.406,112.954c-9.935,4.88-17.405,11.031-19.132,20.015c7.531-0.17,14.943-0.312,22.59,4.341 c20.333,12.375,31.296,27.363,42.979,51.72c1.714,3.572,8.192,2.849,8.312-3.078c0.17-8.467-1.856-17.454-5.226-26.933 c-2.955-8.313,3.059-7.985,6.917-6.106c6.399,3.115,16.334,9.43,30.39,13.098c5.392,1.407,5.995-3.877,5.224-6.991 c-1.864-7.522-11.009-10.862-24.519-19.229c-4.82-2.984-0.927-9.736,5.168-8.351l20.234,2.415c3.359,0.763,4.555-6.114,0.882-7.875 c-14.198-6.804-28.897-10.098-53.864-7.799c-11.617-29.265-29.811-61.617-15.674-81.681c12.639-17.938,31.216-20.74,39.147,43.489 c-5.002,3.107-11.215,5.031-11.332,13.024c7.201-2.845,11.207-1.399,14.791,0c17.912,6.998,35.462,21.826,52.982,37.309 c3.739,3.303,8.413-1.718,6.991-6.034c-2.138-6.494-8.053-10.659-14.791-20.016c-3.239-4.495,5.03-7.045,10.886-6.876 c13.849,0.396,22.886,8.268,35.177,11.218c4.483,1.076,9.741-1.964,6.917-6.917c-3.472-6.085-13.015-9.124-19.18-13.413 c-4.357-3.029-3.025-7.132,2.697-6.602c3.905,0.361,8.478,2.271,13.908,1.767c9.946-0.925,7.717-7.169-0.883-9.566 c-19.036-5.304-39.891-6.311-61.665-5.225c-43.837-8.358-31.554-84.887,0-90.363c29.571-5.132,62.966-13.339,99.928-32.156 c32.668-5.429,64.835-12.446,92.939-33.85c48.106-14.469,111.903,16.113,204.241,149.695c3.926,5.681,15.819,9.94,9.524-6.351 c-15.893-41.125-68.176-93.328-92.13-132.085c-24.581-39.774-14.34-61.243-39.957-91.247 c-21.326-24.978-47.502-25.803-77.339-17.365c-23.461,6.634-39.234-7.117-52.98-31.273C318.42,87.525,265.838,64.927,210.333,65.331 z M445.731,203.01c6.12,0,11.112,4.919,11.112,11.038c0,6.119-4.994,11.111-11.112,11.111s-11.038-4.994-11.038-11.111 C434.693,207.929,439.613,203.01,445.731,203.01z"/></svg>`;
export const QUIZ_CORRECT_QUESTION_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" shape-rendering="geometricPrecision"><path d="M20 6L9 17l-5-5"/></svg>`;
