# NeoBank — Kafka Event Bus Documentation

> **Apache Kafka™-Style Real-Time Event Streaming Platform**  
> Built into NeoBank's frontend for distributed event-driven communication.

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Architecture](#-architecture)
3. [Core Concepts](#-core-concepts)
4. [Event Bus Service (`eventBus.ts`)](#-event-bus-service)
5. [Kafka Dashboard Page (`KafkaDashboard.tsx`)](#-kafka-dashboard-page)
6. [Real-Time Data Flow](#-real-time-data-flow)
7. [Topics & Partitions](#-topics--partitions)
8. [Consumer Groups](#-consumer-groups)
9. [Producer Simulator](#-producer-simulator)
10. [Cross-Tab Synchronization](#-cross-tab-synchronization)
11. [Event Types & Payloads](#-event-types--payloads)
12. [Toast Notifications](#-toast-notifications)
13. [Integration with Banking Operations](#-integration-with-banking-operations)
14. [How It Works End-to-End](#-how-it-works-end-to-end)
15. [Extending the Kafka System](#-extending-the-kafka-system)

---

## 🔭 Overview

NeoBank implements a **lightweight, in-browser Apache Kafka™-style event streaming platform** that powers real-time communication across all banking operations. While a real Kafka deployment would use distributed brokers, this implementation simulates Kafka's core abstractions — **topics, partitions, consumer groups, producers, and offsets** — entirely in the browser using JavaScript.

### What It Does

- **Event-Driven Architecture** — Every banking action (transfer, deposit, account creation, KYC submission) publishes an event
- **Real-Time Updates** — All browser tabs see changes instantly via `BroadcastChannel` API
- **Visual Dashboard** — A comprehensive Kafka Dashboard shows cluster health, topic partitions, consumer groups, and live event streams
- **Toast Notifications** — Users get real-time notifications when events occur
- **Producer Simulator** — Interactive tool to publish custom events and see the Kafka pipeline in action

### Key Files

| File | Purpose |
|------|---------|
| `src/services/eventBus.ts` | Core EventBus class — Kafka-style publish/subscribe system |
| `src/pages/KafkaDashboard.tsx` | Full Kafka monitoring dashboard with 5 tabs |
| `src/components/features/EventViewer.tsx` | Event history viewer component |

---

## 🏛️ Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NeoBank Application                          │
│                                                                     │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────────────┐  │
│  │  User Action  │   │  API Service  │   │    Mock Adapter        │  │
│  │  (Transfer)   │──▶│  (Axios)     │──▶│  (localStorage)        │  │
│  └──────────────┘   └──────────────┘   └───────────┬────────────┘  │
│                                                     │               │
│                                                     ▼               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Event Bus (Kafka-Style)                    │    │
│  │                                                                │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │    │
│  │  │ Producer  │─▶│  Topic   │─▶│Partition │─▶│Consumer  │      │    │
│  │  │ (Service) │  │          │  │  (Key)   │  │ Group    │      │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                     │              │              │                 │
│                     ▼              ▼              ▼                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │Dashboard  │  │Kafka     │  │Toast     │  │Cross-Tab Sync    │  │
│  │Components │  │Dashboard │  │Notif.    │  │(BroadcastChannel)│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Kafka Analogy Comparison

| Real Kafka Concept | NeoBank Implementation |
|-------------------|----------------------|
| **Broker Cluster** | `EventBus` singleton class running in the browser |
| **Controller Broker** | The EventBus instance manages metadata |
| **Topic** | Named channel (e.g., `'transactions'`, `'accounts'`) |
| **Partition** | Logical partition based on event key hash |
| **Offset** | Sequential event ID (`evt_<timestamp>_<counter>`) |
| **Producer** | Service layer (e.g., `transactionService`) + Producer Simulator UI |
| **Consumer** | React components subscribing via `subscribe()` or `useEventBus()` hook |
| **Consumer Group** | Set of consumers sharing topic workload |
| **ISR (In-Sync Replicas)** | Not implemented (single-process) |
| **Log Retention** | Configurable `maxHistory` (default: 200 events) |
| **Commit Log** | `history[]` array + localStorage for cross-tab sync |

---

## 🎯 Core Concepts

### 1. Event (`NeoEvent`)

Every event in the system follows this interface:

```typescript
interface NeoEvent {
  id: string;                    // Unique event ID: "evt_<timestamp>_<counter>"
  topic: string;                 // Kafka-style topic name
  type: string;                  // Dot-notation event type (e.g., "transfer.completed")
  payload: Record<string, unknown>;  // Event data (amount, accounts, etc.)
  timestamp: number;             // Unix timestamp in milliseconds
  severity: 'info' | 'success' | 'warning' | 'error';
  source: string;                // Service name that produced the event
}
```

### 2. Topics

Topics are logical channels that categorize events. NeoBank defines **6 topics**:

| Topic | Partition Count | Color | Description |
|-------|----------------|-------|-------------|
| `transactions` | 3 | Blue `#3B82F6` | Transfer, deposit & withdrawal events |
| `accounts` | 2 | Purple `#8B5CF6` | Account creation, updates & status changes |
| `auth` | 2 | Cyan `#06B6D4` | Login, logout & registration events |
| `kyc` | 1 | Green `#10B981` | KYC submission & verification events |
| `beneficiaries` | 1 | Amber `#F59E0B` | Beneficiary CRUD operations |
| `system` | 1 | Gray `#6B7280` | System health & sync events |

### 3. Event Types (30+)

Each topic has multiple event types using dot notation:

```
transactions:  transfer.created | transfer.completed | transfer.failed
               deposit.created  | deposit.completed
               withdrawal.created | withdrawal.completed

accounts:      account.created | account.updated | account.frozen
               account.unfrozen | balance.changed

auth:          user.login | user.logout | user.registered
               password.changed

kyc:           kyc.submitted | kyc.verified | kyc.rejected

beneficiaries: beneficiary.added | beneficiary.updated
               beneficiary.deleted

users:         user.created | user.updated | user.suspended
               user.deleted

system:        service.status | sync.completed | data.refreshed
```

### 4. Severity Mapping

Each event type has an automatic severity level:

| Severity | Colors | Used For |
|----------|--------|----------|
| `success` | Green | Completed operations (transfers, deposits, account creation) |
| `info` | Blue | Status updates (login, balance changes, sync) |
| `warning` | Amber | Non-critical issues (account frozen, beneficiary deleted) |
| `error` | Red | Failed operations (transfer failed, KYC rejected) |

---

## ⚙️ Event Bus Service

The `eventBus` singleton in `src/services/eventBus.ts` is the heart of the Kafka system.

### Class Structure

```typescript
class EventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private history: NeoEvent[] = [];
  private config: EventBusConfig;
  private crossTabChannel: BroadcastChannel | null = null;
  private idCounter = 0;
}
```

### Key Methods

#### `publish(topic, type, payload?, options?)`

The **producer API** — publishes an event to a topic.

```typescript
// Example: Publishing a transfer completion event
eventBus.publish(
  'transactions',                          // topic
  'transfer.completed',                    // type
  { amount: 5000, from: 'ACC-001', to: 'ACC-002' },  // payload
  { severity: 'success', source: 'transaction-service' }  // options
);
```

**What happens when you publish:**

1. ✅ Creates a `NeoEvent` with unique ID, timestamp, and auto-severity
2. ✅ Prepends to the in-memory `history[]` (up to `maxHistory` limit)
3. ✅ Broadcasts to other browser tabs via `BroadcastChannel` or localStorage fallback
4. ✅ Dispatches to all local subscribers (topic-specific + wildcard)
5. ✅ Shows a toast notification (if `enableToast` is true and not silent)
6. ✅ Triggers React context refresh via localStorage timestamp
7. ✅ Returns the created event

#### `subscribe(topic, listener)`

The **consumer API** — subscribes to a topic and returns an unsubscribe function.

```typescript
// Subscribe to all transaction events
const unsub = eventBus.subscribe('transactions', (event) => {
  console.log('New transaction event:', event);
});
// Later: unsub();
```

#### `subscribeAll(listener)`

Subscribes to **all topics** at once. Used by the Kafka Dashboard.

```typescript
const unsub = eventBus.subscribeAll((event) => {
  // Receive events from ALL topics
});
```

#### `getHistory(topic?, type?, limit?)`

Query the event log (like Kafka's `kafka-consumer-groups --describe`).

```typescript
// Get last 50 events
const all = eventBus.getHistory();

// Get last 10 transaction events
const txns = eventBus.getHistory('transactions', undefined, 10);

// Get account created events
const created = eventBus.getHistory('accounts', 'account.created');
```

#### `getStats()`

Returns topic and type distribution statistics.

```typescript
const stats = eventBus.getStats();
// {
//   totalEvents: 142,
//   topics: { transactions: 89, accounts: 23, auth: 18, ... },
//   types: { 'transfer.completed': 45, 'deposit.completed': 22, ... }
// }
```

### React Hook: `useEventBus()`

```typescript
function MyComponent() {
  const { events, latestEvent, publish, getStats } = useEventBus('transactions');

  // events: NeoEvent[] — last 100 events for the topic
  // latestEvent: NeoEvent | null — most recent event
  // publish: eventBus.publish bound function
}
```

---

## 📊 Kafka Dashboard Page

The **Kafka Dashboard** (`/kafka`) is a comprehensive monitoring UI at `src/pages/KafkaDashboard.tsx` with **5 tabs**:

### Tab 1: Cluster Overview

```
┌─────────────────────────────────────────────────────┐
│ 🔗 Apache Kafka™ Event Bus — 142 messages processed │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐              │
│ │ 45   │ │  6   │ │ 3/3  │ │   5    │              │
│ │ msgs │ │Topics│ │Brok. │ │Cons.Grp│              │
│ └──────┘ └──────┘ └──────┘ └────────┘              │
├─────────────────────────────────────────────────────┤
│ Kafka Cluster — 3 Brokers                           │
│ ┌─────────────────┐ ┌─────────────┐ ┌─────────────┐│
│ │ Broker 1        │ │ Broker 2    │ │ Broker 3    ││
│ │ Controller      │ │ Broker      │ │ Broker      ││
│ │ kafka-1:9092    │ │ kafka-2:... │ │ kafka-3:... ││
│ │ 4 partitions    │ │ 3 partitions│ │ 3 partitions││
│ │ 🟢 Online       │ │ 🟢 Online   │ │ 🟢 Online   ││
│ └─────────────────┘ └─────────────┘ └─────────────┘│
├─────────────────────────────────────────────────────┤
│ Kafka Message Flow Animation                        │
│ [Producer] → [Topic/Partitions] → [Broker] →       │
│ → [Consumer Group] → [Commit Offset]               │
│                 ▶ Start Flow                        │
├─────────────────────────────────────────────────────┤
│ Kafka Producer (Interactive)                        │
│ ┌──────────┬──────────┬──────────┐                 │
│ │ Topic    │ Key      │ Produce  │                 │
│ └──────────┴──────────┴──────────┘                 │
├─────────────────────────────────────────────────────┤
│ Latest Events (Live)                                │
│ 14:23:45 | P2 | transfer | txns | transfer.completed│
│ 14:23:43 | P0 | auth     | auth | user.login        │
│ ...                                                  │
└─────────────────────────────────────────────────────┘
```

### Tab 2: Live Stream

Full-screen event log with:
- Timestamp, partition number, message key, topic, event type
- Color-coded by topic and severity
- Topic distribution bar chart
- Producer simulator panel

### Tab 3: Topics & Partitions

Visual overview of all 6 topics showing:
- Partitions with leader badges and ISR replicas
- Message count, replication factor, retention period
- Animated throughput indicators

### Tab 4: Consumer Groups

5 consumer groups with:
- Members count, topic assignment, lag status
- Auto-rebalancing visualization
- Status indicators (active/idle/lagging)

### Tab 5: Architecture

Educational section explaining:
- Producers, Topics & Partitions, Broker Cluster, Consumer Groups
- Replication & ISR, Offsets & Retention
- Detailed descriptions with gradient icons

---

## 🔄 Real-Time Data Flow

### How Events Flow Through the System

```
Step 1: User Action
        ↓
Step 2: Service publishes event
        eventBus.publish('transactions', 'transfer.completed', {...})
        ↓
Step 3: EventBus creates NeoEvent with:
        - Unique ID (evt_1718401234567_42)
        - Timestamp (Date.now())
        - Auto-determined severity
        ↓
Step 4: Event stored in history[] (max 200 items)
        ↓
Step 5: Cross-tab sync via BroadcastChannel
        ↓
Step 6: Local listeners dispatched (topic + wildcard)
        ↓
Step 7: React state updates via useEventBus() hook
        ↓
Step 8: UI re-renders (Dashboard, Kafka Dashboard, toasts)
```

### Dynamic Real-Time Simulation

The Kafka Dashboard includes a **"Simulate Traffic"** button that produces random events every 2 seconds:

```typescript
const sampleEvents = [
  { topic: 'transactions', type: 'transfer.completed', payload: { amount: 5000, currency: 'INR' } },
  { topic: 'auth', type: 'user.login', payload: { userId: 'u7', email: 'user@example.com' } },
  { topic: 'system', type: 'sync.completed', payload: { service: 'account-service' } },
  // ... 12 event types total
];

setInterval(() => {
  const event = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
  eventBus.publish(event.topic, event.type, event.payload, {
    severity: event.severity,
    source: event.source,
  });
}, 2000);
```

### Real Events from Banking Operations

When users interact with the actual banking app, **real events** are produced:

| User Action | Event Published |
|------------|----------------|
| Transfer ₹5,000 to beneficiary | `transactions/transfer.created` + `transfer.completed` |
| Deposit ₹10,000 | `transactions/deposit.created` + `deposit.completed` |
| Withdraw ₹2,000 | `transactions/withdrawal.created` + `withdrawal.completed` |
| Log in | `auth/user.login` |
| Register new account | `auth/user.registered` |
| Add beneficiary | `beneficiaries/beneficiary.added` |
| Submit KYC | `kyc/kyc.submitted` |
| Admin verifies KYC | `kyc/kyc.verified` |

### Event Stream Visualization

The **KafkaEventStream** component renders events as a live terminal-style log:

```
14:23:45 | P2 | transfer  | transactions | transfer.completed     🟢
14:23:43 | P0 | auth      | auth         | user.login              🔵
14:23:41 | P1 | account   | accounts     | balance.changed         🔵
14:23:39 | P0 | deposit   | transactions | deposit.completed       🟢
14:23:37 | P2 | kyc       | kyc          | kyc.verified            🟢
```

Each line shows:
- **Timestamp** — HH:MM:SS format
- **Partition** — Deterministic partition assignment (P0, P1, P2)
- **Key** — First segment of the event type (e.g., "transfer" from "transfer.completed")
- **Topic** — Color-coded by topic
- **Event Type** — Color-coded by severity
- **Live Indicator** — Green dot on the latest event

---

## 📂 Topics & Partitions

### Partition Assignment

Partitions are assigned deterministically based on the event ID:

```typescript
const partition = Math.abs(
  event.id.split('_').pop()?.charCodeAt(0) || 0
) % topic.partitions;
```

This ensures that events with the same key consistently go to the same partition (preserving order within a partition, just like real Kafka).

### Partition Visualization

In the Kafka Dashboard, each partition shows:
- **Leader badge** — Current leader replica
- **ISR list** — In-Sync Replica set `[1, 2, 3]`
- **Offset** — Simulated offset counter
- **Throughput bar** — Animated utilization indicator

```
┌──────────────────────────────────────────────┐
│  ┌──┐                                        │
│  │ 0│  Partition 0  ● Leader                 │
│  └──┘  ISR: [1, 2, 3] | Offset: 842         │
│         ████████░░░░░░░░ 65%                 │
│                                              │
│  ┌──┐                                        │
│  │ 1│  Partition 1  ● Leader                 │
│  └──┘  ISR: [1, 2, 3] | Offset: 721         │
│         ██████░░░░░░░░░░ 45%                 │
│                                              │
│  ┌──┐                                        │
│  │ 2│  Partition 2  ● Leader                 │
│  └──┘  ISR: [1, 2, 3] | Offset: 903         │
│         █████████░░░░░░░ 70%                 │
└──────────────────────────────────────────────┘
```

### Topic Configuration

```typescript
const KAFKA_TOPICS = [
  { name: 'transactions', partitions: 3, replicationFactor: 2,
    retentionMs: 604800000,  // 7 days
    messagesPerSec: 12, color: '#3B82F6' },
  { name: 'accounts', partitions: 2, replicationFactor: 2,
    retentionMs: 604800000,  // 7 days
    messagesPerSec: 5, color: '#8B5CF6' },
  // ... 4 more topics
];
```

| Topic | Partitions | Replication | Retention | Messages/sec |
|-------|-----------|-------------|-----------|-------------|
| transactions | 3 | 2 | 7 days | 12 |
| accounts | 2 | 2 | 7 days | 5 |
| auth | 2 | 2 | 3 days | 8 |
| kyc | 1 | 2 | 30 days | 1 |
| beneficiaries | 1 | 2 | 7 days | 2 |
| system | 1 | 1 | 1 day | 3 |

---

## 👥 Consumer Groups

### Configured Consumer Groups

| Group ID | Topic | Members | Lag | Status |
|----------|-------|---------|-----|--------|
| `payment-processor` | transactions | 3 | 0 | 🟢 Active |
| `account-sync` | accounts | 2 | 0 | 🟢 Active |
| `auth-audit` | auth | 1 | 0 | 🟢 Active |
| `kyc-verifier` | kyc | 2 | ⏸️ Idle |
| `beneficiary-cache` | beneficiaries | 1 | 0 | 🟢 Active |

### Consumer Group Properties

Each consumer group in the dashboard displays:
- **Group ID** — Unique identifier
- **Topic** — Which topic it consumes from
- **Members** — Number of active consumers in the group
- **Lag** — Number of unprocessed messages (0 = caught up)
- **Status** — Active (processing), Idle (no activity), or Lagging (falling behind)
- **Last Commit** — When the group last committed offsets

### Rebalancing Visualization

The dashboard includes an animated visualization of **consumer group rebalancing**:

```
When a new consumer joins or an existing one leaves:

  ┌─────────┐    ┌─────────┐    ┌─────────┐
  │Consumer 1│    │Consumer 2│    │Consumer 3│
  │  P0, P1  │    │  P2, P3  │    │  P4, P5  │
  └─────────┘    └─────────┘    └─────────┘
         ↓              ↓              ↓
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │Consumer 1│    │Consumer 2│    │Consumer 3│ ← New member
    │  P0, P1  │    │  P2, P3  │    │  P4, P5  │
    └─────────┘    └─────────┘    └─────────┘
         ↓              ↓
    Kafka reassigns partitions
    (animated with motion.div)
```

---

## 🖥️ Producer Simulator

The interactive **Producer Simulator** in the Kafka Dashboard allows you to publish custom events:

### Interface

```
┌──────────────────────────────────────────────┐
│ 📨 Kafka Producer                             │
│ Publish a custom message to any topic          │
│                                              │
│ ┌──────────────┐ ┌──────────┐ ┌──────────┐  │
│ │ transactions │ │ key: auto│ │ ⚡ Produce│  │
│ └──────────────┘ └──────────┘ └──────────┘  │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ {"amount": 1000, "currency": "INR"}      │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### How It Works

1. **Select Topic** — Choose from all 6 topics via dropdown
2. **Enter Key** — Optional message key (auto-generates from topic)
3. **Enter Payload** — JSON payload (or plain text as fallback)
4. **Click Produce** — Publishes the event to the event bus

```typescript
const handleProduce = (topic: string, key: string, value: string) => {
  try {
    const parsed = JSON.parse(value);
    eventBus.publish(topic, `custom.${key}`, parsed, {
      severity: 'info',
      source: 'kafka-producer-simulator',
    });
  } catch {
    // If not valid JSON, send as plain text message
    eventBus.publish(topic, `custom.${key}`, { message: value }, {
      severity: 'info',
      source: 'kafka-producer-simulator',
    });
  }
};
```

---

## 🌐 Cross-Tab Synchronization

NeoBank's Kafka system synchronizes events across **multiple browser tabs** in real-time.

### Primary Method: BroadcastChannel API

```typescript
this.crossTabChannel = new BroadcastChannel('neobank-event-bus');
this.crossTabChannel.onmessage = (event) => {
  const remoteEvent = event.data as NeoEvent;
  this.dispatchToLocalListeners(remoteEvent);
};
```

### Fallback: localStorage Events

When `BroadcastChannel` is unavailable (older browsers), localStorage `storage` events are used:

```typescript
window.addEventListener('storage', (e) => {
  if (e.key === 'neobank_event_bus' && e.newValue) {
    const remoteEvent = JSON.parse(e.newValue);
    this.dispatchToLocalListeners(remoteEvent);
  }
});
```

### What This Enables

- **Open the same app in two tabs** — both see real-time updates
- **Transfer money in Tab A** — Tab B instantly shows the updated balance
- **Admin verifies KYC** — Customer's tab shows verification toast
- **Dashboard analytics update** — All tabs reflect latest data

---

## 🔔 Toast Notifications

Every event can trigger a toast notification via the `sonner` library:

```typescript
const EVENT_TOAST_MESSAGES = {
  'transfer.completed': { title: 'Transfer Complete', description: 'Funds transferred successfully' },
  'deposit.completed': { title: 'Deposit Complete', description: 'Funds added to your account' },
  'kyc.verified': { title: 'KYC Verified', description: 'Identity verification complete' },
  // ... 15+ event types with toast messages
};
```

Toast severity matches event severity:
- `info` → Default toast
- `success` → Green success toast
- `warning` → Yellow warning toast
- `error` → Red error toast

---

## 🔗 Integration with Banking Operations

The event bus is integrated throughout the banking application. Here's how each service publishes events:

### Transaction Service

```typescript
// After a successful transfer
eventBus.publish('transactions', 'transfer.completed', {
  amount: 5000,
  fromAccountId: 'acc1',
  toAccountNumber: 'xxxx-xxxx-xxxx-xxxx',
  description: 'Rent payment',
}, { severity: 'success', source: 'transaction-service' });
```

### Account Service

```typescript
// After account creation
eventBus.publish('accounts', 'account.created', {
  accountId: 'acc5',
  type: 'savings',
  initialDeposit: 1000,
}, { severity: 'success', source: 'account-service' });

// After balance change
eventBus.publish('accounts', 'balance.changed', {
  accountId: 'acc1',
  oldBalance: 24580.50,
  newBalance: 29580.50,
  delta: 5000,
}, { severity: 'info', source: 'account-service' });
```

### Auth Service

```typescript
// After login
eventBus.publish('auth', 'user.login', {
  userId: 'u1',
  email: 'alice@neobank.com',
}, { severity: 'info', source: 'auth-service' });
```

### KYC Service

```typescript
// After KYC verification by admin
eventBus.publish('kyc', 'kyc.verified', {
  userId: 'u5',
  documentType: 'AADHAR',
}, { severity: 'success', source: 'admin-service' });
```

### Beneficiary Service

```typescript
// After adding a beneficiary
eventBus.publish('beneficiaries', 'beneficiary.added', {
  name: 'Rajesh Kumar',
  bankName: 'SBI',
  accountNumber: 'xxxx-xxxx-xxxx-xxxx',
}, { severity: 'success', source: 'beneficiary-service' });
```

---

## ⚡ How It Works End-to-End

### Complete Flow: User Transfers Money

```
1. User fills transfer form in /transfer page
        ↓
2. Click "Send Money"
        ↓
3. Event published: transfer.created
   eventBus.publish('transactions', 'transfer.created', {...})
        ↓
4. Toast shown: "Transfer Initiated — Your transfer is being processed"
        ↓
5. API processes the transfer (debit sender, credit receiver)
        ↓
6. On success, event published: transfer.completed
   eventBus.publish('transactions', 'transfer.completed', {
     amount: 5000,
     fromAccountId: 'acc1',
     toAccountNumber: 'xxxx-xxxx-xxxx-xxxx',
   })
        ↓
7. Toast shown: "Transfer Complete — Funds transferred successfully"
        ↓
8. Event propagated to all browser tabs via BroadcastChannel
        ↓
9. Dashboard components react:
   - Balance updates via DataRefreshContext
   - Transaction list refreshes
   - Kafka Dashboard shows the event in live stream
        ↓
10. Cross-tab sync: second tab also updates balance and transactions
```

### Complete Flow: Kafka Dashboard Traffic Simulation

```
1. User clicks "Simulate Traffic" on Kafka Dashboard
        ↓
2. setInterval starts, producing a random event every 2 seconds
        ↓
3. Each event is a random selection from 12 sample event types
        ↓
4. Event published to eventBus.publish()
        ↓
5. Dashboard Metrics update:
   - Messages/min counter increases
   - Topic distribution bars animate
   - Live stream shows new events with timestamps
        ↓
6. Animated indicators pulse green ("Live" dot, "Producing" badge)
        ↓
7. User can click "Stop" to pause simulation
        ↓
8. User can click "Clear" to reset all events
```

### Complete Flow: Cross-Tab Synchronization

```
Tab A (Chrome)                    Tab B (Firefox)
─────────────────                 ─────────────────
User transfers ₹5,000
        │
eventBus.publish('transactions',
  'transfer.completed', {...})
        │
        ├──→ Dispatches to local     │
        │    listeners               │
        │                            │
        ├──→ BroadcastChannel        │
        │    .postMessage(event) ────→│ onmessage fires
        │                            │   ↓
        │                            │ dispatchToLocalListeners()
        │                            │   ↓
        │                            │ UI updates: balance ↓,
        │                            │ transaction appears,
        │                            │ toast shown
        │                            │
        │    ← Event also appears in  │
        │    Kafka Dashboard live log │
```

---

## 🧩 Extending the Kafka System

### Adding a New Topic

1. Add the topic to `EVENT_TOPICS` in `eventBus.ts`:
```typescript
export const EVENT_TOPICS = {
  // ... existing topics
  NOTIFICATIONS: 'notifications',
};
```

2. Add topic config in `KafkaDashboard.tsx`:
```typescript
const KAFKA_TOPICS = [
  // ... existing topics
  { name: 'notifications', partitions: 2, ... },
];
```

3. Add event types in `EVENT_TYPES`:
```typescript
export const EVENT_TYPES = {
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_READ: 'notification.read',
};
```

4. Publish events from your service:
```typescript
eventBus.publish('notifications', 'notification.sent', {
  userId: 'u1',
  message: 'Your loan application has been approved!',
}, { severity: 'success', source: 'notification-service' });
```

### Customizing Toast Messages

Add entries to `EVENT_TOAST_MESSAGES`:
```typescript
const EVENT_TOAST_MESSAGES = {
  'notification.sent': {
    title: 'New Notification',
    description: 'You have a new notification'
  },
};
```

### Adding Consumer Groups

Add consumer groups in `KafkaDashboard.tsx`:
```typescript
const CONSUMER_GROUPS = [
  // ... existing groups
  { id: 'notification-push', topic: 'notifications', members: 2, lag: 0, status: 'active', lastCommit: Date.now() },
];
```

---

## 📈 Dashboard Architecture Section

The **Architecture tab** provides an educational overview of 6 Kafka concepts:

| Concept | Description |
|---------|-------------|
| **Producer** | Applications that publish events to Kafka topics. Producers can choose which partition to write to using a key for ordering guarantees. |
| **Topic & Partitions** | Topics are logical channels for related events. Each topic has multiple partitions for parallelism. Messages within a partition have a sequential ID called an offset. |
| **Broker Cluster** | A Kafka cluster consists of multiple brokers (servers). Each broker holds some partitions. The Controller broker manages cluster metadata and leader elections. |
| **Consumer Groups** | Consumers in the same group share the workload — each partition is consumed by exactly one member. This enables horizontal scaling of event processing. |
| **Replication & ISR** | Each partition has a leader and followers (ISR — In-Sync Replicas). If the leader fails, an ISR follower is elected as the new leader for high availability. |
| **Offsets & Retention** | Consumers track their position via offsets. Kafka retains messages for a configurable period (default 7 days), allowing consumers to replay from any offset. |

### Animated Message Flow

The dashboard includes a **"Start Flow"** button that animates a message through all 5 Kafka stages sequentially:

```
[Producer] → [Topic/Partitions] → [Broker] → [Consumer Group] → [Commit Offset]
    1️⃣             2️⃣                3️⃣             4️⃣              5️⃣
```

Each stage lights up in sequence with a pulsing animation and description text.

---

## 📝 Summary

The NeoBank Kafka Event Bus provides a **complete, real-time event streaming platform** entirely in the browser:

| Feature | Implementation |
|---------|---------------|
| **Topic-based pub/sub** | `EventBus` class with topic-specific listeners |
| **30+ event types** | Covering all banking operations |
| **Real-time streaming** | Events displayed within milliseconds |
| **Cross-tab sync** | BroadcastChannel API + localStorage fallback |
| **Toast notifications** | Context-aware, severity-colored toasts |
| **Monitoring dashboard** | 5 tabs covering all Kafka concepts |
| **Producer simulator** | Interactive event publishing tool |
| **Consumer groups** | 5 groups with lag monitoring |
| **Partition visualization** | Per-topic partition details |
| **Architecture education** | Complete Kafka concepts explained |

---

*Built with ❤️ for NeoBank — A modern digital banking platform*
