import { describe, expect, it } from 'vitest';
import {
    createFeatureCollectionSchema,
    createFeatureSchema,
    EarthquakePropsSchema,
    FlightPropsSchema,
    GeometrySchema,
    ObservationQueryResultSchema,
    StandardObservationSchema,
    StormPropsSchema,
    VolcanoPropsSchema,
    WeatherStationPropsSchema,
    WildfirePropsSchema,
} from '../../src/types';
import {
    earthquakeFeature,
    earthquakeFeatureCollection,
    invalidEarthquakeProps,
    observationQueryResult,
    standardObservation,
} from '../fixtures';

describe('GeometrySchema', () => {
    it('should validate Point geometry', () => {
        const point = { type: 'Point', coordinates: [-122.714, 38.8128] };
        expect(() => GeometrySchema.parse(point)).not.toThrow();
    });

    it('should validate Point with altitude', () => {
        const point = { type: 'Point', coordinates: [-122.714, 38.8128, 100] };
        expect(() => GeometrySchema.parse(point)).not.toThrow();
    });

    it('should validate Polygon geometry', () => {
        const polygon = {
            type: 'Polygon',
            coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        };
        expect(() => GeometrySchema.parse(polygon)).not.toThrow();
    });

    it('should reject invalid geometry type', () => {
        const invalid = { type: 'InvalidType', coordinates: [0, 0] };
        expect(() => GeometrySchema.parse(invalid)).toThrow();
    });
});

describe('EarthquakePropsSchema', () => {
    it('should validate earthquake properties from fixture', () => {
        const result = EarthquakePropsSchema.parse(earthquakeFeature.properties);
        expect(result.mag).toBe(4.2);
        expect(result.place).toBe('10km NW of The Geysers, CA');
        expect(result.tsunami).toBe(0);
    });

    it('should reject invalid earthquake properties', () => {
        expect(() => EarthquakePropsSchema.parse(invalidEarthquakeProps)).toThrow();
    });

    it('should allow optional fields to be null', () => {
        const minimalProps = {
            mag: 3.0,
            place: 'Somewhere',
            time: 1704067200000,
            updated: 1704070800000,
            url: 'https://example.com',
            detail: 'https://example.com/detail',
            status: 'reviewed',
            tsunami: 0,
            sig: 100,
            net: 'nc',
            code: '123',
            ids: ',nc123,',
            sources: ',nc,',
            types: ',origin,',
            magType: 'ml',
            type: 'earthquake',
            title: 'M 3.0',
        };
        expect(() => EarthquakePropsSchema.parse(minimalProps)).not.toThrow();
    });
});

describe('createFeatureSchema', () => {
    it('should validate Feature with earthquake properties', () => {
        const featureSchema = createFeatureSchema(EarthquakePropsSchema);
        const result = featureSchema.parse(earthquakeFeature);
        expect(result.type).toBe('Feature');
        expect(result.properties.mag).toBe(4.2);
    });
});

describe('createFeatureCollectionSchema', () => {
    it('should validate FeatureCollection with earthquake properties', () => {
        const fcSchema = createFeatureCollectionSchema(EarthquakePropsSchema);
        const result = fcSchema.parse(earthquakeFeatureCollection);
        expect(result.type).toBe('FeatureCollection');
        expect(result.features).toHaveLength(1);
        expect(result.features[0].properties.mag).toBe(4.2);
    });
});

describe('StandardObservationSchema', () => {
    it('should validate standard observation from fixture', () => {
        const result = StandardObservationSchema.parse(standardObservation);
        expect(result.stationId).toBe('WIGOS-0-20000-0-12345');
        expect(result.measurements.airTemperature?.value).toBe(22.5);
    });
});

describe('ObservationQueryResultSchema', () => {
    it('should validate observation query result from fixture', () => {
        const result = ObservationQueryResultSchema.parse(observationQueryResult);
        expect(result.stationId).toBe('WIGOS-0-20000-0-12345');
        expect(result.count).toBe(1);
        expect(result.provider).toBe('wis2');
    });
});

describe('Other Property Schemas', () => {
    it('should validate volcano properties', () => {
        const volcanoProps = {
            volcanoName: 'Mount Erebus',
            country: 'Antarctica',
            primaryVolcanoType: 'Stratovolcano',
            lastEruptionYear: '2021',
            summitElevation: 3794,
        };
        expect(() => VolcanoPropsSchema.parse(volcanoProps)).not.toThrow();
    });

    it('should validate storm properties', () => {
        const stormProps = {
            stormId: 'AL012024',
            stormName: 'Alberto',
            category: 1,
            windSpeed: 75,
            pressure: 990,
            status: 'active',
        };
        expect(() => StormPropsSchema.parse(stormProps)).not.toThrow();
    });

    it('should validate wildfire properties', () => {
        const wildfireProps = {
            brightness: 325.8,
            scan: 1.0,
            track: 1.0,
            acq_date: '2024-01-01',
            acq_time: '0430',
            satellite: 'N',
            confidence: 85,
            frp: 12.5,
        };
        expect(() => WildfirePropsSchema.parse(wildfireProps)).not.toThrow();
    });

    it('should validate flight properties', () => {
        const flightProps = {
            icao24: 'a1b2c3',
            callsign: 'UAL123',
            originCountry: 'United States',
            velocity: 250.5,
            geoAltitude: 10668,
            onGround: false,
            baroAltitude: 10972,
        };
        expect(() => FlightPropsSchema.parse(flightProps)).not.toThrow();
    });

    it('should validate weather station properties', () => {
        const stationProps = {
            id: 'WIGOS-0-20000-0-12345',
            name: 'New York Central Park',
            provider: 'wis2',
            measurements: {
                airTemperature: { value: 22.5, unit: '°C' },
            },
        };
        expect(() => WeatherStationPropsSchema.parse(stationProps)).not.toThrow();
    });
});
