import { z } from 'zod';

const PositionSchema = z.tuple([z.number(), z.number()]).rest(z.number());

export const GeometrySchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('Point'), coordinates: PositionSchema }),
    z.object({ type: z.literal('LineString'), coordinates: z.array(PositionSchema) }),
    z.object({ type: z.literal('Polygon'), coordinates: z.array(z.array(PositionSchema)) }),
    z.object({ type: z.literal('MultiPoint'), coordinates: z.array(PositionSchema) }),
    z.object({ type: z.literal('MultiLineString'), coordinates: z.array(z.array(PositionSchema)) }),
    z.object({ type: z.literal('MultiPolygon'), coordinates: z.array(z.array(z.array(PositionSchema))) }),
]);

export type Geometry = z.infer<typeof GeometrySchema>;

/**
 * A GeoJSON Feature with type-safe properties.
 * @template P Shape of the properties object.
 */
export interface Feature<P = Record<string, unknown>> {
    type: 'Feature';
    geometry: Geometry;
    properties: P;
    id?: string | number;
}

/**
 * A GeoJSON FeatureCollection with type-safe features.
 * @template P Shape of the properties object for each feature.
 */
export interface FeatureCollection<P = Record<string, unknown>> {
    type: 'FeatureCollection';
    features: Feature<P>[];
    bbox?: number[];
}

/**
 * Creates a Zod schema for a Feature with specific property validation.
 */
export const createFeatureSchema = <P extends z.ZodTypeAny>(propsSchema: P) =>
    z.object({
        type: z.literal('Feature'),
        geometry: GeometrySchema,
        properties: propsSchema,
        id: z.union([z.string(), z.number()]).optional(),
    });

/**
 * Creates a Zod schema for a FeatureCollection with specific property validation.
 */
export const createFeatureCollectionSchema = <P extends z.ZodTypeAny>(propsSchema: P) =>
    z.object({
        type: z.literal('FeatureCollection'),
        features: z.array(createFeatureSchema(propsSchema)),
        bbox: z.array(z.number()).optional(),
    });

export const EarthquakePropsSchema = z.object({
    mag: z.number(),
    place: z.string(),
    time: z.number(),
    updated: z.number(),
    tz: z.number().nullable().optional(),
    url: z.string(),
    detail: z.string(),
    felt: z.number().nullable().optional(),
    cdi: z.number().nullable().optional(),
    mmi: z.number().nullable().optional(),
    alert: z.string().nullable().optional(),
    status: z.string(),
    tsunami: z.number(),
    sig: z.number(),
    net: z.string(),
    code: z.string(),
    ids: z.string(),
    sources: z.string(),
    types: z.string(),
    nst: z.number().nullable().optional(),
    dmin: z.number().nullable().optional(),
    rms: z.number().nullable().optional(),
    gap: z.number().nullable().optional(),
    magType: z.string(),
    type: z.string(),
    title: z.string(),
});

export type EarthquakeProps = z.infer<typeof EarthquakePropsSchema>;

export const VolcanoPropsSchema = z.object({
    volcanoNumber: z.number().nullable().optional(),
    volcanoName: z.string(),
    volcanicLandform: z.string().nullable().optional(),
    primaryVolcanoType: z.string().nullable().optional(),
    lastEruptionYear: z.union([z.string(), z.number()]).nullable().optional(),
    country: z.string(),
    region: z.string().nullable().optional(),
    subregion: z.string().nullable().optional(),
    geologicalSummary: z.string().nullable().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    elevation: z.number().nullable().optional(),
    tectonicSetting: z.string().nullable().optional(),
    geologicEpoch: z.string().nullable().optional(),
    evidenceCategory: z.string().nullable().optional(),
    primaryPhotoLink: z.string().nullable().optional(),
    primaryPhotoCaption: z.string().nullable().optional(),
    primaryPhotoCredit: z.string().nullable().optional(),
    majorRockType: z.string().nullable().optional(),
});

export type VolcanoProps = z.infer<typeof VolcanoPropsSchema>;

export const ActiveVolcanoPropsSchema = z.object({
    name: z.string(),
    eventtype: z.string().optional(),
    eventid: z.number().optional(),
    episodeid: z.number().optional(),
    eventname: z.string().optional(),
    glide: z.string().optional(),
    description: z.string().optional(),
    htmldescription: z.string().optional(),
    icon: z.string().optional(),
    iconoverall: z.string().optional(),
    url: z.object({
        geometry: z.string().optional(),
        report: z.string().optional(),
        details: z.string().optional(),
    }).optional(),
    alertlevel: z.string().optional(),
    alertscore: z.number().optional(),
    episodealertlevel: z.string().optional(),
    episodealertscore: z.number().optional(),
    istemporary: z.string().optional(),
    iscurrent: z.string().optional(),
    country: z.string().optional(),
    fromdate: z.string().optional(),
    todate: z.string().optional(),
    datemodified: z.string().optional(),
    iso3: z.string().optional(),
    source: z.string().optional(),
    sourceid: z.string().optional(),
    polygonlabel: z.string().optional(),
    class: z.string().optional(),
    affectedcountries: z.array(z.object({
        iso2: z.string().optional(),
        iso3: z.string().optional(),
        countryname: z.string().optional(),
    })).optional(),
    severitydata: z.object({
        severity: z.number().optional(),
        severitytext: z.string().optional(),
        severityunit: z.string().optional(),
    }).optional(),
    marketType: z.literal('volcano').optional(),
    volcname: z.string().optional(),
});

export type ActiveVolcanoProps = z.infer<typeof ActiveVolcanoPropsSchema>;

export const WeatherStationPropsSchema = z.object({
    id: z.string().optional(),
    wigos_station_identifier: z.string().optional(),
    station_identifier: z.string().optional(), // Fallback
    name: z.string().optional(),
    station_name: z.string().optional(), // Fallback
    provider: z.string().optional(),
    country: z.string().optional(),
    baseUrl: z.string().optional(),
    wis2CollectionId: z.string().optional(),
    marketType: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    measurements: z.record(
        z.string(),
        z.object({
            value: z.union([z.number(), z.string()]),
            unit: z.string().optional(),
        })
    ).optional(),
});

export type WeatherStationProps = z.infer<typeof WeatherStationPropsSchema>;

export const StormPropsSchema = z.object({
    objectid: z.number().optional(),
    stormname: z.string().optional(),
    stormid: z.string().optional(),
    stormnum: z.number().optional(),
    stormtype: z.string().optional(),
    dtg: z.number().optional(),
    year: z.number().optional(),
    month: z.string().optional(),
    day: z.number().optional(),
    hhmm: z.string().optional(),
    tau: z.number().optional(),
    mslp: z.number().optional(),
    basin: z.string().optional(),
    intensity: z.number().optional(),
    ss: z.number().optional(),
    lat: z.number().optional(),
    lon: z.number().optional(),

    // Alias/Common names used in clients/tests
    category: z.number().optional(),
    windSpeed: z.number().optional(),
    pressure: z.number().optional(),
    status: z.string().optional(),
});

export type StormProps = z.infer<typeof StormPropsSchema>;

export const WildfirePropsSchema = z.object({
    brightness: z.number(),
    bright_ti4: z.number().optional(),
    bright_ti5: z.number().optional(),
    scan: z.number().optional(),
    track: z.number().optional(),
    acq_date: z.string(),
    acq_time: z.string(),
    satellite: z.string().optional(),
    instrument: z.string().optional(),
    confidence: z.union([z.number(), z.string()]).optional(),
    version: z.string().optional(),
    frp: z.number().optional(),
    daynight: z.string().optional(),
});

export type WildfireProps = z.infer<typeof WildfirePropsSchema>;

// --- Observation & Timeseries Types ---

export const MeasurementValueSchema = z.object({
    value: z.number(),
    unit: z.string(),
    quality: z.enum(['good', 'suspect', 'estimated', 'missing']).optional(),
});

export type MeasurementValue = z.infer<typeof MeasurementValueSchema>;

export const StandardMeasurementsSchema = z.record(z.string(), MeasurementValueSchema);

export type StandardMeasurements = z.infer<typeof StandardMeasurementsSchema>;

export const StandardObservationSchema = z.object({
    timestamp: z.string().or(z.date()),
    stationId: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    measurements: StandardMeasurementsSchema,
    metadata: z.record(z.string(), z.unknown()).optional(),
    imageUrl: z.string().optional(),
});

export type StandardObservation = z.infer<typeof StandardObservationSchema>;

export const ObservationQueryResultSchema = z.object({
    stationId: z.string(),
    observations: z.array(StandardObservationSchema),
    count: z.number(),
    timeRange: z.object({
        start: z.string().or(z.date()),
        end: z.string().or(z.date()),
    }),
    provider: z.string(),
    cached: z.boolean(),
});

export type ObservationQueryResult = z.infer<typeof ObservationQueryResultSchema>;

// --- Aviation Types ---

export const FlightPropsSchema = z.object({
    // OpenSky Fields
    icao24: z.string().optional(),
    callsign: z.string().optional(),
    originCountry: z.string().optional(),
    // Airplanes Live Fields
    hex: z.string().optional(),
    flight: z.string().optional(),
    registration: z.string().optional(),
    type: z.string().optional(),

    // Common / Shared
    velocity: z.number().nullable().optional(),
    geoAltitude: z.number().nullable().optional(),
    onGround: z.boolean().nullable().optional(),
    verticalRate: z.number().nullable().optional(),
    baroAltitude: z.union([z.number(), z.string()]).nullable().optional(),
    squawk: z.string().nullable().optional(),
    spi: z.boolean().nullable().optional(),
    positionSource: z.number().nullable().optional(),
    groundSpeed: z.number().nullable().optional(),
    track: z.number().nullable().optional(), // LiveFlights synonym
    trueTrack: z.number().nullable().optional(), // GlobalFlights synonym
    emergency: z.string().nullable().optional(),
    category: z.string().nullable().optional(),

    // Timestamps
    timePosition: z.number().nullable().optional(),
    lastContact: z.number().nullable().optional(),

    // Sensors
    sensors: z.array(z.number()).nullable().optional(),
});

export type FlightProps = z.infer<typeof FlightPropsSchema>;

// --- Event Stream Types ---

export const EventPayloadSchema = z.object({
    provider: z.string(),
    type: z.enum(['Feature', 'FeatureCollection']),
    data: z.unknown(), // Pode ser qualquer um dos GeoJSONs acima
    timestamp: z.string(),
    action: z.enum(['created', 'updated', 'deleted']).optional(),
});

export type EventPayload = z.infer<typeof EventPayloadSchema>;

// --- Flight Schedule Types (AeroDataBox) ---

/**
 * Response schema for flight schedule endpoint.
 * Uses passthrough for flexible AeroDataBox response handling.
 */
export const FlightScheduleResponseSchema = z.object({
    provider: z.string(),
    data: z.record(z.string(), z.unknown()), // AeroDataBox returns varied structure
    timestamp: z.string(),
    count: z.number().optional(),
    metadata: z.object({
        source: z.string(),
        cacheTTL: z.number(),
        cached: z.boolean(),
    }).optional(),
});

export type FlightScheduleResponse = z.infer<typeof FlightScheduleResponseSchema>;

// --- Data Warehouse Observation Types ---

/**
 * Valid observation providers for data warehouse queries.
 */
export const ObservationProviderSchema = z.enum(['wis2', 'iem', 'buoy', 'openmeteo', 'nws']);
export type ObservationProvider = z.infer<typeof ObservationProviderSchema>;

/**
 * Response from GET /observations/station/:stationId
 */
export const StationObservationsResultSchema = z.object({
    stationId: z.string(),
    provider: ObservationProviderSchema,
    observations: z.array(StandardObservationSchema),
    count: z.number(),
    timeRange: z.object({
        start: z.string().or(z.date()),
        end: z.string().or(z.date()),
    }),
    source: z.literal('data-warehouse'),
});

export type StationObservationsResult = z.infer<typeof StationObservationsResultSchema>;

/**
 * Response from GET /observations/station/:stationId/latest
 */
export const LatestObservationResultSchema = z.object({
    stationId: z.string(),
    provider: ObservationProviderSchema,
    observation: StandardObservationSchema.nullable(),
    source: z.literal('data-warehouse'),
});

export type LatestObservationResult = z.infer<typeof LatestObservationResultSchema>;

/**
 * Response from GET /observations/bbox
 */
export const BboxObservationsResultSchema = z.object({
    bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    provider: ObservationProviderSchema,
    observations: z.array(StandardObservationSchema),
    count: z.number(),
    timeRange: z.object({
        start: z.string().or(z.date()),
        end: z.string().or(z.date()),
    }),
    source: z.literal('data-warehouse'),
});

export type BboxObservationsResult = z.infer<typeof BboxObservationsResultSchema>;

/**
 * Response from GET /observations/stats
 */
export const ObservationStatsResultSchema = z.object({
    provider: z.string(),
    totalObservations: z.number(),
    source: z.literal('data-warehouse'),
});

export type ObservationStatsResult = z.infer<typeof ObservationStatsResultSchema>;
