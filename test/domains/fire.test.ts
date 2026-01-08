import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeoLayersSDK } from '../../src';
import { FeatureCollection, LayerResponse, WildfireProps } from '../../src/types';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

const wildfireLayerResponse: LayerResponse<FeatureCollection<WildfireProps>> = {
    provider: 'wildfires',
    data: {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-121.5, 38.6] as [number, number] },
            properties: {
                brightness: 325.8,
                scan: 1.0,
                track: 1.0,
                acq_date: '2024-01-01',
                acq_time: '0430',
                satellite: 'N',
                confidence: 85,
                frp: 12.5,
            },
        }],
    },
    timestamp: '2024-01-01T00:00:00.000Z',
    count: 1,
};

describe('FireDomain', () => {
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

    it('should fetch wildfires', async () => {
        const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
        const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

        mockGet.mockResolvedValueOnce({ data: wildfireLayerResponse });

        const result = await sdk.fire.getWildfires();

        expect(mockGet).toHaveBeenCalledWith('/geojson/wildfires', { params: { days: 1 } });
        expect(result.data.features[0].properties.brightness).toBe(325.8);
    });
});
