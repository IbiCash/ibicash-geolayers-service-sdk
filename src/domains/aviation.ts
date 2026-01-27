import { BaseClient } from '../core/client';
import {
    FeatureCollection,
    FlightProps,
    FlightPropsSchema,
    FlightScheduleResponse,
    FlightScheduleResponseSchema,
    LayerResponse
} from '../types';

/**
 * Bounding box filters for global flight queries.
 */
export interface FlightFilters {
    /** Minimum latitude (-90 to 90). Default: -90 */
    lamin?: number;
    /** Minimum longitude (-180 to 180). Default: -180 */
    lomin?: number;
    /** Maximum latitude (-90 to 90). Default: 90 */
    lamax?: number;
    /** Maximum longitude (-180 to 180). Default: 180 */
    lomax?: number;
}

/**
 * Filters for live flight queries (radius around a point).
 */
export interface LiveFlightFilters {
    /** Center latitude (-90 to 90) */
    lat: number;
    /** Center longitude (-180 to 180) */
    lng: number;
    /** Radius in nautical miles (1-1000). Default: 250 */
    radius?: number;
}

export class AviationDomain extends BaseClient {
    /**
     * Get all currently tracked flights globally (OpenSky).
     * @param filters Optional bounding box filters. Defaults to whole world.
     */
    async getGlobalFlights(filters: FlightFilters = {}): Promise<LayerResponse<FeatureCollection<FlightProps>>> {
        // v1 only - not yet migrated to v2
        const url = this.resolveUrl({
            v1: '/geojson/flights/global',
            v2: null,
        });

        const params = {
            lamin: filters.lamin ?? -90,
            lomin: filters.lomin ?? -180,
            lamax: filters.lamax ?? 90,
            lomax: filters.lomax ?? 180,
        };
        const data = await this.get<unknown>(url, params);
        return this.normalizeGeoJSONResponse(data, FlightPropsSchema, 'global-flights');
    }

    /**
     * Get live flights (subset of global flights).
     * @param filters Center point and radius filters. Defaults to New York if not provided.
     */
    async getLiveFlights(filters: LiveFlightFilters = { lat: 40.7128, lng: -74.006 }): Promise<LayerResponse<FeatureCollection<FlightProps>>> {
        // v1 only - not yet migrated to v2
        const url = this.resolveUrl({
            v1: '/geojson/flights/live',
            v2: null,
        });

        const params = {
            lat: filters.lat,
            lng: filters.lng,
            radius: filters.radius ?? 250,
        };
        const data = await this.get<unknown>(url, params);
        return this.normalizeGeoJSONResponse(data, FlightPropsSchema, 'live-flights');
    }

    /**
     * Get flight schedule/details by callsign from AeroDataBox.
     * @param callsign Flight identifier (e.g., 'UAL1234', 'AA100')
     * @returns Raw flight schedule data from AeroDataBox API.
     *
     * @example
     * ```ts
     * const schedule = await sdk.aviation.getFlightSchedule('UAL1234');
     * console.log(schedule.data); // Flight details from AeroDataBox
     * ```
     */
    async getFlightSchedule(callsign: string): Promise<FlightScheduleResponse> {
        // v1 only - not yet migrated to v2
        const url = this.resolveUrl({
            v1: '/geojson/flights/schedule',
            v2: null,
        });

        const data = await this.get<unknown>(url, { callsign });
        return FlightScheduleResponseSchema.parse(data);
    }
}
