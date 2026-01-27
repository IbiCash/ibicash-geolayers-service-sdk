import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { z } from 'zod';
import {
    createFeatureCollectionSchema,
    createLayerResponseSchema,
    FeatureCollection,
    LayerResponse
} from '../types';
import { ApiVersion, DEFAULT_CONFIG, GeoLayersConfig } from './config';
import { GeoLayersApiError } from './errors';

/**
 * URL mapping for endpoints that differ between API versions.
 * Use null to indicate an endpoint is not available in that version.
 */
export interface VersionedEndpoint {
    /** v1 endpoint path (without /api/v1 prefix). Use null if not available in v1. */
    v1: string | null;
    /** v2 endpoint path (without /api/v2 prefix). Use null if not available in v2. */
    v2: string | null;
}

/**
 * Result of URL resolution, includes which version was actually selected.
 */
export interface ResolvedUrl {
    /** Full URL path including version prefix */
    url: string;
    /** The API version that was selected */
    version: ApiVersion;
}

interface ApiErrorResponse {
    message?: string | string[];
    error?: string | { message?: string; code?: string };
}

export abstract class BaseClient {
    protected readonly http: AxiosInstance;
    protected readonly config: Required<Pick<GeoLayersConfig, 'baseUrl' | 'apiKey' | 'apiBasePath' | 'apiVersion'>> & GeoLayersConfig;
    private readonly preferredVersion: ApiVersion;

    constructor(config: GeoLayersConfig) {
        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
            apiBasePath: config.apiBasePath ?? DEFAULT_CONFIG.apiBasePath ?? '/api',
            apiVersion: config.apiVersion ?? DEFAULT_CONFIG.apiVersion ?? 'v1',
        } as typeof this.config;
        this.preferredVersion = this.config.apiVersion;

        // Create axios instance with base URL only (no version path)
        this.http = axios.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeout,
        });

        this.setupInterceptors();
    }

    /**
     * Returns true if the SDK prefers API v2.
     */
    protected get isV2(): boolean {
        return this.preferredVersion === 'v2';
    }

    /**
     * Returns the preferred API version.
     */
    protected get apiVersion(): ApiVersion {
        return this.preferredVersion;
    }

    /**
     * Builds a versioned URL path.
     * @param version API version to use
     * @param endpoint Endpoint path (without version prefix)
     */
    private buildVersionedPath(version: ApiVersion, endpoint: string): string {
        const basePath = this.config.apiBasePath;
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${basePath}/${version}${normalizedEndpoint}`;
    }

    /**
     * Resolves the appropriate URL based on API version and availability.
     * Falls back to the other version if preferred is not available.
     *
     * @param endpoints Object with v1 and v2 URL paths (use null if unavailable)
     * @returns ResolvedUrl with full path and selected version
     * @throws Error if no endpoint is available for either version
     */
    protected resolveEndpoint(endpoints: VersionedEndpoint): ResolvedUrl {
        // Try preferred version first
        if (this.isV2 && endpoints.v2 !== null) {
            return {
                url: this.buildVersionedPath('v2', endpoints.v2),
                version: 'v2',
            };
        }

        // Fallback to v1 if v2 not available or not preferred
        if (endpoints.v1 !== null) {
            return {
                url: this.buildVersionedPath('v1', endpoints.v1),
                version: 'v1',
            };
        }

        // If v1 not available but v2 is, use v2
        if (endpoints.v2 !== null) {
            return {
                url: this.buildVersionedPath('v2', endpoints.v2),
                version: 'v2',
            };
        }

        throw new Error('No endpoint available for either API version');
    }

    /**
     * Resolves URL - convenience method that returns just the URL string.
     * Use resolveEndpoint() if you need to know which version was selected.
     */
    protected resolveUrl(endpoints: VersionedEndpoint): string {
        return this.resolveEndpoint(endpoints).url;
    }

    private setupInterceptors(): void {
        this.http.interceptors.request.use((config) => {
            config.headers['X-API-Key'] = this.config.apiKey;
            return config;
        });
    }

    private isRetryableError(error: AxiosError): boolean {
        if (!error.response) return true;
        const status = error.response.status;
        return status >= 500 || status === 429;
    }

    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private async executeWithRetry<T>(
        requestFn: () => Promise<AxiosResponse<T>>
    ): Promise<T> {
        const maxRetries = this.config.retries ?? 2;
        let lastError: AxiosError<ApiErrorResponse> | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await requestFn();
                return response.data;
            } catch (err) {
                const error = err as AxiosError<ApiErrorResponse>;
                lastError = error;

                const isLastAttempt = attempt === maxRetries;
                if (isLastAttempt || !this.isRetryableError(error)) {
                    break;
                }

                const delayMs = Math.pow(2, attempt) * 1000;
                await this.delay(delayMs);
            }
        }

        if (!lastError!.response) {
            throw new GeoLayersApiError(lastError!.message, 0);
        }

        const { status, data } = lastError!.response;

        // Extract error message - handle various API response formats
        let message: string;
        if (typeof data?.message === 'string') {
            message = data.message;
        } else if (Array.isArray(data?.message)) {
            message = data.message.join('; ');
        } else if (typeof data?.error === 'string') {
            message = data.error;
        } else if (data?.error?.message) {
            message = data.error.message;
        } else {
            message = lastError!.message ?? 'Unknown error';
        }

        throw new GeoLayersApiError(message, status, data);
    }

    protected async get<T, P extends object = object>(url: string, params?: P): Promise<T> {
        return this.executeWithRetry(() =>
            this.http.get<T>(url, { params } as AxiosRequestConfig)
        );
    }

    protected async post<T, B extends object = object>(url: string, body?: B): Promise<T> {
        return this.executeWithRetry(() =>
            this.http.post<T>(url, body)
        );
    }

    /**
     * Helper to parse GeoJSON responses with Zod validation.
     * Eliminates repetitive schema creation across domains.
     */
    protected parseGeoJSON<T extends z.ZodTypeAny>(
        data: unknown,
        propsSchema: T
    ): LayerResponse<FeatureCollection<z.infer<T>>> {
        const schema = createLayerResponseSchema(createFeatureCollectionSchema(propsSchema));
        return schema.parse(data) as LayerResponse<FeatureCollection<z.infer<T>>>;
    }

    /**
     * Normalizes API responses to a consistent LayerResponse format.
     * Handles both:
     * - v1 responses: LayerResponse envelope with data field
     * - v2 responses: Direct FeatureCollection
     *
     * @param data Raw response data from the API
     * @param propsSchema Zod schema for feature properties
     * @param provider Provider name to use when wrapping v2 responses
     */
    protected normalizeGeoJSONResponse<T extends z.ZodTypeAny>(
        data: unknown,
        propsSchema: T,
        provider: string
    ): LayerResponse<FeatureCollection<z.infer<T>>> {
        const record = data as Record<string, unknown>;

        // Check if this is already a LayerResponse (v1 format)
        if (record?.provider && record?.data && record?.timestamp) {
            return this.parseGeoJSON(data, propsSchema);
        }

        // Check if this is a direct FeatureCollection (v2 format)
        if (record?.type === 'FeatureCollection' && Array.isArray(record?.features)) {
            const featureCollectionSchema = createFeatureCollectionSchema(propsSchema);
            const featureCollection = featureCollectionSchema.parse(data);

            return {
                provider,
                data: featureCollection as FeatureCollection<z.infer<T>>,
                timestamp: new Date().toISOString(),
                count: (featureCollection as FeatureCollection<z.infer<T>>).features.length,
            };
        }

        // Fallback: try to parse as LayerResponse
        return this.parseGeoJSON(data, propsSchema);
    }
}
