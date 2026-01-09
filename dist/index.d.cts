import { AxiosInstance } from 'axios';
import { z } from 'zod';
import { EventEmitter } from 'events';

interface GeoLayersConfig {
    baseUrl: string;
    apiKey: string;
    timeout?: number;
    retries?: number;
}
declare const DEFAULT_CONFIG: Partial<GeoLayersConfig>;

declare enum LayerProvider {
    VOLCANOES = "volcanoes",
    ACTIVE_VOLCANOES = "active-volcanoes",
    WILDFIRES = "wildfires",
    ACTIVE_STORMS = "active-storms",
    RECENT_STORMS = "recent-storms",
    EARTHQUAKES = "earthquakes",
    BUOYS_RECENT = "buoys-recent",
    BUOYS_LATEST = "buoys-latest",
    NWS_STATIONS = "nws-weather-stations",
    AZOS_NETWORK = "azos-weather-network",
    WIS2_STATIONS = "wis2-stations",
    GLOBAL_FLIGHTS = "global-flights",
    LIVE_FLIGHTS = "live-flights",
    FLIGHT_SCHEDULE = "flight-schedule"
}
declare const LayerMetadataSchema: z.ZodObject<{
    source: z.ZodString;
    cacheTTL: z.ZodNumber;
    cached: z.ZodBoolean;
    snapshotId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type LayerMetadata = z.infer<typeof LayerMetadataSchema>;
/**
 * Standard API response envelope for all geospatial data.
 * @template T The type of data being returned (usually a FeatureCollection).
 */
interface LayerResponse<T> {
    provider: LayerProvider | string;
    data: T;
    timestamp: string;
    count?: number;
    metadata?: LayerMetadata;
}
/**
 * Schema for validating the LayerResponse envelope.
 * Does not validate the 'data' field strictly as it varies by provider.
 */
declare const createLayerResponseSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    provider: z.ZodString;
    data: T;
    timestamp: z.ZodString;
    count: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodObject<{
        source: z.ZodString;
        cacheTTL: z.ZodNumber;
        cached: z.ZodBoolean;
        snapshotId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;

declare const GeometrySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"Point">;
    coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"LineString">;
    coordinates: z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"Polygon">;
    coordinates: z.ZodArray<z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"MultiPoint">;
    coordinates: z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"MultiLineString">;
    coordinates: z.ZodArray<z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"MultiPolygon">;
    coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>>>;
}, z.core.$strip>], "type">;
type Geometry = z.infer<typeof GeometrySchema>;
/**
 * A GeoJSON Feature with type-safe properties.
 * @template P Shape of the properties object.
 */
interface Feature<P = Record<string, unknown>> {
    type: 'Feature';
    geometry: Geometry;
    properties: P;
    id?: string | number;
}
/**
 * A GeoJSON FeatureCollection with type-safe features.
 * @template P Shape of the properties object for each feature.
 */
interface FeatureCollection<P = Record<string, unknown>> {
    type: 'FeatureCollection';
    features: Feature<P>[];
    bbox?: number[];
}
/**
 * Creates a Zod schema for a Feature with specific property validation.
 */
declare const createFeatureSchema: <P extends z.ZodTypeAny>(propsSchema: P) => z.ZodObject<{
    type: z.ZodLiteral<"Feature">;
    geometry: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"Point">;
        coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"LineString">;
        coordinates: z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"Polygon">;
        coordinates: z.ZodArray<z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"MultiPoint">;
        coordinates: z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"MultiLineString">;
        coordinates: z.ZodArray<z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"MultiPolygon">;
        coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>>>;
    }, z.core.$strip>], "type">;
    properties: P;
    id: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
/**
 * Creates a Zod schema for a FeatureCollection with specific property validation.
 */
declare const createFeatureCollectionSchema: <P extends z.ZodTypeAny>(propsSchema: P) => z.ZodObject<{
    type: z.ZodLiteral<"FeatureCollection">;
    features: z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"Feature">;
        geometry: z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"Point">;
            coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"LineString">;
            coordinates: z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"Polygon">;
            coordinates: z.ZodArray<z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"MultiPoint">;
            coordinates: z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"MultiLineString">;
            coordinates: z.ZodArray<z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"MultiPolygon">;
            coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], z.ZodNumber>>>>;
        }, z.core.$strip>], "type">;
        properties: P;
        id: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    }, z.core.$strip>>;
    bbox: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
}, z.core.$strip>;
declare const EarthquakePropsSchema: z.ZodObject<{
    mag: z.ZodNumber;
    place: z.ZodString;
    time: z.ZodNumber;
    updated: z.ZodNumber;
    tz: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    url: z.ZodString;
    detail: z.ZodString;
    felt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cdi: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    mmi: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    alert: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodString;
    tsunami: z.ZodNumber;
    sig: z.ZodNumber;
    net: z.ZodString;
    code: z.ZodString;
    ids: z.ZodString;
    sources: z.ZodString;
    types: z.ZodString;
    nst: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    dmin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rms: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    gap: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    magType: z.ZodString;
    type: z.ZodString;
    title: z.ZodString;
}, z.core.$strip>;
type EarthquakeProps = z.infer<typeof EarthquakePropsSchema>;
declare const VolcanoPropsSchema: z.ZodObject<{
    volcanoNumber: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    volcanoName: z.ZodString;
    volcanicLandform: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    primaryVolcanoType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lastEruptionYear: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    country: z.ZodString;
    region: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    subregion: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    geologicalSummary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    latitude: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    longitude: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    elevation: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    tectonicSetting: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    geologicEpoch: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    evidenceCategory: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    primaryPhotoLink: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    primaryPhotoCaption: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    primaryPhotoCredit: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    majorRockType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
type VolcanoProps = z.infer<typeof VolcanoPropsSchema>;
declare const ActiveVolcanoPropsSchema: z.ZodObject<{
    name: z.ZodString;
    eventtype: z.ZodOptional<z.ZodString>;
    eventid: z.ZodOptional<z.ZodNumber>;
    episodeid: z.ZodOptional<z.ZodNumber>;
    eventname: z.ZodOptional<z.ZodString>;
    glide: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    htmldescription: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    iconoverall: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodObject<{
        geometry: z.ZodOptional<z.ZodString>;
        report: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    alertlevel: z.ZodOptional<z.ZodString>;
    alertscore: z.ZodOptional<z.ZodNumber>;
    episodealertlevel: z.ZodOptional<z.ZodString>;
    episodealertscore: z.ZodOptional<z.ZodNumber>;
    istemporary: z.ZodOptional<z.ZodString>;
    iscurrent: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    fromdate: z.ZodOptional<z.ZodString>;
    todate: z.ZodOptional<z.ZodString>;
    datemodified: z.ZodOptional<z.ZodString>;
    iso3: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
    sourceid: z.ZodOptional<z.ZodString>;
    polygonlabel: z.ZodOptional<z.ZodString>;
    class: z.ZodOptional<z.ZodString>;
    affectedcountries: z.ZodOptional<z.ZodArray<z.ZodObject<{
        iso2: z.ZodOptional<z.ZodString>;
        iso3: z.ZodOptional<z.ZodString>;
        countryname: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    severitydata: z.ZodOptional<z.ZodObject<{
        severity: z.ZodOptional<z.ZodNumber>;
        severitytext: z.ZodOptional<z.ZodString>;
        severityunit: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    marketType: z.ZodOptional<z.ZodLiteral<"volcano">>;
    volcname: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type ActiveVolcanoProps = z.infer<typeof ActiveVolcanoPropsSchema>;
declare const WeatherStationPropsSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    wigos_station_identifier: z.ZodOptional<z.ZodString>;
    station_identifier: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    station_name: z.ZodOptional<z.ZodString>;
    provider: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    baseUrl: z.ZodOptional<z.ZodString>;
    wis2CollectionId: z.ZodOptional<z.ZodString>;
    marketType: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    measurements: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        value: z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>;
        unit: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
type WeatherStationProps = z.infer<typeof WeatherStationPropsSchema>;
declare const StormPropsSchema: z.ZodObject<{
    objectid: z.ZodOptional<z.ZodNumber>;
    stormname: z.ZodOptional<z.ZodString>;
    stormid: z.ZodOptional<z.ZodString>;
    stormnum: z.ZodOptional<z.ZodNumber>;
    stormtype: z.ZodOptional<z.ZodString>;
    dtg: z.ZodOptional<z.ZodNumber>;
    year: z.ZodOptional<z.ZodNumber>;
    month: z.ZodOptional<z.ZodString>;
    day: z.ZodOptional<z.ZodNumber>;
    hhmm: z.ZodOptional<z.ZodString>;
    tau: z.ZodOptional<z.ZodNumber>;
    mslp: z.ZodOptional<z.ZodNumber>;
    basin: z.ZodOptional<z.ZodString>;
    intensity: z.ZodOptional<z.ZodNumber>;
    ss: z.ZodOptional<z.ZodNumber>;
    lat: z.ZodOptional<z.ZodNumber>;
    lon: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodNumber>;
    windSpeed: z.ZodOptional<z.ZodNumber>;
    pressure: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type StormProps = z.infer<typeof StormPropsSchema>;
declare const WildfirePropsSchema: z.ZodObject<{
    brightness: z.ZodNumber;
    bright_ti4: z.ZodOptional<z.ZodNumber>;
    bright_ti5: z.ZodOptional<z.ZodNumber>;
    scan: z.ZodOptional<z.ZodNumber>;
    track: z.ZodOptional<z.ZodNumber>;
    acq_date: z.ZodString;
    acq_time: z.ZodString;
    satellite: z.ZodOptional<z.ZodString>;
    instrument: z.ZodOptional<z.ZodString>;
    confidence: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
    version: z.ZodOptional<z.ZodString>;
    frp: z.ZodOptional<z.ZodNumber>;
    daynight: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type WildfireProps = z.infer<typeof WildfirePropsSchema>;
declare const MeasurementValueSchema: z.ZodObject<{
    value: z.ZodNumber;
    unit: z.ZodString;
    quality: z.ZodOptional<z.ZodEnum<{
        good: "good";
        suspect: "suspect";
        estimated: "estimated";
        missing: "missing";
    }>>;
}, z.core.$strip>;
type MeasurementValue = z.infer<typeof MeasurementValueSchema>;
declare const StandardMeasurementsSchema: z.ZodRecord<z.ZodString, z.ZodObject<{
    value: z.ZodNumber;
    unit: z.ZodString;
    quality: z.ZodOptional<z.ZodEnum<{
        good: "good";
        suspect: "suspect";
        estimated: "estimated";
        missing: "missing";
    }>>;
}, z.core.$strip>>;
type StandardMeasurements = z.infer<typeof StandardMeasurementsSchema>;
declare const StandardObservationSchema: z.ZodObject<{
    timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    stationId: z.ZodString;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    measurements: z.ZodRecord<z.ZodString, z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodString;
        quality: z.ZodOptional<z.ZodEnum<{
            good: "good";
            suspect: "suspect";
            estimated: "estimated";
            missing: "missing";
        }>>;
    }, z.core.$strip>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    imageUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type StandardObservation = z.infer<typeof StandardObservationSchema>;
declare const ObservationQueryResultSchema: z.ZodObject<{
    stationId: z.ZodString;
    observations: z.ZodArray<z.ZodObject<{
        timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        stationId: z.ZodString;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
        measurements: z.ZodRecord<z.ZodString, z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            quality: z.ZodOptional<z.ZodEnum<{
                good: "good";
                suspect: "suspect";
                estimated: "estimated";
                missing: "missing";
            }>>;
        }, z.core.$strip>>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        imageUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    count: z.ZodNumber;
    timeRange: z.ZodObject<{
        start: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        end: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    }, z.core.$strip>;
    provider: z.ZodString;
    cached: z.ZodBoolean;
}, z.core.$strip>;
type ObservationQueryResult = z.infer<typeof ObservationQueryResultSchema>;
declare const FlightPropsSchema: z.ZodObject<{
    icao24: z.ZodOptional<z.ZodString>;
    callsign: z.ZodOptional<z.ZodString>;
    originCountry: z.ZodOptional<z.ZodString>;
    hex: z.ZodOptional<z.ZodString>;
    flight: z.ZodOptional<z.ZodString>;
    registration: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    velocity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    geoAltitude: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    onGround: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    verticalRate: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    baroAltitude: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>>;
    squawk: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    spi: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    positionSource: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    groundSpeed: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    track: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    trueTrack: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    emergency: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    category: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timePosition: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    lastContact: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    sensors: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodNumber>>>;
}, z.core.$strip>;
type FlightProps = z.infer<typeof FlightPropsSchema>;
declare const EventPayloadSchema: z.ZodObject<{
    provider: z.ZodString;
    type: z.ZodEnum<{
        Feature: "Feature";
        FeatureCollection: "FeatureCollection";
    }>;
    data: z.ZodUnknown;
    timestamp: z.ZodString;
    action: z.ZodOptional<z.ZodEnum<{
        updated: "updated";
        created: "created";
        deleted: "deleted";
    }>>;
}, z.core.$strip>;
type EventPayload = z.infer<typeof EventPayloadSchema>;
/**
 * Response schema for flight schedule endpoint.
 * Uses passthrough for flexible AeroDataBox response handling.
 */
declare const FlightScheduleResponseSchema: z.ZodObject<{
    provider: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    timestamp: z.ZodString;
    count: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodObject<{
        source: z.ZodString;
        cacheTTL: z.ZodNumber;
        cached: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>;
type FlightScheduleResponse = z.infer<typeof FlightScheduleResponseSchema>;
/**
 * Valid observation providers for data warehouse queries.
 */
declare const ObservationProviderSchema: z.ZodEnum<{
    wis2: "wis2";
    iem: "iem";
    buoy: "buoy";
    openmeteo: "openmeteo";
    nws: "nws";
}>;
type ObservationProvider = z.infer<typeof ObservationProviderSchema>;
/**
 * Response from GET /observations/station/:stationId
 */
declare const StationObservationsResultSchema: z.ZodObject<{
    stationId: z.ZodString;
    provider: z.ZodEnum<{
        wis2: "wis2";
        iem: "iem";
        buoy: "buoy";
        openmeteo: "openmeteo";
        nws: "nws";
    }>;
    observations: z.ZodArray<z.ZodObject<{
        timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        stationId: z.ZodString;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
        measurements: z.ZodRecord<z.ZodString, z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            quality: z.ZodOptional<z.ZodEnum<{
                good: "good";
                suspect: "suspect";
                estimated: "estimated";
                missing: "missing";
            }>>;
        }, z.core.$strip>>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        imageUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    count: z.ZodNumber;
    timeRange: z.ZodObject<{
        start: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        end: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    }, z.core.$strip>;
    source: z.ZodLiteral<"data-warehouse">;
}, z.core.$strip>;
type StationObservationsResult = z.infer<typeof StationObservationsResultSchema>;
/**
 * Response from GET /observations/station/:stationId/latest
 */
declare const LatestObservationResultSchema: z.ZodObject<{
    stationId: z.ZodString;
    provider: z.ZodEnum<{
        wis2: "wis2";
        iem: "iem";
        buoy: "buoy";
        openmeteo: "openmeteo";
        nws: "nws";
    }>;
    observation: z.ZodNullable<z.ZodObject<{
        timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        stationId: z.ZodString;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
        measurements: z.ZodRecord<z.ZodString, z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            quality: z.ZodOptional<z.ZodEnum<{
                good: "good";
                suspect: "suspect";
                estimated: "estimated";
                missing: "missing";
            }>>;
        }, z.core.$strip>>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        imageUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    source: z.ZodLiteral<"data-warehouse">;
}, z.core.$strip>;
type LatestObservationResult = z.infer<typeof LatestObservationResultSchema>;
/**
 * Response from GET /observations/bbox
 */
declare const BboxObservationsResultSchema: z.ZodObject<{
    bbox: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    provider: z.ZodEnum<{
        wis2: "wis2";
        iem: "iem";
        buoy: "buoy";
        openmeteo: "openmeteo";
        nws: "nws";
    }>;
    observations: z.ZodArray<z.ZodObject<{
        timestamp: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        stationId: z.ZodString;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
        measurements: z.ZodRecord<z.ZodString, z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodString;
            quality: z.ZodOptional<z.ZodEnum<{
                good: "good";
                suspect: "suspect";
                estimated: "estimated";
                missing: "missing";
            }>>;
        }, z.core.$strip>>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        imageUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    count: z.ZodNumber;
    timeRange: z.ZodObject<{
        start: z.ZodUnion<[z.ZodString, z.ZodDate]>;
        end: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    }, z.core.$strip>;
    source: z.ZodLiteral<"data-warehouse">;
}, z.core.$strip>;
type BboxObservationsResult = z.infer<typeof BboxObservationsResultSchema>;
/**
 * Response from GET /observations/stats
 */
declare const ObservationStatsResultSchema: z.ZodObject<{
    provider: z.ZodString;
    totalObservations: z.ZodNumber;
    source: z.ZodLiteral<"data-warehouse">;
}, z.core.$strip>;
type ObservationStatsResult = z.infer<typeof ObservationStatsResultSchema>;

declare abstract class BaseClient {
    protected readonly http: AxiosInstance;
    protected readonly config: GeoLayersConfig;
    constructor(config: GeoLayersConfig);
    private setupInterceptors;
    private isRetryableError;
    private delay;
    private executeWithRetry;
    protected get<T, P extends object = object>(url: string, params?: P): Promise<T>;
    protected post<T, B extends object = object>(url: string, body?: B): Promise<T>;
    /**
     * Helper to parse GeoJSON responses with Zod validation.
     * Eliminates repetitive schema creation across domains.
     */
    protected parseGeoJSON<T extends z.ZodTypeAny>(data: unknown, propsSchema: T): LayerResponse<FeatureCollection<z.infer<T>>>;
}

/**
 * Bounding box filters for global flight queries.
 */
interface FlightFilters {
    /** Minimum latitude (-90 to 90). Default: -90 */
    lamin?: number;
    /** Minimum longitude (-180 to 180). Default: -180 */
    lomin?: number;
    /** Maximum latitude (-90 to 90). Default: 90 */
    lamax?: number;
    /** Maximum longitude (-180 to 180). Default: 180 */
    lomax?: number;
}
/**
 * Filters for live flight queries (radius around a point).
 */
interface LiveFlightFilters {
    /** Center latitude (-90 to 90) */
    lat: number;
    /** Center longitude (-180 to 180) */
    lng: number;
    /** Radius in nautical miles (1-1000). Default: 250 */
    radius?: number;
}
declare class AviationDomain extends BaseClient {
    /**
     * Get all currently tracked flights globally (OpenSky).
     * @param filters Optional bounding box filters. Defaults to whole world.
     */
    getGlobalFlights(filters?: FlightFilters): Promise<LayerResponse<FeatureCollection<FlightProps>>>;
    /**
     * Get live flights (subset of global flights).
     * @param filters Center point and radius filters. Defaults to New York if not provided.
     */
    getLiveFlights(filters?: LiveFlightFilters): Promise<LayerResponse<FeatureCollection<FlightProps>>>;
    /**
     * Get flight schedule/details by callsign from AeroDataBox.
     * @param callsign Flight identifier (e.g., 'UAL1234', 'AA100')
     * @returns Raw flight schedule data from AeroDataBox API.
     *
     * @example
     * ```ts
     * const schedule = await sdk.aviation.getFlightSchedule('UAL1234');
     * console.log(schedule.data); // Flight details from AeroDataBox
     * ```
     */
    getFlightSchedule(callsign: string): Promise<FlightScheduleResponse>;
}

/**
 * Response from /events/types endpoint.
 */
declare const EventTypesResponseSchema: z.ZodObject<{
    types: z.ZodArray<z.ZodEnum<{
        "earthquake.new": "earthquake.new";
        "earthquake.updated": "earthquake.updated";
        "storm.new": "storm.new";
        "storm.updated": "storm.updated";
        "wildfire.new": "wildfire.new";
        "wildfire.updated": "wildfire.updated";
        "volcano.alert": "volcano.alert";
        "snapshot.completed": "snapshot.completed";
        "snapshot.failed": "snapshot.failed";
        "observation.batch": "observation.batch";
    }>>;
    descriptions: z.ZodRecord<z.ZodString, z.ZodString>;
}, z.core.$strip>;
type EventTypesResponse = z.infer<typeof EventTypesResponseSchema>;
declare class EventsDomain extends BaseClient {
    /**
     * Get list of available event types for the event stream.
     * @returns Object with event types array and their descriptions.
     *
     * @example
     * ```ts
     * const { types, descriptions } = await sdk.eventsMeta.getEventTypes();
     * console.log(types); // ['earthquake.new', 'storm.new', ...]
     * console.log(descriptions['earthquake.new']); // 'New earthquake detected'
     * ```
     */
    getEventTypes(): Promise<EventTypesResponse>;
}

/**
 * Filters for wildfire queries.
 */
interface WildfireFilters {
    /** Number of days of wildfire data to retrieve (1-30). Default: 1 */
    days?: number;
}
declare class FireDomain extends BaseClient {
    /**
     * Get list of active wildfires/heat anomalies.
     * @param filters Optional filters. Default: last 1 day.
     */
    getWildfires(filters?: WildfireFilters): Promise<LayerResponse<FeatureCollection<WildfireProps>>>;
}

/**
 * Base filters for observation queries.
 */
interface ObservationFilters {
    /** Start date in ISO 8601 format */
    start: string;
    /** End date in ISO 8601 format */
    end: string;
    /** Force refresh from source (bypass cache). Default: false */
    forceRefresh?: boolean;
}
/**
 * Filters for WIS2 station queries.
 */
interface Wis2StationFilters {
    /** Maximum number of stations to return. Default: 100 */
    limit?: number;
    /** Number of stations to skip. Default: 0 */
    offset?: number;
}
/**
 * Extended filters for WIS2 observation queries.
 */
interface Wis2ObservationFilters extends ObservationFilters {
    /** WIS2 node base URL */
    baseUrl?: string;
    /** WIS2 collection ID */
    collectionId?: string;
}
declare class WeatherDomain extends BaseClient {
    /**
     * Get weather stations from WIS2 network.
     * @param filters Optional pagination filters.
     */
    getWis2Stations(filters?: Wis2StationFilters): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>>;
    /**
     * Get historical observations for a WIS2 station.
     * @param stationId The station identifier.
     * @param filters Date range and optional WIS2-specific filters.
     */
    getWis2Observations(stationId: string, filters: Wis2ObservationFilters): Promise<ObservationQueryResult>;
    /**
     * Get weather stations from IEM/AZOS network.
     */
    getIemStations(): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>>;
    /**
     * Get historical observations for an IEM station.
     * @param stationId The station identifier.
     * @param filters Date range filters.
     */
    getIemObservations(stationId: string, filters: ObservationFilters): Promise<ObservationQueryResult>;
    /**
     * Get weather stations from NWS (National Weather Service) network.
     */
    getNWSWeatherStations(): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>>;
    /**
     * Get active stations that have reported data in the last 24 hours.
     * @param type The station network type ('iem' or 'wis2').
     *
     * Note: This endpoint returns FeatureCollection directly (not LayerResponse envelope).
     */
    getActiveStations(type: 'iem' | 'wis2'): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>>;
}

declare class MaritimeDomain extends BaseClient {
    /**
     * Get NOAA buoy stations (locations).
     */
    getBuoyStations(): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>>;
    /**
     * Get latest buoy observations (real-time-ish).
     */
    getLatestBuoyObservations(): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>>;
    /**
     * Get historical observations for a specific buoy.
     * @param buoyId The buoy identifier.
     * @param filters Date range filters.
     */
    getBuoyObservations(buoyId: string, filters: ObservationFilters): Promise<ObservationQueryResult>;
}

/**
 * Filters for data warehouse station observations.
 */
interface StationObservationFilters {
    /** Observation provider */
    provider: ObservationProvider;
    /** Start date in ISO 8601 format */
    start?: string;
    /** End date in ISO 8601 format */
    end?: string;
    /** Quick time range selection (overridden by start/end) */
    timePreset?: '1h' | '24h' | '7d' | '30d';
    /** Maximum number of observations to return */
    limit?: number;
}
/**
 * Filters for bounding box observation queries.
 */
interface BboxFilters extends StationObservationFilters {
    /** Minimum longitude (-180 to 180) */
    minLon: number;
    /** Minimum latitude (-90 to 90) */
    minLat: number;
    /** Maximum longitude (-180 to 180) */
    maxLon: number;
    /** Maximum latitude (-90 to 90) */
    maxLat: number;
}
/**
 * ObservationsDomain provides access to observation endpoints.
 *
 * This includes:
 * - Active stations from WIS2 and IEM networks
 * - Data warehouse queries (station, bbox, stats)
 */
declare class ObservationsDomain extends BaseClient {
    /**
     * Get active WIS2 stations that reported data in the last 24 hours.
     */
    getActiveWis2Stations(): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>>;
    /**
     * Get active IEM/AZOS stations that reported data in the last 24 hours.
     */
    getActiveIemStations(): Promise<LayerResponse<FeatureCollection<WeatherStationProps>>>;
    /**
     * Get observations for a station from the data warehouse.
     * @param stationId The station identifier.
     * @param filters Query filters including provider and date range.
     */
    getStationObservations(stationId: string, filters: StationObservationFilters): Promise<StationObservationsResult>;
    /**
     * Get the latest observation for a station from the data warehouse.
     * @param stationId The station identifier.
     * @param provider The observation provider.
     */
    getLatestObservation(stationId: string, provider: ObservationProvider): Promise<LatestObservationResult>;
    /**
     * Get observations within a geographic bounding box.
     * @param filters Bounding box coordinates and query filters.
     */
    getObservationsByBbox(filters: BboxFilters): Promise<BboxObservationsResult>;
    /**
     * Get data warehouse statistics.
     * @param provider Optional provider filter. If not specified, returns stats for all providers.
     */
    getStats(provider?: ObservationProvider): Promise<ObservationStatsResult>;
    /**
     * Convert time preset to absolute date range parameters.
     */
    private buildDateParams;
    /**
     * Parse active stations response.
     * The endpoint may return either a FeatureCollection directly or wrapped in LayerResponse.
     */
    private parseActiveStationsResponse;
}

/**
 * Time range presets for earthquake queries.
 * - `1h`: Last 1 hour
 * - `24h`: Last 24 hours (default)
 * - `7d`: Last 7 days
 * - `30d`: Last 30 days
 */
type TimePreset = '1h' | '24h' | '7d' | '30d';
/**
 * Filters for earthquake queries.
 *
 * @example Using a preset (recommended)
 * ```ts
 * sdk.seismic.getEarthquakes({ timePreset: '7d' });
 * ```
 *
 * @example Using custom date range
 * ```ts
 * sdk.seismic.getEarthquakes({
 *   startTime: '2024-01-01T00:00:00Z',
 *   endTime: '2024-01-31T23:59:59Z',
 * });
 * ```
 */
interface EarthquakeFilters {
    /**
     * Time preset for quick queries. Default: '24h'.
     * If startTime/endTime are provided, this is ignored.
     */
    timePreset?: TimePreset;
    /**
     * Start time in ISO 8601 format (e.g., '2024-01-01T00:00:00Z').
     * When provided with endTime, overrides timePreset.
     */
    startTime?: string;
    /**
     * End time in ISO 8601 format (e.g., '2024-01-31T23:59:59Z').
     * When provided with startTime, overrides timePreset.
     */
    endTime?: string;
    /**
     * Minimum earthquake magnitude to filter by.
     */
    minMagnitude?: number;
}
declare class SeismicDomain extends BaseClient {
    /**
     * Get earthquakes from a specific time range and minimum magnitude.
     *
     * @param filters - Optional filters. Default: last 24 hours.
     * @returns Promise with earthquake data as GeoJSON FeatureCollection.
     *
     * @example Using default (last 24 hours)
     * ```ts
     * const earthquakes = await sdk.seismic.getEarthquakes();
     * ```
     *
     * @example Using a preset
     * ```ts
     * const earthquakes = await sdk.seismic.getEarthquakes({ timePreset: '7d', minMagnitude: 4.0 });
     * ```
     *
     * @example Using custom date range
     * ```ts
     * const earthquakes = await sdk.seismic.getEarthquakes({
     *   startTime: '2024-01-01T00:00:00Z',
     *   endTime: '2024-01-31T23:59:59Z',
     *   minMagnitude: 5.0,
     * });
     * ```
     */
    getEarthquakes(filters?: EarthquakeFilters): Promise<LayerResponse<FeatureCollection<EarthquakeProps>>>;
}

declare class TropicalDomain extends BaseClient {
    /**
     * Get list of currently active tropical storms/hurricanes.
     */
    getActiveStorms(): Promise<LayerResponse<FeatureCollection<StormProps>>>;
    /**
     * Get list of recent tropical storms/hurricanes.
     */
    getRecentStorms(): Promise<LayerResponse<FeatureCollection<StormProps>>>;
}

declare class VolcanicDomain extends BaseClient {
    /**
     * Get list of Holocene volcanoes (Smithsonian Institution).
     * Note: API returns array of Features, normalized to FeatureCollection here.
     */
    getVolcanoes(): Promise<LayerResponse<FeatureCollection<VolcanoProps>>>;
    /**
     * Get list of currently active volcanoes (GDACS).
     */
    getActiveVolcanoes(): Promise<LayerResponse<FeatureCollection<ActiveVolcanoProps>>>;
}

type EventStreamListener = (payload: EventPayload) => void;
type ErrorListener = (error: unknown) => void;
declare class EventStream extends EventEmitter {
    private eventSource;
    private readonly url;
    constructor(config: GeoLayersConfig);
    /**
     * Start listening to the event stream.
     */
    connect(): void;
    /**
     * Stop listening to the event stream.
     */
    disconnect(): void;
    /**
     * Subscribe to events.
     * @param event Event name ('data', 'error', or provider name like 'earthquakes')
     * @param listener Callback function
     */
    on(event: 'data', listener: EventStreamListener): this;
    on(event: 'error', listener: ErrorListener): this;
    on(event: string, listener: EventStreamListener): this;
    /**
     * Unsubscribe from events.
     */
    off(event: 'data', listener: EventStreamListener): this;
    off(event: 'error', listener: ErrorListener): this;
    off(event: string, listener: EventStreamListener): this;
}

declare class GeoLayersError extends Error {
    constructor(message: string);
}
declare class GeoLayersApiError extends GeoLayersError {
    statusCode: number;
    response?: unknown | undefined;
    constructor(message: string, statusCode: number, response?: unknown | undefined);
}
declare class GeoLayersValidationError extends GeoLayersError {
    errors: unknown;
    constructor(message: string, errors: unknown);
}

declare class GeoLayersSDK {
    readonly seismic: SeismicDomain;
    readonly volcanic: VolcanicDomain;
    readonly tropical: TropicalDomain;
    readonly fire: FireDomain;
    readonly weather: WeatherDomain;
    readonly maritime: MaritimeDomain;
    readonly aviation: AviationDomain;
    /** Observation data warehouse and active stations */
    readonly observations: ObservationsDomain;
    /** Real-time event stream (SSE) */
    readonly events: EventStream;
    /** Event metadata operations (REST) */
    readonly eventsMeta: EventsDomain;
    constructor(config: GeoLayersConfig);
}

export { type ActiveVolcanoProps, ActiveVolcanoPropsSchema, type BboxObservationsResult, BboxObservationsResultSchema, DEFAULT_CONFIG, type EarthquakeProps, EarthquakePropsSchema, type EventPayload, EventPayloadSchema, type Feature, type FeatureCollection, type FlightProps, FlightPropsSchema, type FlightScheduleResponse, FlightScheduleResponseSchema, GeoLayersApiError, type GeoLayersConfig, GeoLayersError, GeoLayersSDK, GeoLayersValidationError, type Geometry, GeometrySchema, type LatestObservationResult, LatestObservationResultSchema, type LayerMetadata, LayerMetadataSchema, LayerProvider, type LayerResponse, type MeasurementValue, MeasurementValueSchema, type ObservationProvider, ObservationProviderSchema, type ObservationQueryResult, ObservationQueryResultSchema, type ObservationStatsResult, ObservationStatsResultSchema, type StandardMeasurements, StandardMeasurementsSchema, type StandardObservation, StandardObservationSchema, type StationObservationsResult, StationObservationsResultSchema, type StormProps, StormPropsSchema, type VolcanoProps, VolcanoPropsSchema, type WeatherStationProps, WeatherStationPropsSchema, type WildfireProps, WildfirePropsSchema, createFeatureCollectionSchema, createFeatureSchema, createLayerResponseSchema, GeoLayersSDK as default };
