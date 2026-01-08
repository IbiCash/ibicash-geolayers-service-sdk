import { z } from 'zod';

export enum LayerProvider {
    VOLCANOES = 'volcanoes',
    ACTIVE_VOLCANOES = 'active-volcanoes',
    WILDFIRES = 'wildfires',
    ACTIVE_STORMS = 'active-storms',
    RECENT_STORMS = 'recent-storms',
    EARTHQUAKES = 'earthquakes',
    BUOYS_RECENT = 'buoys-recent',
    BUOYS_LATEST = 'buoys-latest',
    NWS_STATIONS = 'nws-weather-stations',
    AZOS_NETWORK = 'azos-weather-network',
    WIS2_STATIONS = 'wis2-stations',
    GLOBAL_FLIGHTS = 'global-flights',
    LIVE_FLIGHTS = 'live-flights',
}

export const LayerMetadataSchema = z.object({
    source: z.string(),
    cacheTTL: z.number(),
    cached: z.boolean(),
    snapshotId: z.string().optional(),
});

export type LayerMetadata = z.infer<typeof LayerMetadataSchema>;

/**
 * Standard API response envelope for all geospatial data.
 * @template T The type of data being returned (usually a FeatureCollection).
 */
export interface LayerResponse<T> {
    provider: LayerProvider | string;
    data: T;
    timestamp: string;
    count?: number;
    metadata?: LayerMetadata;
}

/**
 * Schema for validating the LayerResponse envelope.
 * Does not validate the 'data' field strictly as it varies by provider.
 */
export const createLayerResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        provider: z.string(),
        data: dataSchema,
        timestamp: z.string(),
        count: z.number().optional(),
        metadata: LayerMetadataSchema.optional(),
    });
