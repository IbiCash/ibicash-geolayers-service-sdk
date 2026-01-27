import { BaseClient } from '../core/client';
import {
    FeatureCollection,
    LayerResponse,
    StormProps,
    StormPropsSchema
} from '../types';

export class TropicalDomain extends BaseClient {
    /**
     * Get list of currently active tropical storms/hurricanes.
     */
    async getActiveStorms(): Promise<LayerResponse<FeatureCollection<StormProps>>> {
        // v1 only - not yet migrated to v2
        const url = this.resolveUrl({
            v1: '/geojson/storms/active',
            v2: null,
        });

        const data = await this.get<unknown>(url);
        return this.normalizeGeoJSONResponse(data, StormPropsSchema, 'active-storms');
    }

    /**
     * Get list of recent tropical storms/hurricanes.
     */
    async getRecentStorms(): Promise<LayerResponse<FeatureCollection<StormProps>>> {
        // v1 only - not yet migrated to v2
        const url = this.resolveUrl({
            v1: '/geojson/storms/recent',
            v2: null,
        });

        const data = await this.get<unknown>(url);
        return this.normalizeGeoJSONResponse(data, StormPropsSchema, 'recent-storms');
    }
}
