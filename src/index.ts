import { GeoLayersConfig } from './core/config';
import { AviationDomain } from './domains/aviation';
import { EventsDomain } from './domains/events';
import { FireDomain } from './domains/fire';
import { MaritimeDomain } from './domains/maritime';
import { ObservationsDomain } from './domains/observations';
import { SeismicDomain } from './domains/seismic';
import { TropicalDomain } from './domains/tropical';
import { VolcanicDomain } from './domains/volcanic';
import { WeatherDomain } from './domains/weather';
import { EventStream } from './events/stream';

export * from './core/config';
export * from './core/errors';
export * from './types';

export class GeoLayersSDK {
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

    constructor(config: GeoLayersConfig) {
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
    }
}

export default GeoLayersSDK;

