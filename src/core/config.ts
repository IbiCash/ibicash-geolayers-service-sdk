export type ApiVersion = 'v1' | 'v2';

export interface GeoLayersConfig {
    /**
     * Base URL of the geo-layers service (host only, no /api path).
     * Example: 'http://localhost:3000' or 'https://geo.example.com'
     */
    baseUrl: string;
    apiKey: string;
    timeout?: number;
    retries?: number;
    /**
     * Preferred API version. Default: 'v1'
     * When set to 'v2', the SDK will use v2 endpoints where available,
     * falling back to v1 for endpoints not yet migrated.
     */
    apiVersion?: ApiVersion;
    /**
     * Base path for API routes. Default: '/api'
     * The SDK builds URLs as: baseUrl + apiBasePath + /v1 or /v2 + endpoint
     */
    apiBasePath?: string;
}

export const DEFAULT_CONFIG: Partial<GeoLayersConfig> = {
    baseUrl: (typeof process !== 'undefined' ? process.env.GEOLAYERS_BASE_URL : undefined) || '',
    timeout: 30000,
    retries: 2,
    apiVersion: 'v1',
    apiBasePath: '/api',
};
