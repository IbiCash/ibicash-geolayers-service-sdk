import { BaseClient } from '../core/client';
import { ForestHistoryEntry, ForestHistoryOptions } from './hydrosheds';

export interface PropertyDetails {
    id: string;
    ibiCode: string | null;
    name: string | null;
    areaHa: number;
    totalForestAreaHa: number | null;
    lastMeasurementDate: string | null;
    totalAlertAreaHa: number | null;
    totalDeforestationHa: number | null;
    totalRegenerationHa: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface BiodiversityData {
    id: string;
    propertyId: string;
    amphibiansCount: number | null;
    plantsCount: number | null;
    mammalsCount: number | null;
    birdsCount: number | null;
    reptilesCount: number | null;
}

export interface PropertyAlert {
    id: string;
    propertyId: string;
    ecoregionId: string | null;
    totalAlertAreaHa: number | null;
    totalDeforestationHa: number | null;
    totalRegenerationHa: number | null;
    alertCount: number | null;
    firstAlertDate: string | null;
    lastAlertDate: string | null;
    calculatedAt: string | null;
}

export interface AlertsOptions {
    ecoregionId?: string;
}

export interface PropertyRanking {
    id: string;
    propertyId: string;
    category: string;
    rankPosition: number;
    totalProperties: number;
    percentile: number | null;
    metricValue: number | null;
    calculatedAt: string | null;
}

export class PropertiesDomain extends BaseClient {
    /**
     * Get property details by IBI code.
     */
    async getDetails(ibiCode: string): Promise<PropertyDetails> {
        const url = this.resolveUrl({ v1: `/properties/${ibiCode}`, v2: null });
        return this.get<PropertyDetails>(url);
    }

    /**
     * Get forest history for a property.
     */
    async getForestHistory(ibiCode: string, options?: ForestHistoryOptions): Promise<ForestHistoryEntry[]> {
        const url = this.resolveUrl({ v1: `/properties/${ibiCode}/forest-history`, v2: null });
        return this.get<ForestHistoryEntry[]>(url, options);
    }

    /**
     * Get biodiversity data for a property.
     */
    async getBiodiversity(ibiCode: string): Promise<BiodiversityData> {
        const url = this.resolveUrl({ v1: `/properties/${ibiCode}/biodiversity`, v2: null });
        return this.get<BiodiversityData>(url);
    }

    /**
     * Get deforestation/regeneration alerts for a property.
     */
    async getAlerts(ibiCode: string, options?: AlertsOptions): Promise<PropertyAlert[]> {
        const url = this.resolveUrl({ v1: `/properties/${ibiCode}/alerts`, v2: null });
        return this.get<PropertyAlert[]>(url, options);
    }

    /**
     * Get rankings for a property.
     */
    async getRankings(ibiCode: string): Promise<PropertyRanking[]> {
        const url = this.resolveUrl({ v1: `/properties/${ibiCode}/rankings`, v2: null });
        return this.get<PropertyRanking[]>(url);
    }
}
