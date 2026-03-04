import { BaseClient } from '../core/client';

export interface EcoregionDetails {
    id: string;
    name: string;
    code: string;
    areaHa: number;
    biomeId: string | null;
    biomeName: string | null;
    realm: string | null;
    createdAt: string;
    updatedAt: string;
}

export class EcoregionsDomain extends BaseClient {
    /**
     * Get ecoregion details by code.
     */
    async getDetails(code: string): Promise<EcoregionDetails> {
        const url = this.resolveUrl({ v1: `/ecoregions/${code}`, v2: null });
        return this.get<EcoregionDetails>(url);
    }
}
