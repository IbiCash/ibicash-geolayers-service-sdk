import { z } from 'zod';
import { BaseClient } from '../core/client';
import {
    ActiveVolcanoProps,
    ActiveVolcanoPropsSchema,
    createFeatureSchema,
    FeatureCollection,
    LayerMetadataSchema,
    LayerResponse,
    VolcanoProps,
    VolcanoPropsSchema
} from '../types';

/**
 * Schema for volcanoes API response where data is an array of Features (needs normalization)
 */
const VolcanoesResponseSchema = z.object({
    provider: z.string(),
    data: z.array(createFeatureSchema(VolcanoPropsSchema)),
    timestamp: z.string(),
    count: z.number().optional(),
    metadata: LayerMetadataSchema.optional(),
});

export class VolcanicDomain extends BaseClient {
    /**
     * Get list of Holocene volcanoes (Smithsonian Institution).
     * Note: API returns array of Features, normalized to FeatureCollection here.
     */
    async getVolcanoes(): Promise<LayerResponse<FeatureCollection<VolcanoProps>>> {
        const raw = await this.get<unknown>('/geojson/volcanoes');
        const parsed = VolcanoesResponseSchema.parse(raw);

        // Normalize: wrap array of Features into a FeatureCollection
        return {
            provider: parsed.provider,
            data: {
                type: 'FeatureCollection',
                features: parsed.data,
            },
            timestamp: parsed.timestamp,
            count: parsed.count,
            metadata: parsed.metadata,
        };
    }

    /**
     * Get list of currently active volcanoes (GDACS).
     */
    async getActiveVolcanoes(): Promise<LayerResponse<FeatureCollection<ActiveVolcanoProps>>> {
        const data = await this.get<unknown>('/geojson/volcanoes/active');
        return this.parseGeoJSON(data, ActiveVolcanoPropsSchema);
    }
}
