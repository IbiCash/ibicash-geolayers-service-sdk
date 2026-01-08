import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeoLayersSDK } from '../../src';
import { FeatureCollection, LayerResponse, WeatherStationProps } from '../../src/types';
import { observationQueryResult } from '../fixtures';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

const buoyFeatureCollection: FeatureCollection<WeatherStationProps> = {
    type: 'FeatureCollection',
    features: [{
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-72.66, 34.68] as [number, number] },
        properties: {
            id: '41001',
            name: 'LLNR 640 - EAST HATTERAS',
            provider: 'ndbc',
        },
    }],
};

describe('MaritimeDomain', () => {
    let sdk: GeoLayersSDK;

    beforeEach(() => {
        vi.clearAllMocks();

        mockedAxios.create.mockReturnValue({
            get: vi.fn(),
            post: vi.fn(),
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() },
            },
        } as unknown as ReturnType<typeof axios.create>);

        sdk = new GeoLayersSDK({ baseUrl: 'https://api.test.com', apiKey: 'test' });
    });

    it('should fetch buoy stations', async () => {
        const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
        const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

        const mockResponse: LayerResponse<FeatureCollection<WeatherStationProps>> = {
            provider: 'ndbc',
            data: buoyFeatureCollection,
            timestamp: '2024-01-01T00:00:00.000Z',
        };

        mockGet.mockResolvedValueOnce({ data: mockResponse });

        const result = await sdk.maritime.getBuoyStations();

        expect(mockGet).toHaveBeenCalledWith('/geojson/buoys/stations', { params: undefined });
        expect(result.data.features[0].properties.id).toBe('41001');
    });

    it('should fetch latest buoy observations', async () => {
        const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
        const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

        const mockResponse: LayerResponse<FeatureCollection<WeatherStationProps>> = {
            provider: 'ndbc',
            data: buoyFeatureCollection,
            timestamp: '2024-01-01T00:00:00.000Z',
        };

        mockGet.mockResolvedValueOnce({ data: mockResponse });

        const result = await sdk.maritime.getLatestBuoyObservations();

        expect(mockGet).toHaveBeenCalledWith('/geojson/buoys/observations', { params: undefined });
    });

    it('should fetch buoy observations with filters', async () => {
        const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
        const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

        mockGet.mockResolvedValueOnce({ data: observationQueryResult });

        const filters = { start: '2024-01-01', end: '2024-01-31' };
        const result = await sdk.maritime.getBuoyObservations('41001', filters);

        expect(mockGet).toHaveBeenCalledWith('/observations/buoy/41001', { params: filters });
    });
});
