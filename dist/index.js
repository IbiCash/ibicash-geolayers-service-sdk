// src/core/client.ts
import axios from "axios";

// src/types/api.ts
import { z } from "zod";
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
var LayerMetadataSchema = z.object({
  source: z.string(),
  cacheTTL: z.number(),
  cached: z.boolean(),
  snapshotId: z.string().optional()
});
var createLayerResponseSchema = (dataSchema) => z.object({
  provider: z.string(),
  data: dataSchema,
  timestamp: z.string(),
  count: z.number().optional(),
  metadata: LayerMetadataSchema.optional()
});

// src/types/geojson.ts
import { z as z2 } from "zod";
var PositionSchema = z2.tuple([z2.number(), z2.number()]).rest(z2.number());
var GeometrySchema = z2.discriminatedUnion("type", [
  z2.object({ type: z2.literal("Point"), coordinates: PositionSchema }),
  z2.object({ type: z2.literal("LineString"), coordinates: z2.array(PositionSchema) }),
  z2.object({ type: z2.literal("Polygon"), coordinates: z2.array(z2.array(PositionSchema)) }),
  z2.object({ type: z2.literal("MultiPoint"), coordinates: z2.array(PositionSchema) }),
  z2.object({ type: z2.literal("MultiLineString"), coordinates: z2.array(z2.array(PositionSchema)) }),
  z2.object({ type: z2.literal("MultiPolygon"), coordinates: z2.array(z2.array(z2.array(PositionSchema))) })
]);
var createFeatureSchema = (propsSchema) => z2.object({
  type: z2.literal("Feature"),
  geometry: GeometrySchema,
  properties: propsSchema,
  id: z2.union([z2.string(), z2.number()]).optional()
});
var createFeatureCollectionSchema = (propsSchema) => z2.object({
  type: z2.literal("FeatureCollection"),
  features: z2.array(createFeatureSchema(propsSchema)),
  bbox: z2.array(z2.number()).optional()
});
var EarthquakePropsSchema = z2.object({
  mag: z2.number(),
  place: z2.string(),
  time: z2.number(),
  updated: z2.number(),
  tz: z2.number().nullable().optional(),
  url: z2.string(),
  detail: z2.string(),
  felt: z2.number().nullable().optional(),
  cdi: z2.number().nullable().optional(),
  mmi: z2.number().nullable().optional(),
  alert: z2.string().nullable().optional(),
  status: z2.string(),
  tsunami: z2.number(),
  sig: z2.number(),
  net: z2.string(),
  code: z2.string(),
  ids: z2.string(),
  sources: z2.string(),
  types: z2.string(),
  nst: z2.number().nullable().optional(),
  dmin: z2.number().nullable().optional(),
  rms: z2.number().nullable().optional(),
  gap: z2.number().nullable().optional(),
  magType: z2.string(),
  type: z2.string(),
  title: z2.string()
});
var VolcanoPropsSchema = z2.object({
  volcanoNumber: z2.number().nullable().optional(),
  volcanoName: z2.string(),
  volcanicLandform: z2.string().nullable().optional(),
  primaryVolcanoType: z2.string().nullable().optional(),
  lastEruptionYear: z2.union([z2.string(), z2.number()]).nullable().optional(),
  country: z2.string(),
  region: z2.string().nullable().optional(),
  subregion: z2.string().nullable().optional(),
  geologicalSummary: z2.string().nullable().optional(),
  latitude: z2.number().nullable().optional(),
  longitude: z2.number().nullable().optional(),
  elevation: z2.number().nullable().optional(),
  tectonicSetting: z2.string().nullable().optional(),
  geologicEpoch: z2.string().nullable().optional(),
  evidenceCategory: z2.string().nullable().optional(),
  primaryPhotoLink: z2.string().nullable().optional(),
  primaryPhotoCaption: z2.string().nullable().optional(),
  primaryPhotoCredit: z2.string().nullable().optional(),
  majorRockType: z2.string().nullable().optional()
});
var ActiveVolcanoPropsSchema = z2.object({
  name: z2.string(),
  eventtype: z2.string().optional(),
  eventid: z2.number().optional(),
  episodeid: z2.number().optional(),
  eventname: z2.string().optional(),
  glide: z2.string().optional(),
  description: z2.string().optional(),
  htmldescription: z2.string().optional(),
  icon: z2.string().optional(),
  iconoverall: z2.string().optional(),
  url: z2.object({
    geometry: z2.string().optional(),
    report: z2.string().optional(),
    details: z2.string().optional()
  }).optional(),
  alertlevel: z2.string().optional(),
  alertscore: z2.number().optional(),
  episodealertlevel: z2.string().optional(),
  episodealertscore: z2.number().optional(),
  istemporary: z2.string().optional(),
  iscurrent: z2.string().optional(),
  country: z2.string().optional(),
  fromdate: z2.string().optional(),
  todate: z2.string().optional(),
  datemodified: z2.string().optional(),
  iso3: z2.string().optional(),
  source: z2.string().optional(),
  sourceid: z2.string().optional(),
  polygonlabel: z2.string().optional(),
  class: z2.string().optional(),
  affectedcountries: z2.array(z2.object({
    iso2: z2.string().optional(),
    iso3: z2.string().optional(),
    countryname: z2.string().optional()
  })).optional(),
  severitydata: z2.object({
    severity: z2.number().optional(),
    severitytext: z2.string().optional(),
    severityunit: z2.string().optional()
  }).optional(),
  marketType: z2.literal("volcano").optional(),
  volcname: z2.string().optional()
});
var WeatherStationPropsSchema = z2.object({
  id: z2.string().optional(),
  wigos_station_identifier: z2.string().optional(),
  station_identifier: z2.string().optional(),
  // Fallback
  name: z2.string().optional(),
  station_name: z2.string().optional(),
  // Fallback
  provider: z2.string().optional(),
  country: z2.string().optional(),
  baseUrl: z2.string().optional(),
  wis2CollectionId: z2.string().optional(),
  marketType: z2.string().optional(),
  metadata: z2.record(z2.string(), z2.unknown()).optional(),
  measurements: z2.record(
    z2.string(),
    z2.object({
      value: z2.union([z2.number(), z2.string()]),
      unit: z2.string().optional()
    })
  ).optional()
});
var StormPropsSchema = z2.object({
  objectid: z2.number().optional(),
  stormname: z2.string().optional(),
  stormid: z2.string().optional(),
  stormnum: z2.number().optional(),
  stormtype: z2.string().optional(),
  dtg: z2.number().optional(),
  year: z2.number().optional(),
  month: z2.string().optional(),
  day: z2.number().optional(),
  hhmm: z2.string().optional(),
  tau: z2.number().optional(),
  mslp: z2.number().optional(),
  basin: z2.string().optional(),
  intensity: z2.number().optional(),
  ss: z2.number().optional(),
  lat: z2.number().optional(),
  lon: z2.number().optional(),
  // Alias/Common names used in clients/tests
  category: z2.number().optional(),
  windSpeed: z2.number().optional(),
  pressure: z2.number().optional(),
  status: z2.string().optional()
});
var WildfirePropsSchema = z2.object({
  brightness: z2.number(),
  bright_ti4: z2.number().optional(),
  bright_ti5: z2.number().optional(),
  scan: z2.number().optional(),
  track: z2.number().optional(),
  acq_date: z2.string(),
  acq_time: z2.string(),
  satellite: z2.string().optional(),
  instrument: z2.string().optional(),
  confidence: z2.union([z2.number(), z2.string()]).optional(),
  version: z2.string().optional(),
  frp: z2.number().optional(),
  daynight: z2.string().optional()
});
var MeasurementValueSchema = z2.object({
  value: z2.number(),
  unit: z2.string(),
  quality: z2.enum(["good", "suspect", "estimated", "missing"]).optional()
});
var StandardMeasurementsSchema = z2.record(z2.string(), MeasurementValueSchema);
var StandardObservationSchema = z2.object({
  timestamp: z2.string().or(z2.date()),
  stationId: z2.string(),
  latitude: z2.number().optional(),
  longitude: z2.number().optional(),
  measurements: StandardMeasurementsSchema,
  metadata: z2.record(z2.string(), z2.unknown()).optional(),
  imageUrl: z2.string().optional()
});
var ObservationQueryResultSchema = z2.object({
  stationId: z2.string(),
  observations: z2.array(StandardObservationSchema),
  count: z2.number(),
  timeRange: z2.object({
    start: z2.string().or(z2.date()),
    end: z2.string().or(z2.date())
  }),
  provider: z2.string(),
  cached: z2.boolean()
});
var FlightPropsSchema = z2.object({
  // OpenSky Fields
  icao24: z2.string().optional(),
  callsign: z2.string().optional(),
  originCountry: z2.string().optional(),
  // Airplanes Live Fields
  hex: z2.string().optional(),
  flight: z2.string().optional(),
  registration: z2.string().optional(),
  type: z2.string().optional(),
  // Common / Shared
  velocity: z2.number().nullable().optional(),
  geoAltitude: z2.number().nullable().optional(),
  onGround: z2.boolean().nullable().optional(),
  verticalRate: z2.number().nullable().optional(),
  baroAltitude: z2.union([z2.number(), z2.string()]).nullable().optional(),
  squawk: z2.string().nullable().optional(),
  spi: z2.boolean().nullable().optional(),
  positionSource: z2.number().nullable().optional(),
  groundSpeed: z2.number().nullable().optional(),
  track: z2.number().nullable().optional(),
  // LiveFlights synonym
  trueTrack: z2.number().nullable().optional(),
  // GlobalFlights synonym
  emergency: z2.string().nullable().optional(),
  category: z2.string().nullable().optional(),
  // Timestamps
  timePosition: z2.number().nullable().optional(),
  lastContact: z2.number().nullable().optional(),
  // Sensors
  sensors: z2.array(z2.number()).nullable().optional()
});
var EventPayloadSchema = z2.object({
  provider: z2.string(),
  type: z2.enum(["Feature", "FeatureCollection"]),
  data: z2.unknown(),
  // Pode ser qualquer um dos GeoJSONs acima
  timestamp: z2.string(),
  action: z2.enum(["created", "updated", "deleted"]).optional()
});
var FlightScheduleResponseSchema = z2.object({
  provider: z2.string(),
  data: z2.record(z2.string(), z2.unknown()),
  // AeroDataBox returns varied structure
  timestamp: z2.string(),
  count: z2.number().optional(),
  metadata: z2.object({
    source: z2.string(),
    cacheTTL: z2.number(),
    cached: z2.boolean()
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
    this.http = axios.create({
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
import { z as z3 } from "zod";
var GeoLayersEventTypeSchema = z3.enum([
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
var EventTypesResponseSchema = z3.object({
  types: z3.array(GeoLayersEventTypeSchema),
  descriptions: z3.record(z3.string(), z3.string())
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
import { z as z4 } from "zod";
var VolcanoesResponseSchema = z4.object({
  provider: z4.string(),
  data: z4.array(createFeatureSchema(VolcanoPropsSchema)),
  timestamp: z4.string(),
  count: z4.number().optional(),
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
import { EventEmitter } from "events";
var EventStream = class extends EventEmitter {
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
export {
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
  createLayerResponseSchema,
  index_default as default
};
