import { EventEmitter } from 'events';
import { GeoLayersConfig } from '../core/config';
import { EventPayload, EventPayloadSchema } from '../types';

type EventStreamListener = (payload: EventPayload) => void;
type ErrorListener = (error: unknown) => void;

export class EventStream extends EventEmitter {
    private eventSource: EventSource | null = null;
    private readonly url: string;

    constructor(config: GeoLayersConfig) {
        super();
        this.url = `${config.baseUrl}/events/stream?apiKey=${config.apiKey}`;
    }

    /**
     * Start listening to the event stream.
     */
    connect(): void {
        if (this.eventSource) return;

        this.eventSource = new EventSource(this.url);

        this.eventSource.onmessage = (event) => {
            try {
                const rawData = JSON.parse(event.data);
                const payload = EventPayloadSchema.parse(rawData);

                this.emit('data', payload);
                this.emit(payload.provider, payload);
            } catch (err) {
                this.emit('error', err);
            }
        };

        this.eventSource.onerror = (err) => {
            this.emit('error', err);
        };
    }

    /**
     * Stop listening to the event stream.
     */
    disconnect(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    /**
     * Subscribe to events.
     * @param event Event name ('data', 'error', or provider name like 'earthquakes')
     * @param listener Callback function
     */
    on(event: 'data', listener: EventStreamListener): this;
    on(event: 'error', listener: ErrorListener): this;
    on(event: string, listener: EventStreamListener): this;
    on(event: string, listener: EventStreamListener | ErrorListener): this {
        return super.on(event, listener);
    }

    /**
     * Unsubscribe from events.
     */
    off(event: 'data', listener: EventStreamListener): this;
    off(event: 'error', listener: ErrorListener): this;
    off(event: string, listener: EventStreamListener): this;
    off(event: string, listener: EventStreamListener | ErrorListener): this {
        return super.off(event, listener);
    }
}

