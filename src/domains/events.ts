import { z } from 'zod';
import { BaseClient } from '../core/client';

/**
 * Available event types from the geo-layers event stream.
 */
export const GeoLayersEventTypeSchema = z.enum([
    'earthquake.new',
    'earthquake.updated',
    'storm.new',
    'storm.updated',
    'wildfire.new',
    'wildfire.updated',
    'volcano.alert',
    'snapshot.completed',
    'snapshot.failed',
    'observation.batch',
]);

export type GeoLayersEventType = z.infer<typeof GeoLayersEventTypeSchema>;

/**
 * Response from /events/types endpoint.
 */
export const EventTypesResponseSchema = z.object({
    types: z.array(GeoLayersEventTypeSchema),
    descriptions: z.record(z.string(), z.string()),
});

export type EventTypesResponse = z.infer<typeof EventTypesResponseSchema>;

export class EventsDomain extends BaseClient {
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
    async getEventTypes(): Promise<EventTypesResponse> {
        // v1 only - not yet migrated to v2
        const url = this.resolveUrl({
            v1: '/events/types',
            v2: null,
        });

        const data = await this.get<unknown>(url);
        return EventTypesResponseSchema.parse(data);
    }
}
