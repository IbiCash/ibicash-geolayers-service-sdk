import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeoLayersSDK } from '../../src';
import { FeatureCollection, FlightProps, LayerResponse } from '../../src/types';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

const flightLayerResponse: LayerResponse<FeatureCollection<FlightProps>> = {
    provider: 'global-flights',
    data: {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-122.4, 37.6, 10668] as [number, number, number] },
            properties: {
                icao24: 'a1b2c3',
                callsign: 'UAL123',
                originCountry: 'United States',
                velocity: 250.5,
                geoAltitude: 10668,
                onGround: false,
                baroAltitude: 10972,
            },
        }],
    },
    timestamp: '2024-01-01T00:00:00.000Z',
    count: 1,
};

describe('AviationDomain', () => {
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

    it('should fetch global flights', async () => {
        const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
        const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

        mockGet.mockResolvedValueOnce({ data: flightLayerResponse });

        const result = await sdk.aviation.getGlobalFlights();

        expect(mockGet).toHaveBeenCalledWith('/api/v1/geojson/flights/global', {
            params: {
                lamin: -90,
                lomin: -180,
                lamax: 90,
                lomax: 180,
            }
        });
        expect(result.data.features[0].properties.callsign).toBe('UAL123');
    });

    it('should fetch live flights', async () => {
        const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
        const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

        mockGet.mockResolvedValueOnce({ data: flightLayerResponse });

        const result = await sdk.aviation.getLiveFlights();

        expect(mockGet).toHaveBeenCalledWith('/api/v1/geojson/flights/live', {
            params: {
                lat: 40.7128,
                lng: -74.006,
                radius: 250,
            }
        });
    });
});
