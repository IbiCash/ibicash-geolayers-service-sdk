import { BaseClient } from '../core/client';
import { ForestHistoryEntry, ForestHistoryOptions } from './hydrosheds';

export interface SoilDetails {
    id: string;
    soilId: string;
    areaHa: number;
    createdAt: string;
    updatedAt: string;
}

export class SoilsDomain extends BaseClient {
    /**
     * Get soil zone polygon details.
     */
    async getDetails(soilId: string): Promise<SoilDetails> {
        const url = this.resolveUrl({ v1: `/soils/${soilId}`, v2: null });
        return this.get<SoilDetails>(url);
    }

    /**
     * Get forest history for a soil zone.
     */
    async getForestHistory(soilId: string, options?: ForestHistoryOptions): Promise<ForestHistoryEntry[]> {
        const url = this.resolveUrl({ v1: `/soils/${soilId}/forest-history`, v2: null });
        return this.get<ForestHistoryEntry[]>(url, options);
    }
}
