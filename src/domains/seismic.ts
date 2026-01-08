import { BaseClient } from '../core/client';
import {
    EarthquakeProps,
    EarthquakePropsSchema,
    FeatureCollection,
    LayerResponse
} from '../types';

/**
 * Time range presets for earthquake queries.
 * - `1h`: Last 1 hour
 * - `24h`: Last 24 hours (default)
 * - `7d`: Last 7 days
 * - `30d`: Last 30 days
 */
export type TimePreset = '1h' | '24h' | '7d' | '30d';

/**
 * Filters for earthquake queries.
 * 
 * @example Using a preset (recommended)
 * ```ts
 * sdk.seismic.getEarthquakes({ timePreset: '7d' });
 * ```
 * 
 * @example Using custom date range
 * ```ts
 * sdk.seismic.getEarthquakes({
 *   startTime: '2024-01-01T00:00:00Z',
 *   endTime: '2024-01-31T23:59:59Z',
 * });
 * ```
 */
export interface EarthquakeFilters {
    /**
     * Time preset for quick queries. Default: '24h'.
     * If startTime/endTime are provided, this is ignored.
     */
    timePreset?: TimePreset;

    /**
     * Start time in ISO 8601 format (e.g., '2024-01-01T00:00:00Z').
     * When provided with endTime, overrides timePreset.
     */
    startTime?: string;

    /**
     * End time in ISO 8601 format (e.g., '2024-01-31T23:59:59Z').
     * When provided with startTime, overrides timePreset.
     */
    endTime?: string;

    /**
     * Minimum earthquake magnitude to filter by.
     */
    minMagnitude?: number;
}

const PRESET_HOURS: Record<TimePreset, number> = {
    '1h': 1,
    '24h': 24,
    '7d': 24 * 7,
    '30d': 24 * 30,
};

function getTimeRange(preset: TimePreset): { startTime: string; endTime: string } {
    const now = new Date();
    const hoursAgo = PRESET_HOURS[preset];
    const start = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    return {
        startTime: start.toISOString(),
        endTime: now.toISOString(),
    };
}

export class SeismicDomain extends BaseClient {
    /**
     * Get earthquakes from a specific time range and minimum magnitude.
     * 
     * @param filters - Optional filters. Default: last 24 hours.
     * @returns Promise with earthquake data as GeoJSON FeatureCollection.
     * 
     * @example Using default (last 24 hours)
     * ```ts
     * const earthquakes = await sdk.seismic.getEarthquakes();
     * ```
     * 
     * @example Using a preset
     * ```ts
     * const earthquakes = await sdk.seismic.getEarthquakes({ timePreset: '7d', minMagnitude: 4.0 });
     * ```
     * 
     * @example Using custom date range
     * ```ts
     * const earthquakes = await sdk.seismic.getEarthquakes({
     *   startTime: '2024-01-01T00:00:00Z',
     *   endTime: '2024-01-31T23:59:59Z',
     *   minMagnitude: 5.0,
     * });
     * ```
     */
    async getEarthquakes(filters?: EarthquakeFilters): Promise<LayerResponse<FeatureCollection<EarthquakeProps>>> {
        const { timePreset = '24h', startTime, endTime, minMagnitude } = filters ?? {};

        // Use custom dates if both provided, otherwise use preset
        const timeRange = (startTime && endTime)
            ? { startTime, endTime }
            : getTimeRange(timePreset);

        const params = {
            ...timeRange,
            ...(minMagnitude !== undefined && { minMagnitude }),
        };

        const data = await this.get<unknown>('/geojson/earthquakes', params);
        return this.parseGeoJSON(data, EarthquakePropsSchema);
    }
}
