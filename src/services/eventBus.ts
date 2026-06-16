/**
 * ── NeoBank Event Bus (Simulated Kafka) ──────────────────────
 * A lightweight publish/subscribe event system that simulates
 * Apache Kafka-style messaging for real-time event-driven
 * communication across the application.
 *
 * Features:
 * - Typed events with payloads
 * - Topic-based pub/sub (like Kafka topics)
 * - Event history with retention
 * - Toast notification integration
 * - Cross-tab synchronization via localStorage
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// ── Event Types ────────────────────────────────────────────

export type EventSeverity = 'info' | 'success' | 'warning' | 'error';

export interface NeoEvent {
  id: string;
  topic: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
  severity: EventSeverity;
  source: string;
}

export type EventListener = (event: NeoEvent) => void;

// ── Configuration ──────────────────────────────────────────

interface EventBusConfig {
  maxHistory: number;       // Max events kept in memory
  enableToast: boolean;     // Show toast for events
  enableCrossTab: boolean;  // Sync events across tabs
}

const DEFAULT_CONFIG: EventBusConfig = {
  maxHistory: 200,
  enableToast: true,
  enableCrossTab: true,
};

// ── Event Topics (Kafka-style) ──────────────────────────────

export const EVENT_TOPICS = {
  TRANSACTIONS: 'transactions',
  ACCOUNTS: 'accounts',
  AUTH: 'auth',
  KYC: 'kyc',
  SYSTEM: 'system',
  BENEFICIARIES: 'beneficiaries',
  USERS: 'users',
} as const;

export const EVENT_TYPES = {
  // Transaction events
  TRANSFER_CREATED: 'transfer.created',
  TRANSFER_COMPLETED: 'transfer.completed',
  TRANSFER_FAILED: 'transfer.failed',
  DEPOSIT_CREATED: 'deposit.created',
  DEPOSIT_COMPLETED: 'deposit.completed',
  WITHDRAWAL_CREATED: 'withdrawal.created',
  WITHDRAWAL_COMPLETED: 'withdrawal.completed',

  // Account events
  ACCOUNT_CREATED: 'account.created',
  ACCOUNT_UPDATED: 'account.updated',
  ACCOUNT_FROZEN: 'account.frozen',
  ACCOUNT_UNFROZEN: 'account.unfrozen',
  BALANCE_CHANGED: 'balance.changed',

  // Auth events
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_REGISTERED: 'user.registered',
  PASSWORD_CHANGED: 'password.changed',

  // KYC events
  KYC_SUBMITTED: 'kyc.submitted',
  KYC_VERIFIED: 'kyc.verified',
  KYC_REJECTED: 'kyc.rejected',

  // Beneficiary events
  BENEFICIARY_ADDED: 'beneficiary.added',
  BENEFICIARY_UPDATED: 'beneficiary.updated',
  BENEFICIARY_DELETED: 'beneficiary.deleted',

  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_SUSPENDED: 'user.suspended',
  USER_DELETED: 'user.deleted',

  // System events
  SERVICE_STATUS: 'service.status',
  SYNC_COMPLETED: 'sync.completed',
  DATA_REFRESHED: 'data.refreshed',
} as const;

// ── Event Severity Map ─────────────────────────────────────

const EVENT_SEVERITY_MAP: Record<string, EventSeverity> = {
  [EVENT_TYPES.TRANSFER_CREATED]: 'info',
  [EVENT_TYPES.TRANSFER_COMPLETED]: 'success',
  [EVENT_TYPES.TRANSFER_FAILED]: 'error',
  [EVENT_TYPES.DEPOSIT_CREATED]: 'info',
  [EVENT_TYPES.DEPOSIT_COMPLETED]: 'success',
  [EVENT_TYPES.WITHDRAWAL_CREATED]: 'info',
  [EVENT_TYPES.WITHDRAWAL_COMPLETED]: 'success',
  [EVENT_TYPES.ACCOUNT_CREATED]: 'success',
  [EVENT_TYPES.ACCOUNT_UPDATED]: 'info',
  [EVENT_TYPES.ACCOUNT_FROZEN]: 'warning',
  [EVENT_TYPES.ACCOUNT_UNFROZEN]: 'success',
  [EVENT_TYPES.BALANCE_CHANGED]: 'info',
  [EVENT_TYPES.USER_LOGIN]: 'info',
  [EVENT_TYPES.USER_LOGOUT]: 'info',
  [EVENT_TYPES.USER_REGISTERED]: 'success',
  [EVENT_TYPES.PASSWORD_CHANGED]: 'info',
  [EVENT_TYPES.KYC_SUBMITTED]: 'info',
  [EVENT_TYPES.KYC_VERIFIED]: 'success',
  [EVENT_TYPES.KYC_REJECTED]: 'error',
  [EVENT_TYPES.BENEFICIARY_ADDED]: 'success',
  [EVENT_TYPES.BENEFICIARY_UPDATED]: 'info',
  [EVENT_TYPES.BENEFICIARY_DELETED]: 'warning',
  [EVENT_TYPES.USER_CREATED]: 'success',
  [EVENT_TYPES.USER_UPDATED]: 'info',
  [EVENT_TYPES.USER_SUSPENDED]: 'warning',
  [EVENT_TYPES.USER_DELETED]: 'error',
  [EVENT_TYPES.SERVICE_STATUS]: 'info',
  [EVENT_TYPES.SYNC_COMPLETED]: 'success',
  [EVENT_TYPES.DATA_REFRESHED]: 'info',
};

// ── Toast Messages ─────────────────────────────────────────

const EVENT_TOAST_MESSAGES: Record<string, { title: string; description: string }> = {
  [EVENT_TYPES.TRANSFER_CREATED]: { title: 'Transfer Initiated', description: 'Your transfer is being processed' },
  [EVENT_TYPES.TRANSFER_COMPLETED]: { title: 'Transfer Complete', description: 'Funds transferred successfully' },
  [EVENT_TYPES.TRANSFER_FAILED]: { title: 'Transfer Failed', description: 'Transaction could not be completed' },
  [EVENT_TYPES.DEPOSIT_CREATED]: { title: 'Deposit Initiated', description: 'Processing your deposit' },
  [EVENT_TYPES.DEPOSIT_COMPLETED]: { title: 'Deposit Complete', description: 'Funds added to your account' },
  [EVENT_TYPES.WITHDRAWAL_CREATED]: { title: 'Withdrawal Initiated', description: 'Processing your withdrawal' },
  [EVENT_TYPES.WITHDRAWAL_COMPLETED]: { title: 'Withdrawal Complete', description: 'Funds withdrawn from account' },
  [EVENT_TYPES.ACCOUNT_CREATED]: { title: 'Account Created', description: 'New account has been opened' },
  [EVENT_TYPES.ACCOUNT_FROZEN]: { title: 'Account Frozen', description: 'Account has been frozen' },
  [EVENT_TYPES.ACCOUNT_UNFROZEN]: { title: 'Account Unfrozen', description: 'Account has been reactivated' },
  [EVENT_TYPES.BENEFICIARY_ADDED]: { title: 'Beneficiary Added', description: 'New beneficiary saved' },
  [EVENT_TYPES.KYC_SUBMITTED]: { title: 'KYC Submitted', description: 'Documents sent for verification' },
  [EVENT_TYPES.KYC_VERIFIED]: { title: 'KYC Verified', description: 'Identity verification complete' },
  [EVENT_TYPES.KYC_REJECTED]: { title: 'KYC Rejected', description: 'Documents need re-submission' },
  [EVENT_TYPES.SYNC_COMPLETED]: { title: 'Sync Complete', description: 'All services synchronized' },
};

// ── Event Bus Class ────────────────────────────────────────

class EventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private history: NeoEvent[] = [];
  private config: EventBusConfig;
  private crossTabChannel: BroadcastChannel | null = null;
  private idCounter = 0;

  constructor(config: Partial<EventBusConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Cross-tab synchronization via BroadcastChannel API
    if (this.config.enableCrossTab && typeof BroadcastChannel !== 'undefined') {
      try {
        this.crossTabChannel = new BroadcastChannel('neobank-event-bus');
        this.crossTabChannel.onmessage = (event) => {
          const remoteEvent = event.data as NeoEvent;
          if (remoteEvent) {
            this.dispatchToLocalListeners(remoteEvent);
          }
        };
      } catch {
        // BroadcastChannel not available, fallback to localStorage events
        window.addEventListener('storage', (e) => {
          if (e.key === 'neobank_event_bus' && e.newValue) {
            try {
              const remoteEvent = JSON.parse(e.newValue) as NeoEvent;
              this.dispatchToLocalListeners(remoteEvent);
            } catch { /* ignore */ }
          }
        });
      }
    }
  }

  // ── Publish an event (like Kafka produce) ────────────────

  publish(
    topic: string,
    type: string,
    payload: Record<string, unknown> = {},
    options?: { severity?: EventSeverity; source?: string; silent?: boolean }
  ): NeoEvent {
    const event: NeoEvent = {
      id: `evt_${Date.now()}_${++this.idCounter}`,
      topic,
      type,
      payload,
      timestamp: Date.now(),
      severity: options?.severity || EVENT_SEVERITY_MAP[type] || 'info',
      source: options?.source || 'system',
    };

    // Store in history
    this.history.unshift(event);
    if (this.history.length > this.config.maxHistory) {
      this.history = this.history.slice(0, this.config.maxHistory);
    }

    // Persist to localStorage for cross-tab sync
    if (this.config.enableCrossTab) {
      try {
        if (this.crossTabChannel) {
          this.crossTabChannel.postMessage(event);
        } else {
          localStorage.setItem('neobank_event_bus', JSON.stringify(event));
          // Trigger storage event in same tab
          localStorage.removeItem('neobank_event_bus_last');
          localStorage.setItem('neobank_event_bus_last', String(Date.now()));
        }
      } catch { /* ignore */ }
    }

    // Dispatch to local listeners
    this.dispatchToLocalListeners(event);

    // Show toast notification
    if (this.config.enableToast && !options?.silent) {
      const msg = EVENT_TOAST_MESSAGES[type];
      if (msg) {
        const toastFn = event.severity === 'error' ? toast.error :
                         event.severity === 'warning' ? toast.warning :
                         event.severity === 'success' ? toast.success :
                         toast.info;
        toastFn(msg.title, {
          description: msg.description,
          duration: 4000,
        });
      }
    }

    // Also trigger React context refresh
    try {
      localStorage.setItem('neobank_sync_timestamp', String(Date.now()));
    } catch { /* ignore */ }

    return event;
  }

  // ── Subscribe to events (like Kafka consume) ─────────────

  subscribe(topic: string, listener: EventListener): () => void {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    this.listeners.get(topic)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(topic)?.delete(listener);
    };
  }

  // Subscribe to any event across all topics
  subscribeAll(listener: EventListener): () => void {
    const unsubscribers: (() => void)[] = [];
    Object.values(EVENT_TOPICS).forEach(topic => {
      unsubscribers.push(this.subscribe(topic, listener));
    });
    return () => unsubscribers.forEach(fn => fn());
  }

  // ── Internal dispatch ────────────────────────────────────

  private dispatchToLocalListeners(event: NeoEvent) {
    // Dispatch to topic-specific listeners
    const topicListeners = this.listeners.get(event.topic);
    if (topicListeners) {
      topicListeners.forEach(listener => {
        try {
          listener(event);
        } catch (err) {
          console.error(`[EventBus] Error in listener for topic "${event.topic}":`, err);
        }
      });
    }

    // Also dispatch to a wildcard '*' topic
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(listener => {
        try {
          listener(event);
        } catch (err) {
          console.error('[EventBus] Error in wildcard listener:', err);
        }
      });
    }
  }

  // ── Query event history ──────────────────────────────────

  getHistory(topic?: string, type?: string, limit = 50): NeoEvent[] {
    let filtered = this.history;
    if (topic) filtered = filtered.filter(e => e.topic === topic);
    if (type) filtered = filtered.filter(e => e.type === type);
    return filtered.slice(0, limit);
  }

  getEventsByType(type: string, limit = 20): NeoEvent[] {
    return this.history.filter(e => e.type === type).slice(0, limit);
  }

  clearHistory(): void {
    this.history = [];
  }

  // ── Statistics ───────────────────────────────────────────

  getStats(): { totalEvents: number; topics: Record<string, number>; types: Record<string, number> } {
    const topics: Record<string, number> = {};
    const types: Record<string, number> = {};
    this.history.forEach(e => {
      topics[e.topic] = (topics[e.topic] || 0) + 1;
      types[e.type] = (types[e.type] || 0) + 1;
    });
    return {
      totalEvents: this.history.length,
      topics,
      types,
    };
  }
}

// ── Singleton Instance ─────────────────────────────────────

export const eventBus = new EventBus();

// ── React Hook ─────────────────────────────────────────────


export function useEventBus(topic?: string) {
  const [events, setEvents] = useState<NeoEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<NeoEvent | null>(null);
  const latestEventRef = useRef<NeoEvent | null>(null);

  useEffect(() => {
    const listener = (event: NeoEvent) => {
      setEvents(prev => [event, ...prev].slice(0, 100));
      setLatestEvent(event);
      latestEventRef.current = event;
    };

    const unsubscribe = topic
      ? eventBus.subscribe(topic, listener)
      : eventBus.subscribeAll(listener);

    return unsubscribe;
  }, [topic]);

  const getTopicEvents = useCallback((t?: string, type?: string, limit = 20) => {
    return eventBus.getHistory(t || topic, type, limit);
  }, [topic]);

  return {
    events,
    latestEvent,
    latestEventRef,
    getTopicEvents,
    getStats: eventBus.getStats.bind(eventBus),
    publish: eventBus.publish.bind(eventBus),
    history: eventBus.getHistory.bind(eventBus),
  };
}

export default eventBus;
