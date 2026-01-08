import { BaseClient } from '../core/client';
import {
    FeatureCollection,
    LayerResponse,
    ObservationQueryResult,
    ObservationQueryResultSchema,
    WeatherStationProps,
    WeatherStationPropsSchema
} from '../types';
import { ObservationFilters } from './weather';

export class MaritimeDomain extends BaseClient {
    /**
     * Get NOAA buoy stations (locations).
     */
    async getBuoyStations(): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>> {
        const data = await this.get<unknown>('/geojson/buoys/stations');
        return this.parseGeoJSON(data, WeatherStationPropsSchema);
    }

    /**
     * Get latest buoy observations (real-time-ish).
     */
    async getLatestBuoyObservations(): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>> {
        const data = await this.get<unknown>('/geojson/buoys/observations');
        return this.parseGeoJSON(data, WeatherStationPropsSchema);
    }

    /**
     * Get historical observations for a specific buoy.
     * @param buoyId The buoy identifier.
     * @param filters Date range filters.
     */
    async getBuoyObservations(buoyId: string, filters: ObservationFilters): Promise<ObservationQueryResult> {
        const data = await this.get<ObservationQueryResult>(`/observations/buoy/${buoyId}`, filters);
        return ObservationQueryResultSchema.parse(data);
    }
}