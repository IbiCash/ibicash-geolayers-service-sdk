"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ActiveVolcanoPropsSchema: () => ActiveVolcanoPropsSchema,
  DEFAULT_CONFIG: () => DEFAULT_CONFIG,
  EarthquakePropsSchema: () => EarthquakePropsSchema,
  EventPayloadSchema: () => EventPayloadSchema,
  FlightPropsSchema: () => FlightPropsSchema,
  FlightScheduleResponseSchema: () => FlightScheduleResponseSchema,
  GeoLayersApiError: () => GeoLayersApiError,
  GeoLayersError: () => GeoLayersError,
  GeoLayersSDK: () => GeoLayersSDK,
  GeoLayersValidationError: () => GeoLayersValidationError,
  GeometrySchema: () => GeometrySchema,
  LayerMetadataSchema: () => LayerMetadataSchema,
  LayerProvider: () => LayerProvider,
  MeasurementValueSchema: () => MeasurementValueSchema,
  ObservationQueryResultSchema: () => ObservationQueryResultSchema,
  StandardMeasurementsSchema: () => StandardMeasurementsSchema,
  StandardObservationSchema: () => StandardObservationSchema,
  StormPropsSchema: () => StormPropsSchema,
  VolcanoPropsSchema: () => VolcanoPropsSchema,
  WeatherStationPropsSchema: () => WeatherStationPropsSchema,
  WildfirePropsSchema: () => WildfirePropsSchema,
  createFeatureCollectionSchema: () => createFeatureCollectionSchema,
  createFeatureSchema: () => createFeatureSchema,
  createLayerResponseSchema: () => createLayerResponseSchema,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// src/core/client.ts
var import_axios = __toESM(require("axios"), 1);

// src/types/api.ts
var import_zod = require("zod");
var LayerProvider = /* @__PURE__ */ ((LayerProvider2) => {
  LayerProvider2["VOLCANOES"] = "volcanoes";
  LayerProvider2["ACTIVE_VOLCANOES"] = "active-volcanoes";
  LayerProvider2["WILDFIRES"] = "wildfires";
  LayerProvider2["ACTIVE_STORMS"] = "active-storms";
  LayerProvider2["RECENT_STORMS"] = "recent-storms";
  LayerProvider2["EARTHQUAKES"] = "earthquakes";
  LayerProvider2["BUOYS_RECENT"] = "buoys-recent";
  LayerProvider2["BUOYS_LATEST"] = "buoys-latest";
  LayerProvider2["NWS_STATIONS"] = "nws-weather-stations";
  LayerProvider2["AZOS_NETWORK"] = "azos-weather-network";
  LayerProvider2["WIS2_STATIONS"] = "wis2-stations";
  LayerProvider2["GLOBAL_FLIGHTS"] = "global-flights";
  LayerProvider2["LIVE_FLIGHTS"] = "live-flights";
  LayerProvider2["FLIGHT_SCHEDULE"] = "flight-schedule";
  return LayerProvider2;
})(LayerProvider || {});
var LayerMetadataSchema = import_zod.z.object({
  source: import_zod.z.string(),
  cacheTTL: import_zod.z.number(),
  cached: import_zod.z.boolean(),
  snapshotId: import_zod.z.string().optional()
});
var createLayerResponseSchema = (dataSchema) => import_zod.z.object({
  provider: import_zod.z.string(),
  data: dataSchema,
  timestamp: import_zod.z.string(),
  count: import_zod.z.number().optional(),
  metadata: LayerMetadataSchema.optional()
});

// src/types/geojson.ts
var import_zod2 = require("zod");
var PositionSchema = import_zod2.z.tuple([import_zod2.z.number(), import_zod2.z.number()]).rest(import_zod2.z.number());
var GeometrySchema = import_zod2.z.discriminatedUnion("type", [
  import_zod2.z.object({ type: import_zod2.z.literal("Point"), coordinates: PositionSchema }),
  import_zod2.z.object({ type: import_zod2.z.literal("LineString"), coordinates: import_zod2.z.array(PositionSchema) }),
  import_zod2.z.object({ type: import_zod2.z.literal("Polygon"), coordinates: import_zod2.z.array(import_zod2.z.array(PositionSchema)) }),
  import_zod2.z.object({ type: import_zod2.z.literal("MultiPoint"), coordinates: import_zod2.z.array(PositionSchema) }),
  import_zod2.z.object({ type: import_zod2.z.literal("MultiLineString"), coordinates: import_zod2.z.array(import_zod2.z.array(PositionSchema)) }),
  import_zod2.z.object({ type: import_zod2.z.literal("MultiPolygon"), coordinates: import_zod2.z.array(import_zod2.z.array(import_zod2.z.array(PositionSchema))) })
]);
var createFeatureSchema = (propsSchema) => import_zod2.z.object({
  type: import_zod2.z.literal("Feature"),
  geometry: GeometrySchema,
  properties: propsSchema,
  id: import_zod2.z.union([import_zod2.z.string(), import_zod2.z.number()]).optional()
});
var createFeatureCollectionSchema = (propsSchema) => import_zod2.z.object({
  type: import_zod2.z.literal("FeatureCollection"),
  features: import_zod2.z.array(createFeatureSchema(propsSchema)),
  bbox: import_zod2.z.array(import_zod2.z.number()).optional()
});
var EarthquakePropsSchema = import_zod2.z.object({
  mag: import_zod2.z.number(),
  place: import_zod2.z.string(),
  time: import_zod2.z.number(),
  updated: import_zod2.z.number(),
  tz: import_zod2.z.number().nullable().optional(),
  url: import_zod2.z.string(),
  detail: import_zod2.z.string(),
  felt: import_zod2.z.number().nullable().optional(),
  cdi: import_zod2.z.number().nullable().optional(),
  mmi: import_zod2.z.number().nullable().optional(),
  alert: import_zod2.z.string().nullable().optional(),
  status: import_zod2.z.string(),
  tsunami: import_zod2.z.number(),
  sig: import_zod2.z.number(),
  net: import_zod2.z.string(),
  code: import_zod2.z.string(),
  ids: import_zod2.z.string(),
  sources: import_zod2.z.string(),
  types: import_zod2.z.string(),
  nst: import_zod2.z.number().nullable().optional(),
  dmin: import_zod2.z.number().nullable().optional(),
  rms: import_zod2.z.number().nullable().optional(),
  gap: import_zod2.z.number().nullable().optional(),
  magType: import_zod2.z.string(),
  type: import_zod2.z.string(),
  title: import_zod2.z.string()
});
var VolcanoPropsSchema = import_zod2.z.object({
  volcanoNumber: import_zod2.z.number().nullable().optional(),
  volcanoName: import_zod2.z.string(),
  volcanicLandform: import_zod2.z.string().nullable().optional(),
  primaryVolcanoType: import_zod2.z.string().nullable().optional(),
  lastEruptionYear: import_zod2.z.union([import_zod2.z.string(), import_zod2.z.number()]).nullable().optional(),
  country: import_zod2.z.string(),
  region: import_zod2.z.string().nullable().optional(),
  subregion: import_zod2.z.string().nullable().optional(),
  geologicalSummary: import_zod2.z.string().nullable().optional(),
  latitude: import_zod2.z.number().nullable().optional(),
  longitude: import_zod2.z.number().nullable().optional(),
  elevation: import_zod2.z.number().nullable().optional(),
  tectonicSetting: import_zod2.z.string().nullable().optional(),
  geologicEpoch: import_zod2.z.string().nullable().optional(),
  evidenceCategory: import_zod2.z.string().nullable().optional(),
  primaryPhotoLink: import_zod2.z.string().nullable().optional(),
  primaryPhotoCaption: import_zod2.z.string().nullable().optional(),
  primaryPhotoCredit: import_zod2.z.string().nullable().optional(),
  majorRockType: import_zod2.z.string().nullable().optional()
});
var ActiveVolcanoPropsSchema = import_zod2.z.object({
  name: import_zod2.z.string(),
  eventtype: import_zod2.z.string().optional(),
  eventid: import_zod2.z.number().optional(),
  episodeid: import_zod2.z.number().optional(),
  eventname: import_zod2.z.string().optional(),
  glide: import_zod2.z.string().optional(),
  description: import_zod2.z.string().optional(),
  htmldescription: import_zod2.z.string().optional(),
  icon: import_zod2.z.string().optional(),
  iconoverall: import_zod2.z.string().optional(),
  url: import_zod2.z.object({
    geometry: import_zod2.z.string().optional(),
    report: import_zod2.z.string().optional(),
    details: import_zod2.z.string().optional()
  }).optional(),
  alertlevel: import_zod2.z.string().optional(),
  alertscore: import_zod2.z.number().optional(),
  episodealertlevel: import_zod2.z.string().optional(),
  episodealertscore: import_zod2.z.number().optional(),
  istemporary: import_zod2.z.string().optional(),
  iscurrent: import_zod2.z.string().optional(),
  country: import_zod2.z.string().optional(),
  fromdate: import_zod2.z.string().optional(),
  todate: import_zod2.z.string().optional(),
  datemodified: import_zod2.z.string().optional(),
  iso3: import_zod2.z.string().optional(),
  source: import_zod2.z.string().optional(),
  sourceid: import_zod2.z.string().optional(),
  polygonlabel: import_zod2.z.string().optional(),
  class: import_zod2.z.string().optional(),
  affectedcountries: import_zod2.z.array(import_zod2.z.object({
    iso2: import_zod2.z.string().optional(),
    iso3: import_zod2.z.string().optional(),
    countryname: import_zod2.z.string().optional()
  })).optional(),
  severitydata: import_zod2.z.object({
    severity: import_zod2.z.number().optional(),
    severitytext: import_zod2.z.string().optional(),
    severityunit: import_zod2.z.string().optional()
  }).optional(),
  marketType: import_zod2.z.literal("volcano").optional(),
  volcname: import_zod2.z.string().optional()
});
var WeatherStationPropsSchema = import_zod2.z.object({
  id: import_zod2.z.string().optional(),
  wigos_station_identifier: import_zod2.z.string().optional(),
  station_identifier: import_zod2.z.string().optional(),
  // Fallback
  name: import_zod2.z.string().optional(),
  station_name: import_zod2.z.string().optional(),
  // Fallback
  provider: import_zod2.z.string().optional(),
  country: import_zod2.z.string().optional(),
  baseUrl: import_zod2.z.string().optional(),
  wis2CollectionId: import_zod2.z.string().optional(),
  marketType: import_zod2.z.string().optional(),
  metadata: import_zod2.z.record(import_zod2.z.string(), import_zod2.z.unknown()).optional(),
  measurements: import_zod2.z.record(
    import_zod2.z.string(),
    import_zod2.z.object({
      value: import_zod2.z.union([import_zod2.z.number(), import_zod2.z.string()]),
      unit: import_zod2.z.string().optional()
    })
  ).optional()
});
var StormPropsSchema = import_zod2.z.object({
  objectid: import_zod2.z.number().optional(),
  stormname: import_zod2.z.string().optional(),
  stormid: import_zod2.z.string().optional(),
  stormnum: import_zod2.z.number().optional(),
  stormtype: import_zod2.z.string().optional(),
  dtg: import_zod2.z.number().optional(),
  year: import_zod2.z.number().optional(),
  month: import_zod2.z.string().optional(),
  day: import_zod2.z.number().optional(),
  hhmm: import_zod2.z.string().optional(),
  tau: import_zod2.z.number().optional(),
  mslp: import_zod2.z.number().optional(),
  basin: import_zod2.z.string().optional(),
  intensity: import_zod2.z.number().optional(),
  ss: import_zod2.z.number().optional(),
  lat: import_zod2.z.number().optional(),
  lon: import_zod2.z.number().optional(),
  // Alias/Common names used in clients/tests
  category: import_zod2.z.number().optional(),
  windSpeed: import_zod2.z.number().optional(),
  pressure: import_zod2.z.number().optional(),
  status: import_zod2.z.string().optional()
});
var WildfirePropsSchema = import_zod2.z.object({
  brightness: import_zod2.z.number(),
  bright_ti4: import_zod2.z.number().optional(),
  bright_ti5: import_zod2.z.number().optional(),
  scan: import_zod2.z.number().optional(),
  track: import_zod2.z.number().optional(),
  acq_date: import_zod2.z.string(),
  acq_time: import_zod2.z.string(),
  satellite: import_zod2.z.string().optional(),
  instrument: import_zod2.z.string().optional(),
  confidence: import_zod2.z.union([import_zod2.z.number(), import_zod2.z.string()]).optional(),
  version: import_zod2.z.string().optional(),
  frp: import_zod2.z.number().optional(),
  daynight: import_zod2.z.string().optional()
});
var MeasurementValueSchema = import_zod2.z.object({
  value: import_zod2.z.number(),
  unit: import_zod2.z.string(),
  quality: import_zod2.z.enum(["good", "suspect", "estimated", "missing"]).optional()
});
var StandardMeasurementsSchema = import_zod2.z.record(import_zod2.z.string(), MeasurementValueSchema);
var StandardObservationSchema = import_zod2.z.object({
  timestamp: import_zod2.z.string().or(import_zod2.z.date()),
  stationId: import_zod2.z.string(),
  latitude: import_zod2.z.number().optional(),
  longitude: import_zod2.z.number().optional(),
  measurements: StandardMeasurementsSchema,
  metadata: import_zod2.z.record(import_zod2.z.string(), import_zod2.z.unknown()).optional(),
  imageUrl: import_zod2.z.string().optional()
});
var ObservationQueryResultSchema = import_zod2.z.object({
  stationId: import_zod2.z.string(),
  observations: import_zod2.z.array(StandardObservationSchema),
  count: import_zod2.z.number(),
  timeRange: import_zod2.z.object({
    start: import_zod2.z.string().or(import_zod2.z.date()),
    end: import_zod2.z.string().or(import_zod2.z.date())
  }),
  provider: import_zod2.z.string(),
  cached: import_zod2.z.boolean()
});
var FlightPropsSchema = import_zod2.z.object({
  // OpenSky Fields
  icao24: import_zod2.z.string().optional(),
  callsign: import_zod2.z.string().optional(),
  originCountry: import_zod2.z.string().optional(),
  // Airplanes Live Fields
  hex: import_zod2.z.string().optional(),
  flight: import_zod2.z.string().optional(),
  registration: import_zod2.z.string().optional(),
  type: import_zod2.z.string().optional(),
  // Common / Shared
  velocity: import_zod2.z.number().nullable().optional(),
  geoAltitude: import_zod2.z.number().nullable().optional(),
  onGround: import_zod2.z.boolean().nullable().optional(),
  verticalRate: import_zod2.z.number().nullable().optional(),
  baroAltitude: import_zod2.z.union([import_zod2.z.number(), import_zod2.z.string()]).nullable().optional(),
  squawk: import_zod2.z.string().nullable().optional(),
  spi: import_zod2.z.boolean().nullable().optional(),
  positionSource: import_zod2.z.number().nullable().optional(),
  groundSpeed: import_zod2.z.number().nullable().optional(),
  track: import_zod2.z.number().nullable().optional(),
  // LiveFlights synonym
  trueTrack: import_zod2.z.number().nullable().optional(),
  // GlobalFlights synonym
  emergency: import_zod2.z.string().nullable().optional(),
  category: import_zod2.z.string().nullable().optional(),
  // Timestamps
  timePosition: import_zod2.z.number().nullable().optional(),
  lastContact: import_zod2.z.number().nullable().optional(),
  // Sensors
  sensors: import_zod2.z.array(import_zod2.z.number()).nullable().optional()
});
var EventPayloadSchema = import_zod2.z.object({
  provider: import_zod2.z.string(),
  type: import_zod2.z.enum(["Feature", "FeatureCollection"]),
  data: import_zod2.z.unknown(),
  // Pode ser qualquer um dos GeoJSONs acima
  timestamp: import_zod2.z.string(),
  action: import_zod2.z.enum(["created", "updated", "deleted"]).optional()
});
var FlightScheduleResponseSchema = import_zod2.z.object({
  provider: import_zod2.z.string(),
  data: import_zod2.z.record(import_zod2.z.string(), import_zod2.z.unknown()),
  // AeroDataBox returns varied structure
  timestamp: import_zod2.z.string(),
  count: import_zod2.z.number().optional(),
  metadata: import_zod2.z.object({
    source: import_zod2.z.string(),
    cacheTTL: import_zod2.z.number(),
    cached: import_zod2.z.boolean()
  }).optional()
});

// src/core/config.ts
var DEFAULT_CONFIG = {
  baseUrl: (typeof process !== "undefined" ? process.env.GEOLAYERS_BASE_URL : void 0) || "",
  timeout: 3e4,
  retries: 2
};

// src/core/errors.ts
var GeoLayersError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "GeoLayersError";
  }
};
var GeoLayersApiError = class extends GeoLayersError {
  constructor(message, statusCode, response) {
    super(message);
    this.statusCode = statusCode;
    this.response = response;
    this.name = "GeoLayersApiError";
  }
};
var GeoLayersValidationError = class extends GeoLayersError {
  constructor(message, errors) {
    super(message);
    this.errors = errors;
    this.name = "GeoLayersValidationError";
  }
};

// src/core/client.ts
var BaseClient = class {
  http;
  config;
  constructor(config) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.http = import_axios.default.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout
    });
    this.setupInterceptors();
  }
  setupInterceptors() {
    this.http.interceptors.request.use((config) => {
      config.headers["X-API-Key"] = this.config.apiKey;
      return config;
    });
  }
  isRetryableError(error) {
    if (!error.response) return true;
    const status = error.response.status;
    return status >= 500 || status === 429;
  }
  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async executeWithRetry(requestFn) {
    const maxRetries = this.config.retries ?? 2;
    let lastError = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await requestFn();
        return response.data;
      } catch (err) {
        const error = err;
        lastError = error;
        const isLastAttempt = attempt === maxRetries;
        if (isLastAttempt || !this.isRetryableError(error)) {
          break;
        }
        const delayMs = Math.pow(2, attempt) * 1e3;
        await this.delay(delayMs);
      }
    }
    if (!lastError.response) {
      throw new GeoLayersApiError(lastError.message, 0);
    }
    const { status, data } = lastError.response;
    let message;
    if (typeof data?.message === "string") {
      message = data.message;
    } else if (Array.isArray(data?.message)) {
      message = data.message.join("; ");
    } else if (typeof data?.error === "string") {
      message = data.error;
    } else if (data?.error?.message) {
      message = data.error.message;
    } else {
      message = lastError.message ?? "Unknown error";
    }
    throw new GeoLayersApiError(message, status, data);
  }
  async get(url, params) {
    return this.executeWithRetry(
      () => this.http.get(url, { params })
    );
  }
  async post(url, body) {
    return this.executeWithRetry(
      () => this.http.post(url, body)
    );
  }
  /**
   * Helper to parse GeoJSON responses with Zod validation.
   * Eliminates repetitive schema creation across domains.
   */
  parseGeoJSON(data, propsSchema) {
    const schema = createLayerResponseSchema(createFeatureCollectionSchema(propsSchema));
    return schema.parse(data);
  }
};

// src/domains/aviation.ts
var AviationDomain = class extends BaseClient {
  /**
   * Get all currently tracked flights globally (OpenSky).
   * @param filters Optional bounding box filters. Defaults to whole world.
   */
  async getGlobalFlights(filters = {}) {
    const params = {
      lamin: filters.lamin ?? -90,
      lomin: filters.lomin ?? -180,
      lamax: filters.lamax ?? 90,
      lomax: filters.lomax ?? 180
    };
    const data = await this.get("/geojson/flights/global", params);
    return this.parseGeoJSON(data, FlightPropsSchema);
  }
  /**
   * Get live flights (subset of global flights).
   * @param filters Center point and radius filters. Defaults to New York if not provided.
   */
  async getLiveFlights(filters = { lat: 40.7128, lng: -74.006 }) {
    const params = {
      lat: filters.lat,
      lng: filters.lng,
      radius: filters.radius ?? 250
    };
    const data = await this.get("/geojson/flights/live", params);
    return this.parseGeoJSON(data, FlightPropsSchema);
  }
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
  async getFlightSchedule(callsign) {
    const data = await this.get("/geojson/flights/schedule", { callsign });
    return FlightScheduleResponseSchema.parse(data);
  }
};

// src/domains/events.ts
var import_zod3 = require("zod");
var GeoLayersEventTypeSchema = import_zod3.z.enum([
  "earthquake.new",
  "earthquake.updated",
  "storm.new",
  "storm.updated",
  "wildfire.new",
  "wildfire.updated",
  "volcano.alert",
  "snapshot.completed",
  "snapshot.failed",
  "observation.batch"
]);
var EventTypesResponseSchema = import_zod3.z.object({
  types: import_zod3.z.array(GeoLayersEventTypeSchema),
  descriptions: import_zod3.z.record(import_zod3.z.string(), import_zod3.z.string())
});
var EventsDomain = class extends BaseClient {
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
  async getEventTypes() {
    const data = await this.get("/events/types");
    return EventTypesResponseSchema.parse(data);
  }
};

// src/domains/fire.ts
var FireDomain = class extends BaseClient {
  /**
   * Get list of active wildfires/heat anomalies.
   * @param filters Optional filters. Default: last 1 day.
   */
  async getWildfires(filters = {}) {
    const params = { days: filters.days ?? 1 };
    const data = await this.get("/geojson/wildfires", params);
    return this.parseGeoJSON(data, WildfirePropsSchema);
  }
};

// src/domains/maritime.ts
var MaritimeDomain = class extends BaseClient {
  /**
   * Get NOAA buoy stations (locations).
   */
  async getBuoyStations() {
    const data = await this.get("/geojson/buoys/stations");
    return this.parseGeoJSON(data, WeatherStationPropsSchema);
  }
  /**
   * Get latest buoy observations (real-time-ish).
   */
  async getLatestBuoyObservations() {
    const data = await this.get("/geojson/buoys/observations");
    return this.parseGeoJSON(data, WeatherStationPropsSchema);
  }
  /**
   * Get historical observations for a specific buoy.
   * @param buoyId The buoy identifier.
   * @param filters Date range filters.
   */
  async getBuoyObservations(buoyId, filters) {
    const data = await this.get(`/observations/buoy/${buoyId}`, filters);
    return ObservationQueryResultSchema.parse(data);
  }
};

// src/domains/seismic.ts
var PRESET_HOURS = {
  "1h": 1,
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30
};
function getTimeRange(preset) {
  const now = /* @__PURE__ */ new Date();
  const hoursAgo = PRESET_HOURS[preset];
  const start = new Date(now.getTime() - hoursAgo * 60 * 60 * 1e3);
  return {
    startTime: start.toISOString(),
    endTime: now.toISOString()
  };
}
var SeismicDomain = class extends BaseClient {
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
  async getEarthquakes(filters) {
    const { timePreset = "24h", startTime, endTime, minMagnitude } = filters ?? {};
    const timeRange = startTime && endTime ? { startTime, endTime } : getTimeRange(timePreset);
    const params = {
      ...timeRange,
      ...minMagnitude !== void 0 && { minMagnitude }
    };
    const data = await this.get("/geojson/earthquakes", params);
    return this.parseGeoJSON(data, EarthquakePropsSchema);
  }
};

// src/domains/tropical.ts
var TropicalDomain = class extends BaseClient {
  /**
   * Get list of currently active tropical storms/hurricanes.
   */
  async getActiveStorms() {
    const data = await this.get("/geojson/storms/active");
    return this.parseGeoJSON(data, StormPropsSchema);
  }
  /**
   * Get list of recent tropical storms/hurricanes.
   */
  async getRecentStorms() {
    const data = await this.get("/geojson/storms/recent");
    return this.parseGeoJSON(data, StormPropsSchema);
  }
};

// src/domains/volcanic.ts
var import_zod4 = require("zod");
var VolcanoesResponseSchema = import_zod4.z.object({
  provider: import_zod4.z.string(),
  data: import_zod4.z.array(createFeatureSchema(VolcanoPropsSchema)),
  timestamp: import_zod4.z.string(),
  count: import_zod4.z.number().optional(),
  metadata: LayerMetadataSchema.optional()
});
var VolcanicDomain = class extends BaseClient {
  /**
   * Get list of Holocene volcanoes (Smithsonian Institution).
   * Note: API returns array of Features, normalized to FeatureCollection here.
   */
  async getVolcanoes() {
    const raw = await this.get("/geojson/volcanoes");
    const parsed = VolcanoesResponseSchema.parse(raw);
    return {
      provider: parsed.provider,
      data: {
        type: "FeatureCollection",
        features: parsed.data
      },
      timestamp: parsed.timestamp,
      count: parsed.count,
      metadata: parsed.metadata
    };
  }
  /**
   * Get list of currently active volcanoes (GDACS).
   */
  async getActiveVolcanoes() {
    const data = await this.get("/geojson/volcanoes/active");
    return this.parseGeoJSON(data, ActiveVolcanoPropsSchema);
  }
};

// src/domains/weather.ts
var WeatherDomain = class extends BaseClient {
  /**
   * Get weather stations from WIS2 network.
   * @param filters Optional pagination filters.
   */
  async getWis2Stations(filters = {}) {
    const params = {
      limit: filters.limit ?? 100,
      offset: filters.offset ?? 0
    };
    const data = await this.get("/geojson/stations/wis2", params);
    return this.parseGeoJSON(data, WeatherStationPropsSchema);
  }
  /**
   * Get historical observations for a WIS2 station.
   * @param stationId The station identifier.
   * @param filters Date range and optional WIS2-specific filters.
   */
  async getWis2Observations(stationId, filters) {
    const data = await this.get(`/observations/wis2/${stationId}`, filters);
    return ObservationQueryResultSchema.parse(data);
  }
  /**
   * Get weather stations from IEM/AZOS network.
   */
  async getIemStations() {
    const data = await this.get("/geojson/stations/azos");
    return this.parseGeoJSON(data, WeatherStationPropsSchema);
  }
  /**
   * Get historical observations for an IEM station.
   * @param stationId The station identifier.
   * @param filters Date range filters.
   */
  async getIemObservations(stationId, filters) {
    const data = await this.get(`/observations/iem/${stationId}`, filters);
    return ObservationQueryResultSchema.parse(data);
  }
  /**
   * Get weather stations from NWS (National Weather Service) network.
   */
  async getNWSWeatherStations() {
    const data = await this.get("/geojson/stations/nws");
    return this.parseGeoJSON(data, WeatherStationPropsSchema);
  }
  /**
   * Get active stations that have reported data in the last 24 hours.
   * @param type The station network type ('iem' or 'wis2').
   * 
   * Note: This endpoint returns FeatureCollection directly (not LayerResponse envelope).
   */
  async getActiveStations(type) {
    const rawData = await this.get("/stations/active", { type });
    const featureCollection = rawData;
    if (featureCollection?.type === "FeatureCollection") {
      const features = (featureCollection.features ?? []).map((f) => {
        const feature = f;
        return {
          type: "Feature",
          geometry: feature.geometry,
          properties: WeatherStationPropsSchema.parse(feature.properties ?? {}),
          id: feature.id
        };
      });
      return {
        provider: `active-stations-${type}`,
        data: {
          type: "FeatureCollection",
          features
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        count: features.length
      };
    }
    return this.parseGeoJSON(rawData, WeatherStationPropsSchema);
  }
};

// src/events/stream.ts
var import_events = require("events");
var EventStream = class extends import_events.EventEmitter {
  eventSource = null;
  url;
  constructor(config) {
    super();
    this.url = `${config.baseUrl}/events/stream?apiKey=${config.apiKey}`;
  }
  /**
   * Start listening to the event stream.
   */
  connect() {
    if (this.eventSource) return;
    this.eventSource = new EventSource(this.url);
    this.eventSource.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        const payload = EventPayloadSchema.parse(rawData);
        this.emit("data", payload);
        this.emit(payload.provider, payload);
      } catch (err) {
        this.emit("error", err);
      }
    };
    this.eventSource.onerror = (err) => {
      this.emit("error", err);
    };
  }
  /**
   * Stop listening to the event stream.
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
  on(event, listener) {
    return super.on(event, listener);
  }
  off(event, listener) {
    return super.off(event, listener);
  }
};

// src/index.ts
var GeoLayersSDK = class {
  seismic;
  volcanic;
  tropical;
  fire;
  weather;
  maritime;
  aviation;
  /** Real-time event stream (SSE) */
  events;
  /** Event metadata operations (REST) */
  eventsMeta;
  constructor(config) {
    this.seismic = new SeismicDomain(config);
    this.volcanic = new VolcanicDomain(config);
    this.tropical = new TropicalDomain(config);
    this.fire = new FireDomain(config);
    this.weather = new WeatherDomain(config);
    this.maritime = new MaritimeDomain(config);
    this.aviation = new AviationDomain(config);
    this.events = new EventStream(config);
    this.eventsMeta = new EventsDomain(config);
  }
};
var index_default = GeoLayersSDK;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ActiveVolcanoPropsSchema,
  DEFAULT_CONFIG,
  EarthquakePropsSchema,
  EventPayloadSchema,
  FlightPropsSchema,
  FlightScheduleResponseSchema,
  GeoLayersApiError,
  GeoLayersError,
  GeoLayersSDK,
  GeoLayersValidationError,
  GeometrySchema,
  LayerMetadataSchema,
  LayerProvider,
  MeasurementValueSchema,
  ObservationQueryResultSchema,
  StandardMeasurementsSchema,
  StandardObservationSchema,
  StormPropsSchema,
  VolcanoPropsSchema,
  WeatherStationPropsSchema,
  WildfirePropsSchema,
  createFeatureCollectionSchema,
  createFeatureSchema,
  createLayerResponseSchema
});
