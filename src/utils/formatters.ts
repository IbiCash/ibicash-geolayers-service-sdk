/**
 * Utility functions for formatting and converting geospatial data.
 */
export const UnitConverters = {
    // Temperature
    fahrenheitToCelsius: (f: number) => (f - 32) * (5 / 9),
    celsiusToFahrenheit: (c: number) => c * (9 / 5) + 32,

    // Speed
    knotsToMs: (knots: number) => knots * 0.514444,
    msToKnots: (ms: number) => ms / 0.514444,
    kmhToMs: (kmh: number) => kmh / 3.6,
    msToKmh: (ms: number) => ms * 3.6,

    // Pressure
    inHgToHpa: (inhg: number) => inhg * 33.8639,
    hpaToInHg: (hpa: number) => hpa / 33.8639,
};

/**
 * Formats coordinates for display.
 */
export function formatCoordinates(lat: number, lon: number): string {
    return `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
}

/**
 * Normalizes a provider name to a clean display string.
 */
export function formatProviderName(provider: string): string {
    return provider
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
