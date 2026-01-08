import axios, { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeoLayersSDK } from '../../src';
import { GeoLayersApiError } from '../../src/core/errors';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

describe('BaseClient', () => {
    const config = {
        baseUrl: 'https://api.test.com',
        apiKey: 'test-api-key',
        retries: 2,
    };

    let sdk: GeoLayersSDK;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        mockedAxios.create.mockReturnValue({
            get: vi.fn(),
            post: vi.fn(),
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() },
            },
        } as unknown as ReturnType<typeof axios.create>);

        sdk = new GeoLayersSDK(config);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('API Key Injection', () => {
        it('should setup request interceptor for API key', () => {
            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
        });
    });

    describe('Retry Logic', () => {
        it('should retry on 500 error', async () => {
            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            const error500 = new AxiosError('Server Error');
            error500.response = {
                status: 500,
                data: { message: 'Internal Server Error' },
                statusText: 'Internal Server Error',
                headers: {},
                config: { headers: new AxiosHeaders() },
            };

            mockGet
                .mockRejectedValueOnce(error500)
                .mockRejectedValueOnce(error500)
                .mockResolvedValueOnce({ data: { success: true } });

            const resultPromise = (sdk.seismic as unknown as { get: (url: string) => Promise<unknown> }).get('/test');

            await vi.runAllTimersAsync();

            const result = await resultPromise;
            expect(result).toEqual({ success: true });
            expect(mockGet).toHaveBeenCalledTimes(3);
        });

        it('should retry on 429 rate limit error', async () => {
            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            const error429 = new AxiosError('Too Many Requests');
            error429.response = {
                status: 429,
                data: { message: 'Rate limit exceeded' },
                statusText: 'Too Many Requests',
                headers: {},
                config: { headers: new AxiosHeaders() },
            };

            mockGet
                .mockRejectedValueOnce(error429)
                .mockResolvedValueOnce({ data: { success: true } });

            const resultPromise = (sdk.seismic as unknown as { get: (url: string) => Promise<unknown> }).get('/test');

            await vi.runAllTimersAsync();

            const result = await resultPromise;
            expect(result).toEqual({ success: true });
            expect(mockGet).toHaveBeenCalledTimes(2);
        });

        it('should retry on network error (no response)', async () => {
            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            const networkError = new AxiosError('Network Error');

            mockGet
                .mockRejectedValueOnce(networkError)
                .mockResolvedValueOnce({ data: { success: true } });

            const resultPromise = (sdk.seismic as unknown as { get: (url: string) => Promise<unknown> }).get('/test');

            await vi.runAllTimersAsync();

            const result = await resultPromise;
            expect(result).toEqual({ success: true });
            expect(mockGet).toHaveBeenCalledTimes(2);
        });

        it('should NOT retry on 4xx client errors', async () => {
            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            const error404 = new AxiosError('Not Found');
            error404.response = {
                status: 404,
                data: { message: 'Resource not found' },
                statusText: 'Not Found',
                headers: {},
                config: { headers: new AxiosHeaders() },
            };

            mockGet.mockRejectedValueOnce(error404);

            await expect(
                (sdk.seismic as unknown as { get: (url: string) => Promise<unknown> }).get('/test')
            ).rejects.toThrow(GeoLayersApiError);
            expect(mockGet).toHaveBeenCalledTimes(1);
        });

        it('should NOT retry on 401 unauthorized', async () => {
            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            const error401 = new AxiosError('Unauthorized');
            error401.response = {
                status: 401,
                data: { message: 'Invalid API key' },
                statusText: 'Unauthorized',
                headers: {},
                config: { headers: new AxiosHeaders() },
            };

            mockGet.mockRejectedValueOnce(error401);

            await expect(
                (sdk.seismic as unknown as { get: (url: string) => Promise<unknown> }).get('/test')
            ).rejects.toThrow(GeoLayersApiError);
            expect(mockGet).toHaveBeenCalledTimes(1);
        });

        it('should throw after max retries exhausted', async () => {
            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            const error503 = new AxiosError('Service Unavailable');
            error503.response = {
                status: 503,
                data: { message: 'Service temporarily unavailable' },
                statusText: 'Service Unavailable',
                headers: {},
                config: { headers: new AxiosHeaders() },
            };

            mockGet
                .mockRejectedValueOnce(error503)
                .mockRejectedValueOnce(error503)
                .mockRejectedValueOnce(error503);

            const resultPromise = (sdk.seismic as unknown as { get: (url: string) => Promise<unknown> }).get('/test');

            const [, result] = await Promise.allSettled([
                vi.runAllTimersAsync(),
                resultPromise,
            ]);

            expect(result.status).toBe('rejected');
            if (result.status === 'rejected') {
                expect(result.reason).toBeInstanceOf(GeoLayersApiError);
            }
            expect(mockGet).toHaveBeenCalledTimes(3);
        });

        it('should use exponential backoff delays', async () => {
            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            const error500 = new AxiosError('Server Error');
            error500.response = {
                status: 500,
                data: {},
                statusText: 'Internal Server Error',
                headers: {},
                config: { headers: new AxiosHeaders() },
            };

            mockGet
                .mockRejectedValueOnce(error500)
                .mockRejectedValueOnce(error500)
                .mockResolvedValueOnce({ data: { success: true } });

            const resultPromise = (sdk.seismic as unknown as { get: (url: string) => Promise<unknown> }).get('/test');

            expect(mockGet).toHaveBeenCalledTimes(1);

            await vi.advanceTimersByTimeAsync(1000);
            expect(mockGet).toHaveBeenCalledTimes(2);

            await vi.advanceTimersByTimeAsync(2000);
            expect(mockGet).toHaveBeenCalledTimes(3);

            await resultPromise;
        });
    });

    describe('Error Handling', () => {
        it('should throw GeoLayersApiError with status code', async () => {
            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            const error400 = new AxiosError('Bad Request');
            error400.response = {
                status: 400,
                data: { message: 'Invalid parameters' },
                statusText: 'Bad Request',
                headers: {},
                config: { headers: new AxiosHeaders() },
            };

            mockGet.mockRejectedValueOnce(error400);

            try {
                await (sdk.seismic as unknown as { get: (url: string) => Promise<unknown> }).get('/test');
                expect.fail('Should have thrown');
            } catch (err) {
                expect(err).toBeInstanceOf(GeoLayersApiError);
                const apiError = err as GeoLayersApiError;
                expect(apiError.statusCode).toBe(400);
                expect(apiError.message).toBe('Invalid parameters');
            }
        });

        it('should handle network errors with status 0', async () => {
            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            const networkError = new AxiosError('Network Error');

            mockGet
                .mockRejectedValueOnce(networkError)
                .mockRejectedValueOnce(networkError)
                .mockRejectedValueOnce(networkError);

            const resultPromise = (sdk.seismic as unknown as { get: (url: string) => Promise<unknown> }).get('/test');

            const [, result] = await Promise.allSettled([
                vi.runAllTimersAsync(),
                resultPromise,
            ]);

            expect(result.status).toBe('rejected');
            if (result.status === 'rejected') {
                expect(result.reason).toBeInstanceOf(GeoLayersApiError);
                expect((result.reason as GeoLayersApiError).statusCode).toBe(0);
            }
        });
    });
});

