import { describe, expect, it } from 'vitest';
import { GeoLayersApiError, GeoLayersError, GeoLayersValidationError } from '../../src/core/errors';

describe('GeoLayersError', () => {
    it('should create error with message', () => {
        const error = new GeoLayersError('Test error');
        expect(error.message).toBe('Test error');
        expect(error.name).toBe('GeoLayersError');
    });

    it('should be instanceof Error', () => {
        const error = new GeoLayersError('Test');
        expect(error).toBeInstanceOf(Error);
    });
});

describe('GeoLayersApiError', () => {
    it('should create error with status code', () => {
        const error = new GeoLayersApiError('Not found', 404);
        expect(error.message).toBe('Not found');
        expect(error.statusCode).toBe(404);
        expect(error.name).toBe('GeoLayersApiError');
    });

    it('should store response data', () => {
        const responseData = { error: 'Invalid API key' };
        const error = new GeoLayersApiError('Unauthorized', 401, responseData);
        expect(error.response).toEqual(responseData);
    });

    it('should be instanceof GeoLayersError', () => {
        const error = new GeoLayersApiError('Error', 500);
        expect(error).toBeInstanceOf(GeoLayersError);
    });
});

describe('GeoLayersValidationError', () => {
    it('should create error with validation errors', () => {
        const zodErrors = [{ path: ['mag'], message: 'Expected number' }];
        const error = new GeoLayersValidationError('Validation failed', zodErrors);
        expect(error.message).toBe('Validation failed');
        expect(error.errors).toEqual(zodErrors);
        expect(error.name).toBe('GeoLayersValidationError');
    });

    it('should be instanceof GeoLayersError', () => {
        const error = new GeoLayersValidationError('Invalid', []);
        expect(error).toBeInstanceOf(GeoLayersError);
    });
});
