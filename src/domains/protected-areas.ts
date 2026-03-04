import { BaseClient } from '../core/client';
import { ForestHistoryEntry, ForestHistoryOptions } from './hydrosheds';

export interface ProtectedAreaDetails {
    id: string;
    bondId: string;
    areaHa: number;
    createdAt: string;
    updatedAt: string;
}

export class ProtectedAreasDomain extends BaseClient {
    /**
     * Get protected area polygon details.
     */
    async getDetails(areaId: string): Promise<ProtectedAreaDetails> {
        const url = this.resolveUrl({ v1: `/protected-areas/${areaId}`, v2: null });
        return this.get<ProtectedAreaDetails>(url);
    }

    /**
     * Get forest history for a protected area.
     */
    async getForestHistory(areaId: string, options?: ForestHistoryOptions): Promise<ForestHistoryEntry[]> {
        const url = this.resolveUrl({ v1: `/protected-areas/${areaId}/forest-history`, v2: null });
        return this.get<ForestHistoryEntry[]>(url, options);
    }
}
