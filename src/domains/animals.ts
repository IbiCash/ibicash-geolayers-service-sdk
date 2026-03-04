import { BaseClient } from '../core/client';
import { ForestHistoryEntry, ForestHistoryOptions } from './hydrosheds';

export interface AnimalDetails {
    id: string;
    animalId: string;
    areaHa: number;
    createdAt: string;
    updatedAt: string;
}

export class AnimalsDomain extends BaseClient {
    /**
     * Get animal habitat polygon details.
     */
    async getDetails(animalId: string): Promise<AnimalDetails> {
        const url = this.resolveUrl({ v1: `/animals/${animalId}`, v2: null });
        return this.get<AnimalDetails>(url);
    }

    /**
     * Get forest history for an animal habitat.
     */
    async getForestHistory(animalId: string, options?: ForestHistoryOptions): Promise<ForestHistoryEntry[]> {
        const url = this.resolveUrl({ v1: `/animals/${animalId}/forest-history`, v2: null });
        return this.get<ForestHistoryEntry[]>(url, options);
    }
}
