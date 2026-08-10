import type { OrderEvent } from '../api/contract';
import { formatTime } from '../api/datetime';

type OrderTimelineProps = {
  events: OrderEvent[];
};

export function OrderTimeline({ events }: OrderTimelineProps) {
  return (
    <ol className="mt-4 space-y-4">
      {events.map((event) => (
        <li key={`${event.newStatus}-${event.createdAt}`} className="flex gap-3">
          <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ink-faint" />

          <div className="min-w-0">
            <p className="text-sm text-ink">{event.message}</p>
            <p className="mt-0.5 text-xs text-ink-faint">{formatTime(event.createdAt)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
