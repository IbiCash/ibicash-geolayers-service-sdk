import { BaseClient } from '../core/client';

export interface HydroshedDetails {
    id: string;
    hybasId: string;
    subArea: number | null;
    upArea: number | null;
    areaHa: number;
    createdAt: string;
    updatedAt: string;
}

export interface ForestHistoryEntry {
    id: string;
    ecoregionId: string | null;
    year: number;
    areaHa: number;
}

export interface ForestHistoryOptions {
    startYear?: number;
    endYear?: number;
}

export class HydroshedsDomain extends BaseClient {
    /**
     * Get hydroshed details by HYBAS ID.
     */
    async getDetails(hybasId: string): Promise<HydroshedDetails> {
        const url = this.resolveUrl({ v1: `/hydrosheds/${hybasId}`, v2: null });
        return this.get<HydroshedDetails>(url);
    }

    /**
     * Get forest history for a hydroshed.
     */
    async getForestHistory(hybasId: string, options?: ForestHistoryOptions): Promise<ForestHistoryEntry[]> {
        const url = this.resolveUrl({ v1: `/hydrosheds/${hybasId}/forest-history`, v2: null });
        return this.get<ForestHistoryEntry[]>(url, options);
    }
}
