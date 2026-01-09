import { BaseClient } from '../core/client';
import {
    FeatureCollection,
    LayerResponse,
    WeatherStationProps,
    WeatherStationPropsSchema,
    Feature,
    Geometry,
    ObservationProvider,
    StationObservationsResult,
    StationObservationsResultSchema,
    LatestObservationResult,
    LatestObservationResultSchema,
    BboxObservationsResult,
    BboxObservationsResultSchema,
    ObservationStatsResult,
    ObservationStatsResultSchema,
} from '../types';

/**
 * Filters for data warehouse station observations.
 */
export interface StationObservationFilters {
    /** Observation provider */
    provider: ObservationProvider;
    /** Start date in ISO 8601 format */
    start?: string;
    /** End date in ISO 8601 format */
    end?: string;
    /** Quick time range selection (overridden by start/end) */
    timePreset?: '1h' | '24h' | '7d' | '30d';
    /** Maximum number of observations to return */
    limit?: number;
}

/**
 * Filters for bounding box observation queries.
 */
export interface BboxFilters extends StationObservationFilters {
    /** Minimum longitude (-180 to 180) */
    minLon: number;
    /** Minimum latitude (-90 to 90) */
    minLat: number;
    /** Maximum longitude (-180 to 180) */
    maxLon: number;
    /** Maximum latitude (-90 to 90) */
    maxLat: number;
}

/**
 * ObservationsDomain provides access to observation endpoints.
 *
 * This includes:
 * - Active stations from WIS2 and IEM networks
 * - Data warehouse queries (station, bbox, stats)
 */
export class ObservationsDomain extends BaseClient {
    /**
     * Get active WIS2 stations that reported data in the last 24 hours.
     */
    async getActiveWis2Stations(): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>> {
        const rawData = await this.get<unknown>('/observations/wis2/stations/active');
        return this.parseActiveStationsResponse(rawData, 'wis2');
    }

    /**
     * Get active IEM/AZOS stations that reported data in the last 24 hours.
     */
    async getActiveIemStations(): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>> {
        const rawData = await this.get<unknown>('/observations/iem/stations/active');
        return this.parseActiveStationsResponse(rawData, 'iem');
    }

    /**
     * Get observations for a station from the data warehouse.
     * @param stationId The station identifier.
     * @param filters Query filters including provider and date range.
     */
    async getStationObservations(stationId: string, filters: StationObservationFilters): Promise<StationObservationsResult> {
        const params = this.buildDateParams(filters);
        const data = await this.get<StationObservationsResult>(`/observations/station/${stationId}`, params);
        return StationObservationsResultSchema.parse(data);
    }

    /**
     * Get the latest observation for a station from the data warehouse.
     * @param stationId The station identifier.
     * @param provider The observation provider.
     */
    async getLatestObservation(stationId: string, provider: ObservationProvider): Promise<LatestObservationResult> {
        const data = await this.get<LatestObservationResult>(`/observations/station/${stationId}/latest`, { provider });
        return LatestObservationResultSchema.parse(data);
    }

    /**
     * Get observations within a geographic bounding box.
     * @param filters Bounding box coordinates and query filters.
     */
    async getObservationsByBbox(filters: BboxFilters): Promise<BboxObservationsResult> {
        const params = {
            ...this.buildDateParams(filters),
            minLon: filters.minLon,
            minLat: filters.minLat,
            maxLon: filters.maxLon,
            maxLat: filters.maxLat,
        };
        const data = await this.get<BboxObservationsResult>('/observations/bbox', params);
        return BboxObservationsResultSchema.parse(data);
    }

    /**
     * Get data warehouse statistics.
     * @param provider Optional provider filter. If not specified, returns stats for all providers.
     */
    async getStats(provider?: ObservationProvider): Promise<ObservationStatsResult> {
        const params = provider ? { provider } : {};
        const data = await this.get<ObservationStatsResult>('/observations/stats', params);
        return ObservationStatsResultSchema.parse(data);
    }

    /**
     * Convert time preset to absolute date range parameters.
     */
    private buildDateParams(filters: StationObservationFilters): Record<string, unknown> {
        const params: Record<string, unknown> = {
            provider: filters.provider,
        };

        if (filters.limit !== undefined) {
            params.limit = filters.limit;
        }

        // If explicit dates provided, use them
        if (filters.start && filters.end) {
            params.start = filters.start;
            params.end = filters.end;
            return params;
        }

        // Convert preset to date range
        if (filters.timePreset) {
            const now = new Date();
            const presetMs: Record<string, number> = {
                '1h': 60 * 60 * 1000,
                '24h': 24 * 60 * 60 * 1000,
                '7d': 7 * 24 * 60 * 60 * 1000,
                '30d': 30 * 24 * 60 * 60 * 1000,
            };
            const ms = presetMs[filters.timePreset];
            params.start = new Date(now.getTime() - ms).toISOString();
            params.end = now.toISOString();
        }

        return params;
    }

    /**
     * Parse active stations response.
     * The endpoint may return either a FeatureCollection directly or wrapped in LayerResponse.
     */
    private parseActiveStationsResponse(
        rawData: unknown,
        provider: string
    ): LayerResponse<FeatureCollection<WeatherStationProps>> {
        const featureCollection = rawData as { type: string; features: unknown[]; metadata?: unknown };

        if (featureCollection?.type === 'FeatureCollection') {
            const features: Feature<WeatherStationProps>[] = (featureCollection.features ?? []).map((f: unknown) => {
                const feature = f as { type: 'Feature'; geometry: Geometry; properties: unknown; id?: string | number };
                return {
                    type: 'Feature' as const,
                    geometry: feature.geometry,
                    properties: WeatherStationPropsSchema.parse(feature.properties ?? {}),
                    id: feature.id,
                };
            });

            return {
                provider: `active-stations-${provider}`,
                data: {
                    type: 'FeatureCollection' as const,
                    features,
                },
                timestamp: new Date().toISOString(),
                count: features.length,
            };
        }

        // Fallback: try parsing as LayerResponse
        return this.parseGeoJSON(rawData, WeatherStationPropsSchema);
    }
}
