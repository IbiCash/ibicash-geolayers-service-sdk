import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeoLayersSDK } from '../../src';
import { ChartResponse } from '../../src/types';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

const chartResponse: ChartResponse = {
    data: [
        {
            stationId: 'wis2:0-123-456',
            timestamp: '2024-01-01T12:00:00.000Z',
            measurements: {
                temperature: 22.5,
                windSpeed: 5.2,
                windDirection: 180,
                humidity: 65,
            },
        },
        {
            stationId: 'wis2:0-123-456',
            timestamp: '2024-01-01T13:00:00.000Z',
            measurements: {
                temperature: 23.1,
                windSpeed: 4.8,
                windDirection: 175,
                humidity: 62,
            },
        },
    ],
    meta: {
        stationId: 'wis2:0-123-456',
        timeRange: {
            start: '2024-01-01T00:00:00.000Z',
            end: '2024-01-01T23:59:59.000Z',
        },
        count: 2,
    },
};

describe('ObservationsDomain', () => {
    const createMockAxiosInstance = () => ({
        get: vi.fn(),
        post: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
    } as unknown as ReturnType<typeof axios.create>);

    describe('getChartData', () => {
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

            it('should fetch chart data with start/end filters', async () => {
                const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
                const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

                mockGet.mockResolvedValueOnce({ data: chartResponse });

                const result = await sdk.observations.getChartData('wis2:0-123-456', {
                    start: '2024-01-01T00:00:00.000Z',
                    end: '2024-01-01T23:59:59.000Z',
                });

                expect(mockGet).toHaveBeenCalledWith('/api/v2/observations/wis2:0-123-456/chart', {
                    params: { start: '2024-01-01T00:00:00.000Z', end: '2024-01-01T23:59:59.000Z' },
                });
                expect(result.data).toHaveLength(2);
                expect(result.meta.stationId).toBe('wis2:0-123-456');
            });

            it('should fetch chart data with only start filter (end defaults to now)', async () => {
                const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
                const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

                mockGet.mockResolvedValueOnce({ data: chartResponse });

                const result = await sdk.observations.getChartData('iem:KJFK', {
                    start: '2024-01-01T00:00:00.000Z',
                });

                expect(mockGet).toHaveBeenCalledWith('/api/v2/observations/iem:KJFK/chart', {
                    params: { start: '2024-01-01T00:00:00.000Z' },
                });
                expect(result.data).toHaveLength(2);
            });

            it('should return properly typed measurements', async () => {
                const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
                const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

                mockGet.mockResolvedValueOnce({ data: chartResponse });

                const result = await sdk.observations.getChartData('wis2:0-123-456', {
                    start: '2024-01-01T00:00:00.000Z',
                });

                const firstObservation = result.data[0];
                expect(firstObservation.measurements.temperature).toBe(22.5);
                expect(firstObservation.measurements.windSpeed).toBe(5.2);
                expect(firstObservation.measurements.windDirection).toBe(180);
                expect(firstObservation.measurements.humidity).toBe(65);
            });
        });

        describe('with apiVersion v1', () => {
            let sdk: GeoLayersSDK;

            beforeEach(() => {
                vi.clearAllMocks();
                mockedAxios.create.mockReturnValue(createMockAxiosInstance());
                sdk = new GeoLayersSDK({
                    baseUrl: 'https://api.test.com',
                    apiKey: 'test',
                    apiVersion: 'v1',
                });
            });

            it('should fallback to v2 endpoint when v1 is not available', async () => {
                const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
                const mockGet = mockAxiosInstance.get as ReturnType<typeof vi.fn>;

                mockGet.mockResolvedValueOnce({ data: chartResponse });

                const result = await sdk.observations.getChartData('wis2:0-123-456', {
                    start: '2024-01-01T00:00:00.000Z',
                });

                // Should use v2 since v1 is not available for this endpoint
                expect(mockGet).toHaveBeenCalledWith('/api/v2/observations/wis2:0-123-456/chart', {
                    params: { start: '2024-01-01T00:00:00.000Z' },
                });
                expect(result.data).toHaveLength(2);
            });
        });
    });
});
