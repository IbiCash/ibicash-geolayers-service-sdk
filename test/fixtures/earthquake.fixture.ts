import { EarthquakeProps, Feature, FeatureCollection, LayerResponse } from '../../src/types';

export const earthquakeFeature: Feature<EarthquakeProps> = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [-122.714, 38.8128, 2.48] as [number, number, number],
    },
    properties: {
        mag: 4.2,
        place: '10km NW of The Geysers, CA',
        time: 1704067200000,
        updated: 1704070800000,
        tz: null,
        url: 'https://earthquake.usgs.gov/earthquakes/eventpage/nc73123456',
        detail: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/nc73123456.geojson',
        felt: 125,
        cdi: 4.5,
        mmi: 3.8,
        alert: 'green',
        status: 'reviewed',
        tsunami: 0,
        sig: 271,
        net: 'nc',
        code: '73123456',
        ids: ',nc73123456,',
        sources: ',nc,',
        types: ',dyfi,origin,phase-data,',
        nst: 42,
        dmin: 0.008,
        rms: 0.05,
        gap: 36,
        magType: 'ml',
        type: 'earthquake',
        title: 'M 4.2 - 10km NW of The Geysers, CA',
    },
    id: 'nc73123456',
};

export const earthquakeFeatureCollection: FeatureCollection<EarthquakeProps> = {
    type: 'FeatureCollection',
    features: [earthquakeFeature],
    bbox: [-180, -90, 180, 90],
};

export const earthquakeLayerResponse: LayerResponse<FeatureCollection<EarthquakeProps>> = {
    provider: 'earthquakes',
    data: earthquakeFeatureCollection,
    timestamp: '2024-01-01T00:00:00.000Z',
    count: 1,
    metadata: {
        source: 'USGS Earthquake Hazards Program',
        cacheTTL: 86400,
        cached: false,
    },
};

export const invalidEarthquakeProps = {
    mag: 'not-a-number',
    place: 123,
};
