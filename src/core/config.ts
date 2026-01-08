export interface GeoLayersConfig {
    baseUrl: string;
    apiKey: string;
    timeout?: number;
    retries?: number;
}

export const DEFAULT_CONFIG: Partial<GeoLayersConfig> = {
    baseUrl: (typeof process !== 'undefined' ? process.env.GEOLAYERS_BASE_URL : undefined) || '',
    timeout: 30000,
    retries: 2,
};
