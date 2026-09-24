import prisma from './prisma';
import { logger } from './logger';

export type SmartQrEventType =
  | 'SCAN'
  | 'TIP_CLICK'
  | 'TIP_INITIATED'
  | 'TIP_SUCCESS'
  | 'WIFI_CLICK'
  | 'CAMPAIGN_CLICK'
  | 'FEEDBACK_SUBMIT'
  | 'LEAD_SUBMIT'
  | 'MENU_CLICK'
  | 'MENU_VIEW'
  | string;

export interface QueuedSmartQrEvent {
  business_id: string;
  qr_id?: string | null;
  table_id?: string | null;
  event_type: SmartQrEventType;
  metadata?: any;
}

class EventBuffer {
  private queue: QueuedSmartQrEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly FLUSH_INTERVAL_MS = 2000;
  private readonly BATCH_SIZE_THRESHOLD = 25;
  private isFlushing = false;

  constructor() {
    this.startTimer();
  }

  private startTimer() {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => {
      this.flush().catch((err) => {
        logger.error('Error during scheduled event buffer flush', 'EVENT_BUFFER', { error: String(err) });
      });
    }, this.FLUSH_INTERVAL_MS);

    // Prevent timer from keeping the process alive on shutdown
    if (this.flushTimer && typeof this.flushTimer.unref === 'function') {
      this.flushTimer.unref();
    }
  }

  public queueSmartQrEvent(event: QueuedSmartQrEvent): void {
    // In test environment, write immediately so test assertions match without delays
    if (process.env.NODE_ENV === 'test') {
      prisma.smartQrEvent
        .create({ data: event })
        .catch((err) => {
          logger.warn('Failed to record smartQrEvent in test mode', 'EVENT_BUFFER', { error: String(err) });
        });
      return;
    }

    this.queue.push(event);

    if (this.queue.length >= this.BATCH_SIZE_THRESHOLD) {
      this.flush().catch((err) => {
        logger.error('Error during threshold event buffer flush', 'EVENT_BUFFER', { error: String(err) });
      });
    }
  }

  public async flush(): Promise<void> {
    if (this.isFlushing || this.queue.length === 0) return;

    this.isFlushing = true;
    const batch = this.queue.splice(0, this.queue.length);

    try {
      await prisma.smartQrEvent.createMany({
        data: batch,
        skipDuplicates: true,
      });
    } catch (err) {
      logger.error('Failed to flush smartQrEvent batch to database', 'EVENT_BUFFER', {
        error: String(err),
        batchCount: batch.length,
      });
      // In case of transient database error, keep memory bounded: only re-queue up to 100 recent events
      if (this.queue.length < 500) {
        this.queue.unshift(...batch.slice(-100));
      }
    } finally {
      this.isFlushing = false;
    }
  }
}

export const eventBuffer = new EventBuffer();
