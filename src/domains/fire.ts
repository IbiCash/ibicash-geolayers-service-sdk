import { BaseClient } from '../core/client';
import {
  FeatureCollection,
  LayerResponse,
  WildfireProps,
  WildfirePropsSchema
} from '../types';

/**
 * Filters for wildfire queries.
 */
export interface WildfireFilters {
  /** Number of days of wildfire data to retrieve (1-30). Default: 1 */
  days?: number;
}

export class FireDomain extends BaseClient {
  /**
   * Get list of active wildfires/heat anomalies.
   * @param filters Optional filters. Default: last 1 day.
   */
  async getWildfires(filters: WildfireFilters = {}): Promise<LayerResponse<FeatureCollection<WildfireProps>>> {
    // v1 only - not yet migrated to v2
    const url = this.resolveUrl({
      v1: '/geojson/wildfires',
      v2: null,
    });

    const params = { days: filters.days ?? 1 };
    const data = await this.get<unknown>(url, params);
    return this.normalizeGeoJSONResponse(data, WildfirePropsSchema, 'wildfires');
  }
}

