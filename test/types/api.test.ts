import { describe, expect, it } from 'vitest';
import { createFeatureCollectionSchema, createLayerResponseSchema, EarthquakePropsSchema, LayerMetadataSchema } from '../../src/types';
import { earthquakeLayerResponse } from '../fixtures';

describe('LayerMetadataSchema', () => {
    it('should validate layer metadata', () => {
        const metadata = {
            source: 'USGS Earthquake Hazards Program',
            cacheTTL: 86400,
            cached: false,
        };
        const result = LayerMetadataSchema.parse(metadata);
        expect(result.source).toBe('USGS Earthquake Hazards Program');
        expect(result.cacheTTL).toBe(86400);
        expect(result.cached).toBe(false);
    });

    it('should allow optional snapshotId', () => {
        const metadata = {
            source: 'Test',
            cacheTTL: 3600,
            cached: true,
            snapshotId: 'abc123',
        };
        const result = LayerMetadataSchema.parse(metadata);
        expect(result.snapshotId).toBe('abc123');
    });

    it('should reject missing required fields', () => {
        const invalid = { source: 'Test' };
        expect(() => LayerMetadataSchema.parse(invalid)).toThrow();
    });
});

describe('createLayerResponseSchema', () => {
    it('should validate LayerResponse with FeatureCollection data', () => {
        const dataSchema = createFeatureCollectionSchema(EarthquakePropsSchema);
        const responseSchema = createLayerResponseSchema(dataSchema);

        const result = responseSchema.parse(earthquakeLayerResponse);
        expect(result.provider).toBe('earthquakes');
        expect(result.timestamp).toBe('2024-01-01T00:00:00.000Z');
        expect(result.count).toBe(1);
        expect(result.data.type).toBe('FeatureCollection');
        expect(result.data.features).toHaveLength(1);
    });

    it('should validate LayerResponse without optional fields', () => {
        const dataSchema = createFeatureCollectionSchema(EarthquakePropsSchema);
        const responseSchema = createLayerResponseSchema(dataSchema);

        const minimalResponse = {
            provider: 'earthquakes',
            data: {
                type: 'FeatureCollection',
                features: [],
            },
            timestamp: '2024-01-01T00:00:00.000Z',
        };

        const result = responseSchema.parse(minimalResponse);
        expect(result.count).toBeUndefined();
        expect(result.metadata).toBeUndefined();
    });

    it('should reject invalid data structure', () => {
        const dataSchema = createFeatureCollectionSchema(EarthquakePropsSchema);
        const responseSchema = createLayerResponseSchema(dataSchema);

        const invalidResponse = {
            provider: 'earthquakes',
            data: { invalid: true },
            timestamp: '2024-01-01T00:00:00.000Z',
        };

        expect(() => responseSchema.parse(invalidResponse)).toThrow();
    });
});
