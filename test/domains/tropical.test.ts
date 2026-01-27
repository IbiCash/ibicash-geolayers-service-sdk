import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeoLayersSDK } from '../../src';
import { FeatureCollection, LayerResponse, StormProps } from '../../src/types';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

const stormLayerResponse: LayerResponse<FeatureCollection<StormProps>> = {
    provider: 'active-storms',
    data: {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-75.5, 23.8] as [number, number] },
            properties: {
                stormid: 'AL012024',
                stormname: 'Alberto',
                category: 1,
                windSpeed: 75,
                pressure: 990,
                status: 'active',
            },
        }],
    },
    timestamp: '2024-01-01T00:00:00.000Z',
    count: 1,
};

describe('TropicalDomain', () => {
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

    it('should fetch active storms', async () => {
        const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
        const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

        mockGet.mockResolvedValueOnce({ data: stormLayerResponse });

        const result = await sdk.tropical.getActiveStorms();

        expect(mockGet).toHaveBeenCalledWith('/api/v1/geojson/storms/active', { params: undefined });
        expect(result.data.features[0].properties.stormname).toBe('Alberto');
    });

    it('should fetch recent storms', async () => {
        const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
        const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

        mockGet.mockResolvedValueOnce({ data: stormLayerResponse });

        const result = await sdk.tropical.getRecentStorms();

        expect(mockGet).toHaveBeenCalledWith('/api/v1/geojson/storms/recent', { params: undefined });
    });
});
