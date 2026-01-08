import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeoLayersSDK } from '../../src';
import { FeatureCollection, LayerResponse, VolcanoProps } from '../../src/types';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

const volcanoLayerResponse: LayerResponse<FeatureCollection<VolcanoProps>> = {
    provider: 'volcanoes',
    data: {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [167.17, -15.38] as [number, number] },
            properties: {
                volcanoName: 'Mount Yasur',
                country: 'Vanuatu',
                primaryVolcanoType: 'Stratovolcano',
                lastEruptionYear: '2024',
                elevation: 361,
            },
        }],
    },
    timestamp: '2024-01-01T00:00:00.000Z',
    count: 1,
};

describe('VolcanicDomain', () => {
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

    it('should fetch volcanoes', async () => {
        const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
        const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

        const mockResponse = {
            ...volcanoLayerResponse,
            data: volcanoLayerResponse.data.features // API returns array of features
        };
        mockGet.mockResolvedValueOnce({ data: mockResponse });

        const result = await sdk.volcanic.getVolcanoes();

        expect(mockGet).toHaveBeenCalledWith('/geojson/volcanoes', { params: undefined });
        expect(result.data.features[0].properties.volcanoName).toBe('Mount Yasur');
    });

    it('should fetch active volcanoes', async () => {
        const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
        const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

        const mockResponse = {
            ...volcanoLayerResponse,
            data: {
                ...volcanoLayerResponse.data,
                features: [{
                    ...volcanoLayerResponse.data.features[0],
                    properties: { ...volcanoLayerResponse.data.features[0].properties, name: 'Yasur' } // Ensure properties match ActiveVolcanoProps
                }]
            }
        };
        mockGet.mockResolvedValueOnce({ data: mockResponse });

        const result = await sdk.volcanic.getActiveVolcanoes();

        expect(mockGet).toHaveBeenCalledWith('/geojson/volcanoes/active', { params: undefined });
        expect(result.provider).toBe('volcanoes');
    });
});
