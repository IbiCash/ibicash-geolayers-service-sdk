import { ObservationQueryResult, StandardObservation } from '../../src/types';

export const standardObservation: StandardObservation = {
    timestamp: '2024-01-01T12:00:00.000Z',
    stationId: 'WIGOS-0-20000-0-12345',
    latitude: 40.7128,
    longitude: -74.006,
    measurements: {
        airTemperature: { value: 22.5, unit: '°C', quality: 'good' },
        windSpeed: { value: 5.2, unit: 'm/s', quality: 'good' },
        windDirection: { value: 180, unit: 'degrees' },
        pressure: { value: 1013.25, unit: 'hPa' },
        relativeHumidity: { value: 65, unit: '%' },
    },
    metadata: {
        provider: 'wis2',
        collection: 'synop',
    },
};

export const observationQueryResult: ObservationQueryResult = {
    stationId: 'WIGOS-0-20000-0-12345',
    observations: [standardObservation],
    count: 1,
    timeRange: {
        start: '2024-01-01T00:00:00.000Z',
        end: '2024-01-01T23:59:59.000Z',
    },
    provider: 'wis2',
    cached: false,
};

export const buoyObservation: StandardObservation = {
    timestamp: '2024-01-01T12:00:00.000Z',
    stationId: '41001',
    latitude: 34.68,
    longitude: -72.66,
    measurements: {
        waterTemperature: { value: 18.3, unit: '°C' },
        waveHeight: { value: 2.1, unit: 'm' },
        wavePeriod: { value: 8, unit: 's' },
        windSpeed: { value: 7.8, unit: 'm/s' },
        pressure: { value: 1018.5, unit: 'hPa' },
    },
    imageUrl: 'https://www.ndbc.noaa.gov/images/stations/41001.jpg',
};
