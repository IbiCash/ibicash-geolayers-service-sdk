import { GeoLayersConfig } from './core/config';
import { AviationDomain } from './domains/aviation';
import { FireDomain } from './domains/fire';
import { MaritimeDomain } from './domains/maritime';
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
    public readonly events: EventStream;

    constructor(config: GeoLayersConfig) {
        this.seismic = new SeismicDomain(config);
        this.volcanic = new VolcanicDomain(config);
        this.tropical = new TropicalDomain(config);
        this.fire = new FireDomain(config);
        this.weather = new WeatherDomain(config);
        this.maritime = new MaritimeDomain(config);
        this.aviation = new AviationDomain(config);
        this.events = new EventStream(config);
    }
}

export default GeoLayersSDK;
