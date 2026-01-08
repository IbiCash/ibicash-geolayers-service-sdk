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
        const params = {
            limit: filters.limit ?? 100,
            offset: filters.offset ?? 0,
        };
        const data = await this.get<unknown>('/geojson/stations/wis2', params);
        return this.parseGeoJSON(data, WeatherStationPropsSchema);
    }

    /**
     * Get historical observations for a WIS2 station.
     * @param stationId The station identifier.
     * @param filters Date range and optional WIS2-specific filters.
     */
    async getWis2Observations(stationId: string, filters: Wis2ObservationFilters): Promise<ObservationQueryResult> {
        const data = await this.get<ObservationQueryResult>(`/observations/wis2/${stationId}`, filters);
        return ObservationQueryResultSchema.parse(data);
    }

    /**
     * Get weather stations from IEM/AZOS network.
     */
    async getIemStations(): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>> {
        const data = await this.get<unknown>('/geojson/stations/azos');
        return this.parseGeoJSON(data, WeatherStationPropsSchema);
    }

    /**
     * Get historical observations for an IEM station.
     * @param stationId The station identifier.
     * @param filters Date range filters.
     */
    async getIemObservations(stationId: string, filters: ObservationFilters): Promise<ObservationQueryResult> {
        const data = await this.get<ObservationQueryResult>(`/observations/iem/${stationId}`, filters);
        return ObservationQueryResultSchema.parse(data);
    }
}
