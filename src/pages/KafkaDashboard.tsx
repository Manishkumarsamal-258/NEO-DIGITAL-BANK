/**
 * ── NeoBank Kafka Dashboard ────────────────────────────────
 * A comprehensive real-time dashboard demonstrating Apache Kafka
 * event streaming architecture. Shows the full Kafka workflow:
 *
 * Producers → Topics (Partitions) → Consumers → Consumer Groups
 *
 * Features:
 * - Cluster overview with broker status
 * - Topic browser with partition visualization
 * - Real-time event stream with producer/consumer animation
 * - Consumer group monitoring
 * - Interactive message publishing
 * - Live throughput metrics
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import {
  Server, Database, Activity, Zap, Cpu, Layers,
  Play, Pause, Trash2, RefreshCw, Clock, ArrowRight,
  Circle, CheckCircle2, XCircle, Loader2, Terminal,
  Sparkles, Network, GitBranch, Radio, Signal,
  BarChart3, TrendingUp, Users, MessageCircle,
  Send, BookOpen, ChevronRight, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { eventBus, type NeoEvent, EVENT_TOPICS } from '@/services/eventBus';
import { formatDistanceToNow } from '@/lib/utils';

// ── Kafka Topic Configuration ────────────────────────────
// Simulates real Kafka topics with partition counts

interface KafkaTopic {
  name: string;
  partitions: number;
  replicationFactor: number;
  retentionMs: number;
  messagesPerSec: number;
  totalMessages: number;
  color: string;
  description: string;
}

interface KafkaBroker {
  id: number;
  host: string;
  port: number;
  status: 'online' | 'offline' | 'syncing';
  role: 'controller' | 'broker';
  partitionsLed: number;
}

interface ConsumerGroup {
  id: string;
  topic: string;
  members: number;
  lag: number;
  status: 'active' | 'idle' | 'lagging';
  lastCommit: number;
}

interface ProducerRecord {
  id: string;
  topic: string;
  partition: number;
  key: string;
  value: string;
  timestamp: number;
  size: number;
  ack: 'acked' | 'pending' | 'failed';
}

const KAFKA_TOPICS: KafkaTopic[] = [
  { name: 'transactions', partitions: 3, replicationFactor: 2, retentionMs: 604800000, messagesPerSec: 12, totalMessages: 0, color: '#3B82F6', description: 'Transfer, deposit & withdrawal events' },
  { name: 'accounts', partitions: 2, replicationFactor: 2, retentionMs: 604800000, messagesPerSec: 5, totalMessages: 0, color: '#8B5CF6', description: 'Account creation, updates & status changes' },
  { name: 'auth', partitions: 2, replicationFactor: 2, retentionMs: 259200000, messagesPerSec: 8, totalMessages: 0, color: '#06B6D4', description: 'Login, logout & registration events' },
  { name: 'kyc', partitions: 1, replicationFactor: 2, retentionMs: 2592000000, messagesPerSec: 1, totalMessages: 0, color: '#10B981', description: 'KYC submission & verification events' },
  { name: 'beneficiaries', partitions: 1, replicationFactor: 2, retentionMs: 604800000, messagesPerSec: 2, totalMessages: 0, color: '#F59E0B', description: 'Beneficiary CRUD operations' },
  { name: 'system', partitions: 1, replicationFactor: 1, retentionMs: 86400000, messagesPerSec: 3, totalMessages: 0, color: '#6B7280', description: 'System health & sync events' },
];

const KAFKA_BROKERS: KafkaBroker[] = [
  { id: 1, host: 'kafka-1.neobank.internal', port: 9092, status: 'online', role: 'controller', partitionsLed: 4 },
  { id: 2, host: 'kafka-2.neobank.internal', port: 9092, status: 'online', role: 'broker', partitionsLed: 3 },
  { id: 3, host: 'kafka-3.neobank.internal', port: 9092, status: 'online', role: 'broker', partitionsLed: 3 },
];

const CONSUMER_GROUPS: ConsumerGroup[] = [
  { id: 'payment-processor', topic: 'transactions', members: 3, lag: 0, status: 'active', lastCommit: Date.now() },
  { id: 'account-sync', topic: 'accounts', members: 2, lag: 0, status: 'active', lastCommit: Date.now() },
  { id: 'auth-audit', topic: 'auth', members: 1, lag: 0, status: 'active', lastCommit: Date.now() },
  { id: 'kyc-verifier', topic: 'kyc', members: 2, lag: 0, status: 'idle', lastCommit: Date.now() },
  { id: 'beneficiary-cache', topic: 'beneficiaries', members: 1, lag: 0, status: 'active', lastCommit: Date.now() },
];

// ── Helper: Simulate Kafka key for event type ─────────────

function getKafkaKey(type: string): string {
  const parts = type.split('.');
  return parts.length > 1 ? parts[0] : type;
}

// ── Topic Color Helper ────────────────────────────────────

function getTopicColor(topic: string): string {
  const colors: Record<string, string> = {
    transactions: 'blue',
    accounts: 'purple',
    auth: 'cyan',
    kyc: 'emerald',
    beneficiaries: 'amber',
    system: 'gray',
  };
  return colors[topic] || 'gray';
}

function getTopicHex(topic: string): string {
  const topicInfo = KAFKA_TOPICS.find(t => t.name === topic);
  return topicInfo?.color || '#6B7280';
}

// ── Broker Status Card ────────────────────────────────────

function BrokerCard({ broker }: { broker: KafkaBroker }) {
  const statusColor = broker.status === 'online' ? 'bg-green-500' : broker.status === 'syncing' ? 'bg-yellow-500' : 'bg-red-500';
  const statusText = broker.status === 'online' ? 'Online' : broker.status === 'syncing' ? 'Syncing' : 'Offline';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-semibold text-sm">Broker {broker.id}</span>
        </div>
        <Badge className={`text-[10px] ${broker.role === 'controller' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
          {broker.role}
        </Badge>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between text-gray-400">
          <span>Host</span>
          <span className="text-gray-300 font-mono">{broker.host}:{broker.port}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Partitions</span>
          <span className="text-gray-300">{broker.partitionsLed}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${statusColor} ${broker.status === 'online' ? 'animate-pulse' : ''}`} />
        <span className="text-xs text-gray-500">{statusText}</span>
      </div>
    </motion.div>
  );
}

// ── Topic Partition Visualizer ────────────────────────────

function TopicPartitions({ topic }: { topic: KafkaTopic }) {
  const partitionColors = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-amber-500 to-orange-500', 'from-emerald-500 to-teal-500'];

  return (
    <div className="space-y-2">
      {Array.from({ length: topic.partitions }, (_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 border border-gray-700/50"
        >
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${partitionColors[i % partitionColors.length]} flex items-center justify-center text-white text-xs font-bold`}>
            {i}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-200">Partition {i}</span>
              <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">Leader</Badge>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-gray-500">ISR: [1, 2, 3]</span>
              <span className="text-[10px] text-gray-600">|</span>
              <span className="text-[10px] text-gray-500">Offset: {Math.floor(Math.random() * 1000)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: topic.color }}
                animate={{ width: ['30%', '70%', '30%'] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Real-time Event Stream ────────────────────────────────

function KafkaEventStream({ events }: { events: NeoEvent[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin font-mono text-xs">
      <div className="sticky top-0 bg-gray-950/90 backdrop-blur-sm px-3 py-2 border-b border-gray-800 flex items-center gap-2 text-gray-500 z-10">
        <Terminal className="w-3 h-3" />
        <span>Kafka Event Log — {events.length} messages</span>
      </div>
      <AnimatePresence mode="popLayout">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <Radio className="w-6 h-6 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Waiting for events...</p>
            <p className="text-xs mt-1 text-gray-700">Interact with the banking app to produce messages</p>
          </div>
        ) : (
          events.slice(0, 50).map((event, i) => {
            const key = getKafkaKey(event.type);
            const partition = Math.abs(event.id.split('_').pop()?.charCodeAt(0) || 0) % (KAFKA_TOPICS.find(t => t.name === event.topic)?.partitions || 3);
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i === 0 ? 0 : Math.min(i * 0.02, 0.3) }}
                className="flex items-start gap-2 px-3 py-1.5 hover:bg-gray-800/50 rounded group"
              >
                <span className="text-gray-600 shrink-0 w-16 font-mono text-[10px]">
                  {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="text-gray-700 shrink-0">|</span>
                <span className="text-gray-500 shrink-0 font-bold w-2">P{partition}</span>
                <span className="text-gray-700 shrink-0">|</span>
                <span className="text-gray-500 shrink-0 w-16 truncate" title={key}>{key}</span>
                <span className="text-gray-700 shrink-0">|</span>
                <span
                  className="shrink-0 font-medium"
                  style={{ color: getTopicHex(event.topic) }}
                >
                  {event.topic}
                </span>
                <span className="text-gray-700 shrink-0">|</span>
                <span className={`truncate ${
                  event.severity === 'error' ? 'text-red-400' :
                  event.severity === 'warning' ? 'text-amber-400' :
                  event.severity === 'success' ? 'text-emerald-400' :
                  'text-gray-300'
                }`}>
                  {event.type}
                </span>
                {i === 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mt-1.5"
                  />
                )}
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
      <div ref={endRef} />
    </div>
  );
}

// ── Kafka Metrics Cards ───────────────────────────────────

function KafkaMetrics({ events }: { events: NeoEvent[] }) {
  const lastMinute = events.filter(e => Date.now() - e.timestamp < 60000);
  const eventsByTopic: Record<string, number> = {};
  events.forEach(e => {
    eventsByTopic[e.topic] = (eventsByTopic[e.topic] || 0) + 1;
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Activity className="w-3.5 h-3.5" />
            Messages/min
          </div>
          <p className="text-2xl font-bold text-white">{lastMinute.length}</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Layers className="w-3.5 h-3.5" />
            Topics
          </div>
          <p className="text-2xl font-bold text-white">{Object.keys(eventsByTopic).length}</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Server className="w-3.5 h-3.5" />
            Brokers
          </div>
          <p className="text-2xl font-bold text-white">{KAFKA_BROKERS.filter(b => b.status === 'online').length}/3</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Users className="w-3.5 h-3.5" />
            Consumer Groups
          </div>
          <p className="text-2xl font-bold text-white">{CONSUMER_GROUPS.length}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Consumer Group Card ───────────────────────────────────

function ConsumerGroupCard({ group }: { group: ConsumerGroup }) {
  const statusColor = group.status === 'active' ? 'bg-emerald-500' : group.status === 'lagging' ? 'bg-amber-500' : 'bg-gray-500';
  const lagColor = group.lag === 0 ? 'text-emerald-400' : group.lag < 10 ? 'text-amber-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-white">{group.id}</span>
        </div>
        <span className={`w-2 h-2 rounded-full ${statusColor} ${group.status === 'active' ? 'animate-pulse' : ''}`} />
      </div>
      <div className="space-y-1 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Topic</span>
          <span className="text-gray-300">{group.topic}</span>
        </div>
        <div className="flex justify-between">
          <span>Members</span>
          <span className="text-gray-300">{group.members}</span>
        </div>
        <div className="flex justify-between">
          <span>Lag</span>
          <span className={lagColor}>{group.lag} messages</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Interactive Producer Simulator ─────────────────────────

function ProducerSimulator({ onProduce }: { onProduce: (topic: string, key: string, value: string) => void }) {
  const [selectedTopic, setSelectedTopic] = useState('transactions');
  const [messageKey, setMessageKey] = useState('');
  const [messageValue, setMessageValue] = useState('');

  const handleProduce = () => {
    if (!messageValue.trim()) return;
    onProduce(selectedTopic, messageKey || getKafkaKey(selectedTopic), messageValue.trim());
    setMessageValue('');
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-400" />
          <CardTitle className="text-white text-sm">Kafka Producer</CardTitle>
        </div>
        <CardDescription className="text-gray-400 text-xs">
          Publish a custom message to any topic
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-gray-400 mb-1 block">Topic</Label>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {KAFKA_TOPICS.map(t => (
                  <SelectItem key={t.name} value={t.name} className="text-gray-200 text-xs">
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-400 mb-1 block">Key</Label>
            <Input
              value={messageKey}
              onChange={e => setMessageKey(e.target.value)}
              placeholder="auto"
              className="bg-gray-800 border-gray-700 text-gray-200 h-8 text-xs"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleProduce}
              disabled={!messageValue.trim()}
              className="w-full h-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              Produce
            </Button>
          </div>
        </div>
        <div>
          <Input
            value={messageValue}
            onChange={e => setMessageValue(e.target.value)}
            placeholder='{"amount": 1000, "currency": "INR", "type": "transfer"}'
            className="bg-gray-800 border-gray-700 text-gray-200 font-mono text-xs h-8"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Kafka Architecture Diagram ────────────────────────────

function KafkaArchitecture() {
  const [flowStep, setFlowStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const startFlow = () => {
    setIsRunning(true);
    setFlowStep(0);
    const timer = setInterval(() => {
      setFlowStep(prev => {
        if (prev >= 4) {
          clearInterval(timer);
          setIsRunning(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const steps = [
    { icon: Send, label: 'Producer', color: 'from-emerald-500 to-teal-500', desc: 'Application publishes a message to a Kafka topic' },
    { icon: Layers, label: 'Topic / Partitions', color: 'from-blue-500 to-cyan-500', desc: 'Message is stored in a partition with an offset' },
    { icon: Server, label: 'Kafka Broker', color: 'from-purple-500 to-pink-500', desc: 'Broker replicates the message across the cluster' },
    { icon: GitBranch, label: 'Consumer Group', color: 'from-amber-500 to-orange-500', desc: 'Consumer pulls the message and processes it' },
    { icon: CheckCircle2, label: 'Commit Offset', color: 'from-green-500 to-emerald-500', desc: 'Consumer commits the offset back to Kafka' },
  ];

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <CardTitle className="text-white text-sm">Kafka Message Flow</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={startFlow}
            disabled={isRunning}
            className="h-7 text-xs bg-gradient-to-r from-cyan-500 to-blue-600"
          >
            {isRunning ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
            {isRunning ? 'Running...' : 'Start Flow'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Connection lines */}
          <div className="absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-emerald-500/50 via-blue-500/50 to-purple-500/50" />

          <div className="grid grid-cols-5 gap-2">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = flowStep > i;
              const isCurrent = flowStep === i + 1;

              return (
                <div key={i} className="flex flex-col items-center text-center relative z-10">
                  <motion.div
                    animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.5, repeat: isCurrent ? Infinity : 0, repeatDelay: 0.5 }}
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-2 ${
                      isActive || isCurrent ? 'shadow-lg shadow-white/10' : 'opacity-40'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className={`text-[10px] font-medium leading-tight ${isActive || isCurrent ? 'text-gray-200' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                  {isCurrent && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-[8px] text-gray-500 leading-tight max-w-[100px]"
                    >
                      {step.desc}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Kafka Architecture Details ────────────────────────────

function KafkaArchitectureSection() {
  const concepts = [
    { icon: MessageCircle, title: 'Producer', desc: 'Applications that publish (write) events to Kafka topics. Producers can choose which partition to write to using a key for ordering guarantees.', color: 'from-emerald-500 to-teal-500' },
    { icon: Layers, title: 'Topic & Partitions', desc: 'Topics are logical channels for related events. Each topic has multiple partitions for parallelism. Messages within a partition have a sequential ID called an offset.', color: 'from-blue-500 to-cyan-500' },
    { icon: Server, title: 'Broker Cluster', desc: 'A Kafka cluster consists of multiple brokers (servers). Each broker holds some partitions. The Controller broker manages cluster metadata and leader elections.', color: 'from-purple-500 to-pink-500' },
    { icon: GitBranch, title: 'Consumer Groups', desc: 'Consumers in the same group share the workload — each partition is consumed by exactly one member. This enables horizontal scaling of event processing.', color: 'from-amber-500 to-orange-500' },
    { icon: Signal, title: 'Replication & ISR', desc: 'Each partition has a leader and followers (ISR — In-Sync Replicas). If the leader fails, an ISR follower is elected as the new leader for high availability.', color: 'from-rose-500 to-pink-500' },
    { icon: TrendingUp, title: 'Offsets & Retention', desc: 'Consumers track their position via offsets. Kafka retains messages for a configurable period (default 7 days), allowing consumers to replay from any offset.', color: 'from-indigo-500 to-violet-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {concepts.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-2">{c.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{c.desc}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Main Kafka Dashboard ──────────────────────────────────

export default function KafkaDashboard() {
  const [events, setEvents] = useState<NeoEvent[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subscribe to event bus
  useEffect(() => {
    const history = eventBus.getHistory();
    setEvents(history);

    const unsubscribe = eventBus.subscribeAll((event: NeoEvent) => {
      setEvents(prev => [event, ...prev].slice(0, 200));
    });
    return unsubscribe;
  }, []);

  // Auto-simulation: produce demo events
  const startSimulation = useCallback(() => {
    if (simulationRef.current) return;
    setIsSimulating(true);

    const sampleEvents = [
      { topic: 'transactions', type: 'transfer.completed', payload: { amount: 5000, currency: 'INR', from: 'ACC-001', to: 'ACC-002' }, severity: 'success' as const, source: 'transaction-service' },
      { topic: 'transactions', type: 'deposit.completed', payload: { amount: 25000, currency: 'INR', account: 'ACC-001' }, severity: 'success' as const, source: 'transaction-service' },
      { topic: 'transactions', type: 'withdrawal.completed', payload: { amount: 2000, currency: 'INR', account: 'ACC-003' }, severity: 'success' as const, source: 'transaction-service' },
      { topic: 'accounts', type: 'account.created', payload: { accountId: 'ACC-005', type: 'savings' }, severity: 'success' as const, source: 'account-service' },
      { topic: 'accounts', type: 'balance.changed', payload: { accountId: 'ACC-001', newBalance: 45000, delta: -5000 }, severity: 'info' as const, source: 'account-service' },
      { topic: 'auth', type: 'user.login', payload: { userId: 'u7', email: 'user@example.com' }, severity: 'info' as const, source: 'auth-service' },
      { topic: 'auth', type: 'user.registered', payload: { userId: 'u8', name: 'New User' }, severity: 'success' as const, source: 'auth-service' },
      { topic: 'kyc', type: 'kyc.submitted', payload: { userId: 'u5', documentType: 'PAN' }, severity: 'info' as const, source: 'kyc-service' },
      { topic: 'kyc', type: 'kyc.verified', payload: { userId: 'u5', documentType: 'AADHAR' }, severity: 'success' as const, source: 'admin-service' },
      { topic: 'beneficiaries', type: 'beneficiary.added', payload: { name: 'Rajesh Kumar', bankName: 'SBI' }, severity: 'success' as const, source: 'beneficiary-service' },
      { topic: 'system', type: 'service.status', payload: { service: 'kafka-broker-1', status: 'healthy' }, severity: 'info' as const, source: 'monitoring' },
      { topic: 'system', type: 'sync.completed', payload: { service: 'account-service', syncTime: '150ms' }, severity: 'success' as const, source: 'orchestrator' },
    ];

    simulationRef.current = setInterval(() => {
      const event = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      eventBus.publish(event.topic, event.type, event.payload, {
        severity: event.severity,
        source: event.source,
      });
    }, 2000);
  }, []);

  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
    setIsSimulating(false);
  }, []);

  useEffect(() => {
    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, []);

  const handleProduce = (topic: string, key: string, value: string) => {
    try {
      const parsed = JSON.parse(value);
      eventBus.publish(topic, `custom.${key}`, parsed, {
        severity: 'info',
        source: 'kafka-producer-simulator',
      });
    } catch {
      eventBus.publish(topic, `custom.${key}`, { message: value }, {
        severity: 'info',
        source: 'kafka-producer-simulator',
      });
    }
  };

  const handleClear = () => {
    eventBus.clearHistory();
    setEvents([]);
  };

  // Compute topic message counts for preview
  const topicCounts: Record<string, number> = {};
  events.forEach(e => {
    topicCounts[e.topic] = (topicCounts[e.topic] || 0) + 1;
  });

  return (
    <AppLayout title="Kafka Dashboard" subtitle="Real-time Event Streaming & Message Broker">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Apache Kafka™ Event Bus</h2>
              <p className="text-xs text-gray-400">
                Distributed event streaming platform — {events.length} messages processed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isSimulating ? (
              <Button
                size="sm"
                onClick={startSimulation}
                className="h-8 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500"
              >
                <Play className="w-3 h-3 mr-1" />
                Simulate Traffic
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={stopSimulation}
                variant="outline"
                className="h-8 text-xs border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <Pause className="w-3 h-3 mr-1" />
                Stop ({events.length} msgs)
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              className="h-8 text-xs text-gray-500 hover:text-gray-300"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <KafkaMetrics events={events} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
              <Server className="w-4 h-4 mr-2" />
              Cluster Overview
            </TabsTrigger>
            <TabsTrigger value="stream" className="data-[state=active]:bg-gray-700">
              <Activity className="w-4 h-4 mr-2" />
              Live Stream
            </TabsTrigger>
            <TabsTrigger value="topics" className="data-[state=active]:bg-gray-700">
              <Layers className="w-4 h-4 mr-2" />
              Topics & Partitions
            </TabsTrigger>
            <TabsTrigger value="consumers" className="data-[state=active]:bg-gray-700">
              <Users className="w-4 h-4 mr-2" />
              Consumer Groups
            </TabsTrigger>
            <TabsTrigger value="architecture" className="data-[state=active]:bg-gray-700">
              <BookOpen className="w-4 h-4 mr-2" />
              Architecture
            </TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ── */}
          <TabsContent value="overview" className="space-y-6">
            {/* Brokers */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                Kafka Cluster — 3 Brokers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {KAFKA_BROKERS.map(broker => (
                  <BrokerCard key={broker.id} broker={broker} />
                ))}
              </div>
            </div>

            {/* Kafka Message Flow */}
            <KafkaArchitecture />

            {/* Producer Simulator */}
            <ProducerSimulator onProduce={handleProduce} />

            {/* Latest Events Preview */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <CardTitle className="text-white text-sm">Latest Events</CardTitle>
                  </div>
                  {isSimulating && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                      />
                      Live
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <KafkaEventStream events={events} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Live Stream Tab ── */}
          <TabsContent value="stream" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Event Stream */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <CardTitle className="text-white text-sm">Kafka Event Log</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSimulating && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                            <Signal className="w-3 h-3 mr-1 animate-pulse" />
                            Producing
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <KafkaEventStream events={events} />
                  </CardContent>
                </Card>
              </div>

              {/* Topic Distribution */}
              <div>
                <Card className="bg-gray-900/50 border-gray-800 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      Topic Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {KAFKA_TOPICS.map(topic => {
                        const count = topicCounts[topic.name] || 0;
                        const maxCount = Math.max(...Object.values(topicCounts), 1);
                        const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;

                        return (
                          <div key={topic.name}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: topic.color }} />
                                <span className="text-gray-300 capitalize">{topic.name}</span>
                              </div>
                              <span className="text-gray-500">{count} msgs</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: topic.color, width: `${pct}%` }}
                                layout
                                transition={{ type: 'spring', stiffness: 100 }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6">
                      <ProducerSimulator onProduce={handleProduce} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── Topics & Partitions Tab ── */}
          <TabsContent value="topics" className="space-y-4">
            <p className="text-sm text-gray-400">
              Each topic has multiple partitions for parallel processing. Messages within a partition
              are ordered and assigned a sequential offset.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {KAFKA_TOPICS.map(topic => (
                <motion.div
                  key={topic.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${topic.color}20` }}>
                        <Layers className="w-5 h-5" style={{ color: topic.color }} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm capitalize">{topic.name}</h3>
                        <p className="text-[10px] text-gray-500">{topic.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">{topicCounts[topic.name] || 0}</p>
                      <p className="text-[10px] text-gray-500">messages</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4 text-[10px] text-gray-500">
                    <span>{topic.partitions} partitions</span>
                    <span>·</span>
                    <span>RF: {topic.replicationFactor}</span>
                    <span>·</span>
                    <span>Retention: {(topic.retentionMs / 86400000).toFixed(0)}d</span>
                  </div>

                  <TopicPartitions topic={topic} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ── Consumer Groups Tab ── */}
          <TabsContent value="consumers" className="space-y-4">
            <p className="text-sm text-gray-400">
              Consumer groups enable horizontal scaling of event processing. Each partition is consumed
              by exactly one member within a group.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CONSUMER_GROUPS.map(group => (
                <ConsumerGroupCard key={group.id} group={group} />
              ))}
            </div>

            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  Consumer Group Rebalancing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-700 rounded-xl">
                  <div className="text-center">
                    <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Consumer Group Auto-Rebalancing</p>
                    <p className="text-xs text-gray-600 mt-1">
                      When a consumer joins or leaves, Kafka rebalances partitions across the group
                    </p>
                    <div className="flex items-center gap-4 mt-4 justify-center">
                      {['Consumer 1', 'Consumer 2', 'Consumer 3'].map((c, i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center flex-col"
                        >
                          <Users className="w-4 h-4 text-cyan-400 mb-1" />
                          <span className="text-[8px] text-gray-300">{c}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Architecture Tab ── */}
          <TabsContent value="architecture">
            <KafkaArchitectureSection />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
