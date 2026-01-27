import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeoLayersSDK } from '../../src';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

describe('API Versioning', () => {
    const createMockAxiosInstance = () => ({
        get: vi.fn(),
        post: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
    } as unknown as ReturnType<typeof axios.create>);

    beforeEach(() => {
        vi.clearAllMocks();
        mockedAxios.create.mockReturnValue(createMockAxiosInstance());
    });

    describe('resolveUrl', () => {
        it('should return v1 URL when apiVersion is v1 (default)', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            mockGet.mockResolvedValueOnce({
                data: {
                    provider: 'buoy-stations',
                    data: { type: 'FeatureCollection', features: [] },
                    timestamp: '2024-01-01T00:00:00.000Z',
                },
            });

            await sdk.maritime.getBuoyStations();

            expect(mockGet).toHaveBeenCalledWith(
                '/api/v1/geojson/buoys/stations',
                expect.anything()
            );
        });

        it('should return v2 URL when apiVersion is v2 and v2 endpoint exists', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v2',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            mockGet.mockResolvedValueOnce({
                data: {
                    type: 'FeatureCollection',
                    features: [],
                },
            });

            await sdk.maritime.getBuoyStations();

            expect(mockGet).toHaveBeenCalledWith(
                '/api/v2/stations?provider=buoy',
                expect.anything()
            );
        });

        it('should fallback to v1 when apiVersion is v2 but v2 endpoint is null', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v2',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            mockGet.mockResolvedValueOnce({
                data: {
                    provider: 'buoy-observations',
                    data: { type: 'FeatureCollection', features: [] },
                    timestamp: '2024-01-01T00:00:00.000Z',
                },
            });

            // getLatestBuoyObservations has v2: null - should fallback to v1
            await sdk.maritime.getLatestBuoyObservations();

            expect(mockGet).toHaveBeenCalledWith(
                '/api/v1/geojson/buoys/observations',
                expect.anything()
            );
        });
    });

    describe('buildVersionedPath', () => {
        it('should correctly construct /api/v1/... paths', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v1',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            mockGet.mockResolvedValueOnce({
                data: {
                    provider: 'wis2-stations',
                    data: { type: 'FeatureCollection', features: [] },
                    timestamp: '2024-01-01T00:00:00.000Z',
                },
            });

            await sdk.weather.getWis2Stations();

            expect(mockGet).toHaveBeenCalledWith(
                '/api/v1/geojson/stations/wis2',
                expect.anything()
            );
        });

        it('should correctly construct /api/v2/... paths', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v2',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            mockGet.mockResolvedValueOnce({
                data: { type: 'FeatureCollection', features: [] },
            });

            await sdk.weather.getWis2Stations();

            expect(mockGet).toHaveBeenCalledWith(
                '/api/v2/stations?provider=wis2',
                expect.anything()
            );
        });
    });

    describe('custom apiBasePath', () => {
        it('should respect custom apiBasePath for v1', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiBasePath: '/custom-api',
                apiVersion: 'v1',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            mockGet.mockResolvedValueOnce({
                data: {
                    provider: 'iem-stations',
                    data: { type: 'FeatureCollection', features: [] },
                    timestamp: '2024-01-01T00:00:00.000Z',
                },
            });

            await sdk.weather.getIemStations();

            expect(mockGet).toHaveBeenCalledWith(
                '/custom-api/v1/geojson/stations/azos',
                expect.anything()
            );
        });

        it('should respect custom apiBasePath for v2', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiBasePath: '/custom-api',
                apiVersion: 'v2',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            mockGet.mockResolvedValueOnce({
                data: { type: 'FeatureCollection', features: [] },
            });

            await sdk.weather.getIemStations();

            expect(mockGet).toHaveBeenCalledWith(
                '/custom-api/v2/stations?provider=iem',
                expect.anything()
            );
        });
    });

    describe('resolveEndpoint version info', () => {
        it('should use v2 params handling when version is v2', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v2',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            mockGet.mockResolvedValueOnce({
                data: { type: 'FeatureCollection', features: [] },
            });

            // v2 should pass through filters directly (no default pagination)
            await sdk.weather.getWis2Stations({ limit: 50 });

            expect(mockGet).toHaveBeenCalledWith(
                '/api/v2/stations?provider=wis2',
                { params: { limit: 50 } }
            );
        });

        it('should use v1 params handling with defaults when version is v1', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v1',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            mockGet.mockResolvedValueOnce({
                data: {
                    provider: 'wis2-stations',
                    data: { type: 'FeatureCollection', features: [] },
                    timestamp: '2024-01-01T00:00:00.000Z',
                },
            });

            // v1 should add default pagination
            await sdk.weather.getWis2Stations();

            expect(mockGet).toHaveBeenCalledWith(
                '/api/v1/geojson/stations/wis2',
                { params: { limit: 100, offset: 0 } }
            );
        });
    });
});
