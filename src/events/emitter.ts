import { EventEmitter } from 'events';

/**
 * Custom EventEmitter for SDK-wide event management.
 * Can be extended or used as a singleton for cross-module communication.
 */
export class GeoLayersEmitter extends EventEmitter {
    /**
     * Typed emit helper (optional enhancement)
     */
    public emitEvent(event: string, ...args: unknown[]): boolean {
        return this.emit(event, ...args);
    }
}

export const sdkEmitter = new GeoLayersEmitter();

