import {cpSync} from 'node:fs';

// sync to Tomcat
const TOMCAT_ROOT = 'C:/dev/tomcat/webapps/ROOT/';

export function deployToTomcat(src: string) {
    cpSync(src, TOMCAT_ROOT, {recursive: true});
}
