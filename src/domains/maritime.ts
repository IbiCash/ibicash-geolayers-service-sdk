import { BaseClient } from "../core/client";
import {
  FeatureCollection,
  LayerResponse,
  ObservationQueryResult,
  ObservationQueryResultSchema,
  WeatherStationProps,
  WeatherStationPropsSchema,
} from "../types";
import { ObservationFilters } from "./weather";

export class MaritimeDomain extends BaseClient {
  /**
   * Get NOAA buoy stations (locations).
   */
  async getBuoyStations(): Promise<
    LayerResponse<FeatureCollection<WeatherStationProps>>
  > {
    const url = this.resolveUrl({
      v1: '/geojson/buoys/stations',
      v2: '/stations?provider=buoy',
    });

    const data = await this.get<unknown>(url);
    return this.normalizeGeoJSONResponse(data, WeatherStationPropsSchema, 'buoy-stations');
  }

  /**
   * Get latest buoy observations (real-time-ish).
   */
  async getLatestBuoyObservations(): Promise<
    LayerResponse<FeatureCollection<WeatherStationProps>>
  > {
    const url = this.resolveUrl({
      v1: '/geojson/buoys/observations',
      v2: null
    });

    const data = await this.get<unknown>(url);
    return this.normalizeGeoJSONResponse(data, WeatherStationPropsSchema, 'buoy-observations');
  }

  /**
   * Get historical observations for a specific buoy.
   * @param buoyId The buoy identifier.
   * @param filters Date range filters.
   */
  async getBuoyObservations(
    buoyId: string,
    filters: ObservationFilters,
  ): Promise<ObservationQueryResult> {
    // v1 only - not yet migrated to v2
    const url = this.resolveUrl({
      v1: `/observations/buoy/${buoyId}`,
      v2: null,
    });

    const data = await this.get<ObservationQueryResult>(url, filters);
    return ObservationQueryResultSchema.parse(data);
  }
}

