import { describe, expect, it } from 'vitest';
import { UnitConverters, formatCoordinates, formatProviderName } from '../../src/utils/formatters';

describe('UnitConverters', () => {
    describe('Temperature', () => {
        it('should convert fahrenheit to celsius', () => {
            expect(UnitConverters.fahrenheitToCelsius(32)).toBeCloseTo(0);
            expect(UnitConverters.fahrenheitToCelsius(212)).toBeCloseTo(100);
            expect(UnitConverters.fahrenheitToCelsius(68)).toBeCloseTo(20);
        });

        it('should convert celsius to fahrenheit', () => {
            expect(UnitConverters.celsiusToFahrenheit(0)).toBeCloseTo(32);
            expect(UnitConverters.celsiusToFahrenheit(100)).toBeCloseTo(212);
            expect(UnitConverters.celsiusToFahrenheit(20)).toBeCloseTo(68);
        });
    });

    describe('Speed', () => {
        it('should convert knots to m/s', () => {
            expect(UnitConverters.knotsToMs(1)).toBeCloseTo(0.514444);
            expect(UnitConverters.knotsToMs(10)).toBeCloseTo(5.14444);
        });

        it('should convert m/s to knots', () => {
            expect(UnitConverters.msToKnots(0.514444)).toBeCloseTo(1);
            expect(UnitConverters.msToKnots(5.14444)).toBeCloseTo(10);
        });

        it('should convert km/h to m/s', () => {
            expect(UnitConverters.kmhToMs(3.6)).toBeCloseTo(1);
            expect(UnitConverters.kmhToMs(36)).toBeCloseTo(10);
        });

        it('should convert m/s to km/h', () => {
            expect(UnitConverters.msToKmh(1)).toBeCloseTo(3.6);
            expect(UnitConverters.msToKmh(10)).toBeCloseTo(36);
        });
    });

    describe('Pressure', () => {
        it('should convert inHg to hPa', () => {
            expect(UnitConverters.inHgToHpa(29.92)).toBeCloseTo(1013.25, 0);
        });

        it('should convert hPa to inHg', () => {
            expect(UnitConverters.hpaToInHg(1013.25)).toBeCloseTo(29.92, 1);
        });
    });
});

describe('formatCoordinates', () => {
    it('should format coordinates with 4 decimal places', () => {
        expect(formatCoordinates(40.7128, -74.006)).toBe('40.7128°, -74.0060°');
    });

    it('should handle zero coordinates', () => {
        expect(formatCoordinates(0, 0)).toBe('0.0000°, 0.0000°');
    });

    it('should handle negative coordinates', () => {
        expect(formatCoordinates(-33.8688, 151.2093)).toBe('-33.8688°, 151.2093°');
    });
});

describe('formatProviderName', () => {
    it('should capitalize provider names', () => {
        expect(formatProviderName('earthquakes')).toBe('Earthquakes');
    });

    it('should handle hyphenated names', () => {
        expect(formatProviderName('active-storms')).toBe('Active Storms');
        expect(formatProviderName('buoys-recent')).toBe('Buoys Recent');
    });

    it('should handle multi-hyphen names', () => {
        expect(formatProviderName('nws-weather-stations')).toBe('Nws Weather Stations');
    });
});
