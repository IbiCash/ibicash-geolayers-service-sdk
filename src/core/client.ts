import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { z } from 'zod';
import {
    createFeatureCollectionSchema,
    createLayerResponseSchema,
    FeatureCollection,
    LayerResponse
} from '../types';
import { DEFAULT_CONFIG, GeoLayersConfig } from './config';
import { GeoLayersApiError } from './errors';

interface ApiErrorResponse {
    message?: string | string[];
    error?: string | { message?: string; code?: string };
}

export abstract class BaseClient {
    protected readonly http: AxiosInstance;
    protected readonly config: GeoLayersConfig;

    constructor(config: GeoLayersConfig) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.http = axios.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeout,
        });

        this.setupInterceptors();
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
}
