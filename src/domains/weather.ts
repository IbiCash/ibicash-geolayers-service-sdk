import { BaseClient } from '../core/client';
import {
    FeatureCollection,
    LayerResponse,
    ObservationQueryResult,
    ObservationQueryResultSchema,
    WeatherStationProps,
    WeatherStationPropsSchema
} from '../types';

/**
 * Base filters for observation queries.
 */
export interface ObservationFilters {
    /** Start date in ISO 8601 format */
    start: string;
    /** End date in ISO 8601 format */
    end: string;
    /** Force refresh from source (bypass cache). Default: false */
    forceRefresh?: boolean;
}

/**
 * Filters for WIS2 station queries.
 */
export interface Wis2StationFilters {
    /** Maximum number of stations to return. Default: 100 */
    limit?: number;
    /** Number of stations to skip. Default: 0 */
    offset?: number;
}

/**
 * Extended filters for WIS2 observation queries.
 */
export interface Wis2ObservationFilters extends ObservationFilters {
    /** WIS2 node base URL */
    baseUrl?: string;
    /** WIS2 collection ID */
    collectionId?: string;
}

export class WeatherDomain extends BaseClient {
    /**
     * Get weather stations from WIS2 network.
     * @param filters Optional pagination filters.
     */
    async getWis2Stations(filters: Wis2StationFilters = {}): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>> {
        const { url, version } = this.resolveEndpoint({
            v1: '/geojson/stations/wis2',
            v2: '/stations?provider=wis2',
        });

        // v1 requires explicit pagination defaults, v2 handles it server-side
        const params = version === 'v2' ? filters : {
            limit: filters.limit ?? 100,
            offset: filters.offset ?? 0,
        };

        const data = await this.get<unknown>(url, params);
        return this.normalizeGeoJSONResponse(data, WeatherStationPropsSchema, 'wis2-stations');
    }

    /**
     * Get historical observations for a WIS2 station.
     * @param stationId The station identifier.
     * @param filters Date range and optional WIS2-specific filters.
     */
    async getWis2Observations(stationId: string, filters: Wis2ObservationFilters): Promise<ObservationQueryResult> {
        // v1 only - not yet migrated to v2
        const url = this.resolveUrl({
            v1: `/observations/wis2/${stationId}`,
            v2: null,
        });

        const data = await this.get<ObservationQueryResult>(url, filters);
        return ObservationQueryResultSchema.parse(data);
    }

    /**
     * Get weather stations from IEM/AZOS network.
     */
    async getIemStations(): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>> {
        const { url, version } = this.resolveEndpoint({
            v1: '/geojson/stations/azos',
            v2: '/stations?provider=iem',
        });

        const data = await this.get<unknown>(url);
        return this.normalizeGeoJSONResponse(data, WeatherStationPropsSchema, 'iem-stations');
    }

    /**
     * Get historical observations for an IEM station.
     * @param stationId The station identifier.
     * @param filters Date range filters.
     */
    async getIemObservations(stationId: string, filters: ObservationFilters): Promise<ObservationQueryResult> {
        // v1 only - not yet migrated to v2
        const url = this.resolveUrl({
            v1: `/observations/iem/${stationId}`,
            v2: null,
        });

        const data = await this.get<ObservationQueryResult>(url, filters);
        return ObservationQueryResultSchema.parse(data);
    }

    /**
     * Get weather stations from NWS (National Weather Service) network.
     */
    async getNWSWeatherStations(): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>> {
        // v1 only - not yet migrated to v2
        const url = this.resolveUrl({
            v1: '/geojson/stations/nws',
            v2: null,
        });

        const data = await this.get<unknown>(url);
        return this.normalizeGeoJSONResponse(data, WeatherStationPropsSchema, 'nws-stations');
    }

    /**
     * Get active stations that have reported data in the last 24 hours.
     * @param type The station network type ('iem' or 'wis2').
     */
    async getActiveStations(type: 'iem' | 'wis2'): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>> {
        // v1 only - not yet migrated to v2
        const url = this.resolveUrl({
            v1: '/stations/active',
            v2: null,
        });

        const rawData = await this.get<unknown>(url, { type });
        return this.normalizeGeoJSONResponse(rawData, WeatherStationPropsSchema, `active-stations-${type}`);
    }
}
