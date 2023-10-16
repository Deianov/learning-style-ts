import { Country, CountryResource } from '../components/exercises/country.js';
import { DOM_CONTENT_ID } from '../constants.js';
import { factory, PATH_RESOURCES_MAPS } from '../factory.js';
import { ExerciseModel, PropsCountryModel } from '../types/models.js';
import dom from '../utils/dom.js';
import { ExercisePlay } from './exercise.js';

class Maps implements ExercisePlay {
    private parent: HTMLElement;

    constructor(parent: string = DOM_CONTENT_ID) {
        // todo: !
        this.parent = dom.get(parent)!;
    }

    async render(jsonFile: ExerciseModel): Promise<void> {
        const props = jsonFile.props as PropsCountryModel;

        const {resource, resource_full} = props; // "../components/maps/maps-de.js && maps-de-full.js"

        if (!resource) {
            console.log('Not found key [resource] in props.');
            return;
        }

        const map = new Country(this.parent);

        // dynamic import - map
        const baseResource = await factory.importResource<CountryResource>(PATH_RESOURCES_MAPS, resource);
        await map.render(baseResource['lands']);
        map.renderInfo(baseResource.meta);

        // dynamic import - full data
        if (resource_full) {
            const fullResource = await factory.importResource<CountryResource>(PATH_RESOURCES_MAPS, resource_full);
            map.meta = fullResource['lands'].meta;
        }
    }
    start(): void {}
    stop(): void {}
    reset() {
        this.parent.innerHTML = '';
    }
}

export default Maps;
