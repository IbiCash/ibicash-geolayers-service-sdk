import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeoLayersSDK } from '../../src';
import { FeatureCollection, LayerResponse, WeatherStationProps } from '../../src/types';
import { observationQueryResult } from '../fixtures';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

const stationFeatureCollection: FeatureCollection<WeatherStationProps> = {
    type: 'FeatureCollection',
    features: [{
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-74.006, 40.7128] as [number, number] },
        properties: {
            id: 'WIGOS-0-20000-0-12345',
            name: 'New York Central Park',
            provider: 'wis2',
        },
    }],
};

describe('WeatherDomain', () => {
    const createMockAxiosInstance = () => ({
        get: vi.fn(),
        post: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
    } as unknown as ReturnType<typeof axios.create>);

    describe('with apiVersion v1 (default)', () => {
        let sdk: GeoLayersSDK;

        beforeEach(() => {
            vi.clearAllMocks();
            mockedAxios.create.mockReturnValue(createMockAxiosInstance());
            sdk = new GeoLayersSDK({ baseUrl: 'https://api.test.com', apiKey: 'test' });
        });

        describe('WIS2', () => {
            it('should fetch WIS2 stations', async () => {
                const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
                const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

                const mockResponse: LayerResponse<FeatureCollection<WeatherStationProps>> = {
                    provider: 'wis2',
                    data: stationFeatureCollection,
                    timestamp: '2024-01-01T00:00:00.000Z',
                };

                mockGet.mockResolvedValueOnce({ data: mockResponse });

                const result = await sdk.weather.getWis2Stations();

                expect(mockGet).toHaveBeenCalledWith('/api/v1/geojson/stations/wis2', {
                    params: {
                        limit: 100,
                        offset: 0
                    }
                });
                expect(result.data.features[0].properties.provider).toBe('wis2');
            });

            it('should fetch WIS2 observations with filters', async () => {
                const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
                const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

                mockGet.mockResolvedValueOnce({ data: observationQueryResult });

                const filters = { start: '2024-01-01', end: '2024-01-31' };
                const result = await sdk.weather.getWis2Observations('WIGOS-123', filters);

                expect(mockGet).toHaveBeenCalledWith('/api/v1/observations/wis2/WIGOS-123', { params: filters });
                expect(result.stationId).toBe('WIGOS-0-20000-0-12345');
            });
        });

        describe('IEM/AZOS', () => {
            it('should fetch IEM stations', async () => {
                const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
                const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

                const mockResponse: LayerResponse<FeatureCollection<WeatherStationProps>> = {
                    provider: 'azos-weather-network',
                    data: stationFeatureCollection,
                    timestamp: '2024-01-01T00:00:00.000Z',
                };

                mockGet.mockResolvedValueOnce({ data: mockResponse });

                const result = await sdk.weather.getIemStations();

                expect(mockGet).toHaveBeenCalledWith('/api/v1/geojson/stations/azos', { params: undefined });
            });

            it('should fetch IEM observations', async () => {
                const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
                const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

                mockGet.mockResolvedValueOnce({ data: observationQueryResult });

                const filters = { start: '2024-01-01', end: '2024-01-31' };
                const result = await sdk.weather.getIemObservations('KNYC', filters);

                expect(mockGet).toHaveBeenCalledWith('/api/v1/observations/iem/KNYC', { params: filters });
            });
        });
    });

    describe('with apiVersion v2', () => {
        let sdk: GeoLayersSDK;

        beforeEach(() => {
            vi.clearAllMocks();
            mockedAxios.create.mockReturnValue(createMockAxiosInstance());
            sdk = new GeoLayersSDK({
                baseUrl: 'https://api.test.com',
                apiKey: 'test',
                apiVersion: 'v2',
            });
        });

        describe('WIS2', () => {
            it('should use v2 endpoint for getWis2Stations when available', async () => {
                const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
                const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

                // v2 returns direct FeatureCollection
                mockGet.mockResolvedValueOnce({ data: stationFeatureCollection });

                const result = await sdk.weather.getWis2Stations();

                expect(mockGet).toHaveBeenCalledWith('/api/v2/stations?provider=wis2', {
                    params: {}
                });
                expect(result.data.features[0].properties.provider).toBe('wis2');
            });

            it('should pass filters directly without defaults for v2', async () => {
                const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
                const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

                mockGet.mockResolvedValueOnce({ data: stationFeatureCollection });

                await sdk.weather.getWis2Stations({ limit: 50 });

                expect(mockGet).toHaveBeenCalledWith('/api/v2/stations?provider=wis2', {
                    params: { limit: 50 }
                });
            });

            it('should fallback to v1 for getWis2Observations (v1-only endpoint)', async () => {
                const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
                const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

                mockGet.mockResolvedValueOnce({ data: observationQueryResult });

                const filters = { start: '2024-01-01', end: '2024-01-31' };
                await sdk.weather.getWis2Observations('WIGOS-123', filters);

                expect(mockGet).toHaveBeenCalledWith('/api/v1/observations/wis2/WIGOS-123', { params: filters });
            });
        });

        describe('IEM/AZOS', () => {
            it('should use v2 endpoint for getIemStations when available', async () => {
                const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
                const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

                // v2 returns direct FeatureCollection
                mockGet.mockResolvedValueOnce({ data: stationFeatureCollection });

                await sdk.weather.getIemStations();

                expect(mockGet).toHaveBeenCalledWith('/api/v2/stations?provider=iem', { params: undefined });
            });

            it('should fallback to v1 for getIemObservations (v1-only endpoint)', async () => {
                const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
                const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

                mockGet.mockResolvedValueOnce({ data: observationQueryResult });

                const filters = { start: '2024-01-01', end: '2024-01-31' };
                await sdk.weather.getIemObservations('KNYC', filters);

                expect(mockGet).toHaveBeenCalledWith('/api/v1/observations/iem/KNYC', { params: filters });
            });
        });
    });
});
