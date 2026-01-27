import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeoLayersSDK } from '../../src';
import { earthquakeLayerResponse } from '../fixtures';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

describe('SeismicDomain', () => {
    const config = {
        baseUrl: 'https://api.test.com',
        apiKey: 'test-api-key',
    };

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

        sdk = new GeoLayersSDK(config);
    });

    describe('getEarthquakes', () => {
        it('should fetch and validate earthquakes', async () => {
            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            mockGet.mockResolvedValueOnce({ data: earthquakeLayerResponse });

            const result = await sdk.seismic.getEarthquakes();

            expect(result.provider).toBe('earthquakes');
            expect(result.data.features).toHaveLength(1);
            expect(mockGet).toHaveBeenCalledWith('/api/v1/geojson/earthquakes', expect.objectContaining({
                params: expect.objectContaining({
                    startTime: expect.any(String),
                    endTime: expect.any(String),
                })
            }));
            expect(result.data.features[0].properties.mag).toBe(4.2);
        });

        it('should pass filters to the API', async () => {
            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            mockGet.mockResolvedValueOnce({ data: earthquakeLayerResponse });

            const filters = { startTime: '2024-01-01', endTime: '2024-01-31', minMagnitude: 4.0 };
            await sdk.seismic.getEarthquakes(filters);

            expect(mockGet).toHaveBeenCalledWith('/api/v1/geojson/earthquakes', { params: filters });
        });

        it('should throw on invalid response data', async () => {
            const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
            const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

            const invalidResponse = {
                provider: 'earthquakes',
                data: { type: 'Invalid', features: [] },
                timestamp: '2024-01-01T00:00:00.000Z',
            };

            mockGet.mockResolvedValueOnce({ data: invalidResponse });

            await expect(sdk.seismic.getEarthquakes()).rejects.toThrow();
        });
    });
});
