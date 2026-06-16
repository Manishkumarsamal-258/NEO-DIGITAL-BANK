/**
 * ── NeoBank Event Stream Viewer ─────────────────────────────
 * Displays real-time Kafka-style events in a beautiful stream.
 * Shows events from all topics with live updates, severity
 * indicators, and detailed event information.
 *
 * Features:
 * - Live event stream with animations
 * - Topic and type filtering
 * - Severity-based color coding
 * - Event details with payload viewer
 * - Clear history capability
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Server, Database, Shield, Zap, Clock,
  X, Filter, ChevronDown, ChevronUp, Info, AlertTriangle,
  CheckCircle2, XCircle, Trash2, RefreshCw, ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { eventBus, type NeoEvent, EVENT_TOPICS } from '@/services/eventBus';
import { formatDistanceToNow } from '@/lib/utils';

// ── Event Icon ─────────────────────────────────────────────

function EventIcon({ event }: { event: NeoEvent }) {
  const iconClass = 'w-4 h-4';
  switch (event.topic) {
    case EVENT_TOPICS.TRANSACTIONS:
      return <Zap className={`${iconClass} text-blue-400`} />;
    case EVENT_TOPICS.ACCOUNTS:
      return <Database className={`${iconClass} text-purple-400`} />;
    case EVENT_TOPICS.AUTH:
      return <Shield className={`${iconClass} text-cyan-400`} />;
    case EVENT_TOPICS.KYC:
      return <Shield className={`${iconClass} text-emerald-400`} />;
    case EVENT_TOPICS.SYSTEM:
      return <Server className={`${iconClass} text-amber-400`} />;
    case EVENT_TOPICS.BENEFICIARIES:
      return <Activity className={`${iconClass} text-pink-400`} />;
    default:
      return <Activity className={`${iconClass} text-gray-400`} />;
  }
}

// ── Severity Badge ─────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const variantMap: Record<string, { color: string; label: string }> = {
    success: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', label: 'Success' },
    info: { color: 'bg-blue-500/10 text-blue-600 border-blue-200', label: 'Info' },
    warning: { color: 'bg-amber-500/10 text-amber-600 border-amber-200', label: 'Warning' },
    error: { color: 'bg-red-500/10 text-red-600 border-red-200', label: 'Error' },
  };
  const v = variantMap[severity] || variantMap.info;

  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${v.color}`}>
      {v.label}
    </span>
  );
}

// ── Topic Badge ────────────────────────────────────────────

function TopicBadge({ topic }: { topic: string }) {
  const colors: Record<string, string> = {
    [EVENT_TOPICS.TRANSACTIONS]: 'bg-blue-500/10 text-blue-600',
    [EVENT_TOPICS.ACCOUNTS]: 'bg-purple-500/10 text-purple-600',
    [EVENT_TOPICS.AUTH]: 'bg-cyan-500/10 text-cyan-600',
    [EVENT_TOPICS.KYC]: 'bg-emerald-500/10 text-emerald-600',
    [EVENT_TOPICS.SYSTEM]: 'bg-amber-500/10 text-amber-600',
    [EVENT_TOPICS.BENEFICIARIES]: 'bg-pink-500/10 text-pink-600',
    [EVENT_TOPICS.USERS]: 'bg-indigo-500/10 text-indigo-600',
  };
  const color = colors[topic] || 'bg-gray-500/10 text-gray-600';

  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${color}`}>
      {topic}
    </span>
  );
}

// ── Event Card ─────────────────────────────────────────────

function EventCard({ event, isLatest }: { event: NeoEvent; isLatest: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={isLatest ? { opacity: 0, x: -20, scale: 0.98 } : { opacity: 1 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`p-3 rounded-xl border transition-all cursor-pointer ${
        isLatest
          ? 'border-primary/30 bg-primary/5 shadow-sm shadow-primary/5'
          : 'border-border hover:border-border/80 hover:bg-muted/30'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        {/* Severity indicator */}
        <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
          event.severity === 'error' ? 'bg-red-500' :
          event.severity === 'warning' ? 'bg-amber-500' :
          event.severity === 'success' ? 'bg-emerald-500' :
          'bg-blue-500'
        } ${isLatest ? 'animate-pulse' : ''}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <TopicBadge topic={event.topic} />
            <span className="text-xs font-mono text-muted-foreground truncate">
              {event.type}
            </span>
            <SeverityBadge severity={event.severity} />
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(event.timestamp)} ago</span>
            <span className="text-muted-foreground/50">|</span>
            <span className="text-muted-foreground/70">from: {event.source}</span>
          </div>

          {/* Expanded payload */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden"
              >
                <div className="bg-muted/50 rounded-lg p-2.5">
                  <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <EventIcon event={event} />
          <Button variant="ghost" size="icon" className="w-6 h-6">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Filter Bar ──────────────────────────────────────────────

function FilterBar({
  activeTopic,
  onTopicChange,
  onClear,
}: {
  activeTopic: string | null;
  onTopicChange: (topic: string | null) => void;
  onClear: () => void;
}) {
  const topics = Object.values(EVENT_TOPICS);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter className="w-3.5 h-3.5 text-muted-foreground" />
      <button
        onClick={() => onTopicChange(null)}
        className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
          !activeTopic
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:text-foreground'
        }`}
      >
        All
      </button>
      {topics.map(topic => (
        <button
          key={topic}
          onClick={() => onTopicChange(topic === activeTopic ? null : topic)}
          className={`text-xs px-2.5 py-1 rounded-full capitalize transition-colors ${
            activeTopic === topic
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          {topic}
        </button>
      ))}
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        <Trash2 className="w-3 h-3 mr-1" />
        Clear
      </Button>
    </div>
  );
}

// ── Stats Card ──────────────────────────────────────────────

function EventStats({ stats }: { stats: { totalEvents: number; topics: Record<string, number> } }) {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Activity className="w-3 h-3" />
        Total: <strong>{stats.totalEvents}</strong>
      </span>
      {Object.entries(stats.topics).map(([topic, count]) => (
        <span key={topic} className="hidden md:flex items-center gap-1">
          <span className="capitalize">{topic}</span>: <strong>{count}</strong>
        </span>
      ))}
    </div>
  );
}

// ── Main Event Viewer ──────────────────────────────────────

interface EventViewerProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function EventViewer({ collapsed, onToggleCollapse }: EventViewerProps) {
  const [events, setEvents] = useState<NeoEvent[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [latestEventId, setLatestEventId] = useState<string | null>(null);
  const latestTimeRef = useRef(0);

  // Subscribe to all events
  useEffect(() => {
    const unsubscribe = eventBus.subscribeAll((event: NeoEvent) => {
      setEvents(prev => [event, ...prev].slice(0, 100));
      setLatestEventId(event.id);
      latestTimeRef.current = event.timestamp;
    });

    // Load existing history
    setEvents(eventBus.getHistory());

    return unsubscribe;
  }, []);

  const filteredEvents = activeTopic
    ? events.filter(e => e.topic === activeTopic)
    : events;

  const stats = eventBus.getStats();

  const handleClear = () => {
    eventBus.clearHistory();
    setEvents([]);
    setLatestEventId(null);
  };

  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground 
                   px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <Activity className="w-3.5 h-3.5" />
        <span>Events ({events.length})</span>
        {events[0] && (
          <span className={`w-1.5 h-1.5 rounded-full ${
            events[0].severity === 'error' ? 'bg-red-500 animate-pulse' :
            events[0].severity === 'success' ? 'bg-emerald-500' :
            'bg-blue-500'
          }`} />
        )}
      </button>
    );
  }

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-sm font-bold">Event Stream</CardTitle>
              <p className="text-[11px] text-muted-foreground">Kafka-style event bus · Real-time updates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7"
              onClick={onToggleCollapse}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <EventStats stats={stats} />
      </CardHeader>
      <CardContent>
        <FilterBar
          activeTopic={activeTopic}
          onTopicChange={setActiveTopic}
          onClear={handleClear}
        />

        <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No events yet</p>
                <p className="text-xs mt-1">Events will appear here as you use the application</p>
              </motion.div>
            ) : (
              filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  isLatest={event.id === latestEventId}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Live Event Badge (for header) ──────────────────────────

export function LiveEventBadge() {
  const [latestEvent, setLatestEvent] = useState<NeoEvent | null>(null);

  useEffect(() => {
    const unsubscribe = eventBus.subscribeAll((event: NeoEvent) => {
      setLatestEvent(event);
      // Auto-clear after 5 seconds
      setTimeout(() => setLatestEvent(prev => prev?.id === event.id ? null : prev), 5000);
    });
    return unsubscribe;
  }, []);

  if (!latestEvent) return null;

  const severityColor =
    latestEvent.severity === 'error' ? 'bg-red-500' :
    latestEvent.severity === 'warning' ? 'bg-amber-500' :
    latestEvent.severity === 'success' ? 'bg-emerald-500' :
    'bg-blue-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${severityColor} animate-pulse`} />
      <span className="truncate max-w-[120px]">{latestEvent.type}</span>
    </motion.div>
  );
}
