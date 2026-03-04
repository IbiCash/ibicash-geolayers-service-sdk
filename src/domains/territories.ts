import { BaseClient } from '../core/client';

export interface TerritoryLookupResult {
    id: string;
    externalId: string;
    name: string;
    type: string;
    adm0Id: string | null;
    adm1Id: string | null;
    parentId: string | null;
    areaHa: number;
}

export class TerritoriesDomain extends BaseClient {
    /**
     * Reverse geocode coordinates to find containing territory (country/state/municipality).
     */
    async lookup(lat: number, lng: number): Promise<TerritoryLookupResult[]> {
        const url = this.resolveUrl({ v1: '/territories/lookup', v2: null });
        return this.get<TerritoryLookupResult[]>(url, { lat, lng });
    }
}
