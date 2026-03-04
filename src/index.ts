import { GeoLayersConfig } from './core/config';
import { AnimalsDomain } from './domains/animals';
import { AviationDomain } from './domains/aviation';
import { EcoregionsDomain } from './domains/ecoregions';
import { EventsDomain } from './domains/events';
import { FireDomain } from './domains/fire';
import { HydroshedsDomain } from './domains/hydrosheds';
import { MaritimeDomain } from './domains/maritime';
import { ObservationsDomain } from './domains/observations';
import { PropertiesDomain } from './domains/properties';
import { ProtectedAreasDomain } from './domains/protected-areas';
import { SeismicDomain } from './domains/seismic';
import { SoilsDomain } from './domains/soils';
import { TerritoriesDomain } from './domains/territories';
import { TropicalDomain } from './domains/tropical';
import { VolcanicDomain } from './domains/volcanic';
import { WeatherDomain } from './domains/weather';
import { EventStream } from './events/stream';
export type { ChartDataFilters } from './domains/observations';

export * from './core/config';
export * from './core/errors';
export * from './types';

export class GeoLayersSDK {
    // External data layers
    public readonly seismic: SeismicDomain;
    public readonly volcanic: VolcanicDomain;
    public readonly tropical: TropicalDomain;
    public readonly fire: FireDomain;
    public readonly weather: WeatherDomain;
    public readonly maritime: MaritimeDomain;
    public readonly aviation: AviationDomain;
    /** Observation data warehouse and active stations */
    public readonly observations: ObservationsDomain;
    /** Real-time event stream (SSE) */
    public readonly events: EventStream;
    /** Event metadata operations (REST) */
    public readonly eventsMeta: EventsDomain;

    // Polygon data layers
    /** Property/land unit polygons with forest, biodiversity, alerts */
    public readonly properties: PropertiesDomain;
    /** Hydroshed watershed polygons (HYBAS levels 6-12) */
    public readonly hydrosheds: HydroshedsDomain;
    /** Soil classification polygons */
    public readonly soils: SoilsDomain;
    /** Animal habitat polygons */
    public readonly animals: AnimalsDomain;
    /** Protected area polygons */
    public readonly protectedAreas: ProtectedAreasDomain;
    /** Territory reverse geocoding (country/state/municipality) */
    public readonly territories: TerritoriesDomain;
    /** Ecoregion details */
    public readonly ecoregions: EcoregionsDomain;

    constructor(config: GeoLayersConfig) {
        // External layers
        this.seismic = new SeismicDomain(config);
        this.volcanic = new VolcanicDomain(config);
        this.tropical = new TropicalDomain(config);
        this.fire = new FireDomain(config);
        this.weather = new WeatherDomain(config);
        this.maritime = new MaritimeDomain(config);
        this.aviation = new AviationDomain(config);
        this.observations = new ObservationsDomain(config);
        this.events = new EventStream(config);
        this.eventsMeta = new EventsDomain(config);

        // Polygon layers
        this.properties = new PropertiesDomain(config);
        this.hydrosheds = new HydroshedsDomain(config);
        this.soils = new SoilsDomain(config);
        this.animals = new AnimalsDomain(config);
        this.protectedAreas = new ProtectedAreasDomain(config);
        this.territories = new TerritoriesDomain(config);
        this.ecoregions = new EcoregionsDomain(config);
    }
}

export default GeoLayersSDK;

