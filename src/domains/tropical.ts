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
        const data = await this.get<unknown>('/geojson/storms/active');
        return this.parseGeoJSON(data, StormPropsSchema);
    }

    /**
     * Get list of recent tropical storms/hurricanes.
     */
    async getRecentStorms(): Promise<LayerResponse<FeatureCollection<StormProps>>> {
        const data = await this.get<unknown>('/geojson/storms/recent');
        return this.parseGeoJSON(data, StormPropsSchema);
    }
}
