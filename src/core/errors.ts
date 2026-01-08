export class GeoLayersError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GeoLayersError';
    }
}

export class GeoLayersApiError extends GeoLayersError {
    constructor(
        message: string,
        public statusCode: number,
        public response?: unknown
    ) {
        super(message);
        this.name = 'GeoLayersApiError';
    }
}

export class GeoLayersValidationError extends GeoLayersError {
    constructor(
        message: string,
        public errors: unknown
    ) {
        super(message);
        this.name = 'GeoLayersValidationError';
    }
}
