import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeoLayersSDK } from '../../src';
import { FeatureCollection, LayerResponse, WeatherStationProps } from '../../src/types';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

const featureCollection: FeatureCollection<WeatherStationProps> = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-72.66, 34.68] as [number, number] },
            properties: {
                id: '41001',
                name: 'LLNR 640 - EAST HATTERAS',
                provider: 'ndbc',
            },
        },
        {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-73.00, 35.00] as [number, number] },
            properties: {
                id: '41002',
                name: 'Another Station',
                provider: 'ndbc',
            },
        },
    ],
};

describe('normalizeGeoJSONResponse', () => {
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

    describe('v1 LayerResponse envelope format', () => {
        it('should correctly parse v1 LayerResponse envelope format', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v1',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            const v1Response: LayerResponse<FeatureCollection<WeatherStationProps>> = {
                provider: 'ndbc',
                data: featureCollection,
                timestamp: '2024-01-01T00:00:00.000Z',
                count: 2,
            };

            mockGet.mockResolvedValueOnce({ data: v1Response });

            const result = await sdk.maritime.getBuoyStations();

            expect(result.provider).toBe('ndbc');
            expect(result.timestamp).toBe('2024-01-01T00:00:00.000Z');
            expect(result.data.type).toBe('FeatureCollection');
            expect(result.data.features).toHaveLength(2);
        });
    });

    describe('v2 direct FeatureCollection format', () => {
        it('should correctly wrap v2 direct FeatureCollection format into LayerResponse', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v2',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            // v2 returns direct FeatureCollection without envelope
            mockGet.mockResolvedValueOnce({ data: featureCollection });

            const result = await sdk.maritime.getBuoyStations();

            // Verify it's wrapped in LayerResponse format
            expect(result.provider).toBe('buoy-stations');
            expect(result.timestamp).toBeDefined();
            expect(result.data.type).toBe('FeatureCollection');
            expect(result.data.features).toHaveLength(2);
            expect(result.count).toBe(2);
        });

        it('should set provider name correctly when wrapping v2 responses', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v2',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            mockGet.mockResolvedValueOnce({ data: featureCollection });
            const buoyResult = await sdk.maritime.getBuoyStations();
            expect(buoyResult.provider).toBe('buoy-stations');

            // Reset mock for next call
            vi.clearAllMocks();
            mockedAxios.create.mockReturnValue(createMockAxiosInstance());

            const sdk2 = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v2',
            });

            const mockAxiosInstance2 = mockedAxios.create.mock.results[0].value;
            const mockGet2 = mockAxiosInstance2.get as ReturnType<typeof vi.fn>;

            mockGet2.mockResolvedValueOnce({ data: featureCollection });
            const wis2Result = await sdk2.weather.getWis2Stations();
            expect(wis2Result.provider).toBe('wis2-stations');
        });

        it('should generate timestamp when wrapping v2 responses', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v2',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            mockGet.mockResolvedValueOnce({ data: featureCollection });

            const before = new Date().toISOString();
            const result = await sdk.maritime.getBuoyStations();
            const after = new Date().toISOString();

            expect(result.timestamp).toBeDefined();
            expect(result.timestamp >= before).toBe(true);
            expect(result.timestamp <= after).toBe(true);
        });

        it('should calculate count from features length for v2 responses', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v2',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            const singleFeatureCollection: FeatureCollection<WeatherStationProps> = {
                type: 'FeatureCollection',
                features: [featureCollection.features[0]],
            };

            mockGet.mockResolvedValueOnce({ data: singleFeatureCollection });

            const result = await sdk.maritime.getBuoyStations();

            expect(result.count).toBe(1);
        });
    });

    describe('fallback behavior', () => {
        it('should fallback to parseGeoJSON for ambiguous responses', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v1',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            // A response that has LayerResponse structure
            const v1Response: LayerResponse<FeatureCollection<WeatherStationProps>> = {
                provider: 'custom-provider',
                data: featureCollection,
                timestamp: '2024-06-15T12:00:00.000Z',
            };

            mockGet.mockResolvedValueOnce({ data: v1Response });

            const result = await sdk.maritime.getBuoyStations();

            // Should preserve the original provider from response
            expect(result.provider).toBe('custom-provider');
            expect(result.timestamp).toBe('2024-06-15T12:00:00.000Z');
        });
    });

    describe('empty feature collections', () => {
        it('should handle empty v1 feature collection', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v1',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            const emptyResponse: LayerResponse<FeatureCollection<WeatherStationProps>> = {
                provider: 'ndbc',
                data: { type: 'FeatureCollection', features: [] },
                timestamp: '2024-01-01T00:00:00.000Z',
            };

            mockGet.mockResolvedValueOnce({ data: emptyResponse });

            const result = await sdk.maritime.getBuoyStations();

            expect(result.data.features).toHaveLength(0);
        });

        it('should handle empty v2 feature collection', async () => {
            const sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v2',
            });

            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            const emptyFeatureCollection = { type: 'FeatureCollection', features: [] };

            mockGet.mockResolvedValueOnce({ data: emptyFeatureCollection });

            const result = await sdk.maritime.getBuoyStations();

            expect(result.data.features).toHaveLength(0);
            expect(result.count).toBe(0);
        });
    });
});
