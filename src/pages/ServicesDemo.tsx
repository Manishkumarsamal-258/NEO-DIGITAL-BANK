import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Server, Key, Building2, ArrowRightLeft, CheckCircle2, XCircle, Loader2, Shield, Database, Globe, Activity, Terminal, Code2, Users, BookOpen, Sparkles, Cpu, Zap, RefreshCw, Play, Link2, ChevronDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

interface ServiceStatus {
  name: string;
  port: number;
  status: 'online' | 'offline' | 'checking';
  database: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const services: ServiceStatus[] = [
  {
    name: 'Auth Service',
    port: 8081,
    status: 'checking',
    database: 'neobank_auth',
    description: 'Handles user registration, login, JWT token management, and user profile operations',
    icon: <Shield className="w-6 h-6" />,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    name: 'Account Service',
    port: 8083,
    status: 'checking',
    database: 'neobank_accounts',
    description: 'Manages bank accounts, beneficiaries, teller operations, and account status',
    icon: <Building2 className="w-6 h-6" />,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    name: 'Transaction Service',
    port: 8084,
    status: 'checking',
    database: 'neobank_transactions',
    description: 'Processes transfers, tracks transaction history, and manages financial operations',
    icon: <ArrowRightLeft className="w-6 h-6" />,
    color: 'from-violet-500 to-purple-600'
  }
];

const api = axios.create({ baseURL: '/api', timeout: 5000 });

function ArchitectureFlow() {
  const [activeFlow, setActiveFlow] = useState<'request' | 'gateway' | 'service' | 'database' | null>(null);
  const [flowStep, setFlowStep] = useState(0);

  useEffect(() => {
    if (activeFlow) {
      const timer = setInterval(() => {
        setFlowStep((prev) => {
          if (prev >= 3) {
            setActiveFlow(null);
            return 0;
          }
          return prev + 1;
        });
      }, 1200);
      return () => clearInterval(timer);
    }
  }, [activeFlow]);

  const steps = [
    { label: 'Client Request', icon: <Globe className="w-4 h-4" />, description: 'Frontend sends HTTP request to Gateway' },
    { label: 'API Gateway', icon: <Server className="w-4 h-4" />, description: 'Gateway validates JWT & routes to service' },
    { label: 'Microservice', icon: <Cpu className="w-4 h-4" />, description: 'Service processes business logic' },
    { label: 'Database', icon: <Database className="w-4 h-4" />, description: 'Data persisted in dedicated DB' }
  ];

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Architecture Request Flow
        </CardTitle>
        <CardDescription className="text-gray-400">
          Click any step to see how a request flows through the microservices architecture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2 relative">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setActiveFlow(step.label as any); setFlowStep(0); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all cursor-pointer relative z-10 ${
                  activeFlow === step.label 
                    ? 'bg-white/15 ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`p-2 rounded-full ${activeFlow === step.label ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500'}`}>
                  {step.icon}
                </div>
                <span className="text-xs font-medium text-gray-300">{step.label}</span>
              </motion.button>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-gray-700 relative">
                  <motion.div
                    animate={activeFlow && flowStep > i ? { width: '100%' } : { width: '0%' }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {activeFlow && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 bg-black/40 rounded-lg border border-gray-700"
            >
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm mb-2">
                <Terminal className="w-4 h-4" />
                <span>$ Request Flow Simulation</span>
              </div>
              {steps.slice(0, flowStep + 1).map((s, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="flex items-center gap-3 py-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-gray-300 text-sm">
                    <span className="text-green-400 font-mono">→</span> {s.description}
                  </span>
                </motion.div>
              ))}
              {flowStep < 3 && (
                <div className="flex items-center gap-2 mt-2 text-gray-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs font-mono">Processing next step...</span>
                </div>
              )}
              {flowStep >= 3 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2 flex items-center gap-2 text-green-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Request complete! Response returned to client.</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function ServiceDemo({ service }: { service: ServiceStatus }) {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [apiResult, setApiResult] = useState<any>(null);

  const demos: Record<string, { label: string; action: () => Promise<void> }[]> = {
    'Auth Service': [
      {
        label: 'Test Login Endpoint',
        action: async () => {
          setOutput(prev => [...prev, 'POST /api/auth/login → auth-service:8081']);
          const res = await api.post('/auth/login', { email: 'bob@neobank.com', password: 'password123' });
          setApiResult(res.data);
          setOutput(prev => [...prev, `✅ Login successful - Token: ${res.data?.data?.token?.substring(0, 30)}...`]);
        }
      },
      {
        label: 'Test Register Endpoint',
        action: async () => {
          const id = Math.random().toString(36).substring(7);
          setOutput(prev => [...prev, 'POST /api/auth/register → auth-service:8081']);
          const res = await api.post('/auth/register', { name: `Demo User ${id}`, email: `demo${id}@test.com`, password: 'Demo@123' });
          setApiResult(res.data);
          setOutput(prev => [...prev, `✅ Registered - ${res.data?.data?.name || 'User created'}`]);
        }
      },
      {
        label: 'Test Get Profile',
        action: async () => {
          setOutput(prev => [...prev, 'GET /api/users/me → auth-service:8081']);
          const loginRes = await api.post('/auth/login', { email: 'bob@neobank.com', password: 'password123' });
          const token = loginRes.data?.data?.token;
          if (token) {
            localStorage.setItem('neobank_token', token);
            const res = await api.get('/users/me');
            setApiResult(res.data);
            setOutput(prev => [...prev, `✅ Profile: ${res.data?.data?.name || 'Fetched'}`]);
          }
        }
      }
    ],
    'Account Service': [
      {
        label: 'Get My Accounts',
        action: async () => {
          setOutput(prev => [...prev, 'GET /api/accounts → account-service:8083']);
          const res = await api.get('/accounts');
          setApiResult(res.data);
          setOutput(prev => [...prev, `✅ Found ${res.data?.data?.length || 0} accounts`]);
        }
      },
      {
        label: 'Get Beneficiaries',
        action: async () => {
          setOutput(prev => [...prev, 'GET /api/beneficiaries → account-service:8083']);
          const res = await api.get('/beneficiaries');
          setApiResult(res.data);
          setOutput(prev => [...prev, `✅ Found ${res.data?.data?.length || 0} beneficiaries`]);
        }
      }
    ],
    'Transaction Service': [
      {
        label: 'Get Transactions',
        action: async () => {
          setOutput(prev => [...prev, 'GET /api/transactions → transaction-service:8084']);
          const res = await api.get('/transactions');
          setApiResult(res.data);
          setOutput(prev => [...prev, `✅ Found ${res.data?.data?.length || 0} transactions`]);
        }
      }
    ]
  };

  const runAllDemos = async () => {
    setIsRunning(true);
    setOutput([]);
    setApiResult(null);
    const serviceDemos = demos[service.name];
    for (const demo of serviceDemos) {
      try {
        await demo.action();
      } catch (err: any) {
        setOutput(prev => [...prev, `❌ Error: ${err?.message || 'Request failed'}`]);
      }
    }
    setIsRunning(false);
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${service.color} text-white`}>
              {service.icon}
            </div>
            <div>
              <CardTitle className="text-white text-lg">{service.name}</CardTitle>
              <CardDescription className="text-gray-400">Port {service.port}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-mono bg-gray-800 text-gray-300 border-gray-600">
            <Database className="w-3 h-3 mr-1 inline" />
            {service.database}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-400 leading-relaxed">{service.description}</p>
        
        <div className="flex flex-wrap gap-2">
          {demos[service.name].map((demo, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              disabled={isRunning}
              onClick={async () => {
                setIsRunning(true);
                setOutput(prev => [...prev, `▶ Running: ${demo.label}`]);
                try {
                  await demo.action();
                } catch (err: any) {
                  setOutput(prev => [...prev, `❌ Error: ${err?.message || 'Request failed'}`]);
                }
                setIsRunning(false);
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Code2 className="w-3 h-3 mr-1" />
              {demo.label}
            </Button>
          ))}
          <Button
            size="sm"
            disabled={isRunning}
            onClick={runAllDemos}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
          >
            {isRunning ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Running...</>
            ) : (
              <><Zap className="w-3 h-3 mr-1" /> Run All Tests</>
            )}
          </Button>
        </div>

        {output.length > 0 && (
          <div className="bg-black/60 rounded-lg p-3 font-mono text-xs space-y-1 max-h-48 overflow-y-auto border border-gray-700">
            {output.map((line, i) => (
              <div key={i} className={`${line.startsWith('✅') ? 'text-green-400' : line.startsWith('❌') ? 'text-red-400' : line.startsWith('▶') ? 'text-cyan-400' : 'text-gray-500'}`}>
                <span className="text-gray-600 mr-2">$</span>{line}
              </div>
            ))}
          </div>
        )}

        {apiResult && (
          <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
              <Terminal className="w-3 h-3" />
              API Response
            </div>
            <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(apiResult, null, 2).substring(0, 1000)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ArchitectureInfo() {
  const services_data = [
    {
      title: 'API Gateway',
      icon: <Server className="w-5 h-5" />,
      color: 'from-sky-500 to-cyan-500',
      items: [
        'Single entry point on port 8080',
        'JWT validation on every request',
        'Routes to correct microservice',
        'Forwards user context via headers',
        'Handles CORS and rate limiting'
      ]
    },
    {
      title: 'Auth Service',
      icon: <Shield className="w-5 h-5" />,
      color: 'from-blue-500 to-indigo-500',
      items: [
        'User registration & login',
        'JWT token generation & validation',
        'User profile management',
        'Role-based access control',
        'Separate neobank_auth database'
      ]
    },
    {
      title: 'Account Service',
      icon: <Building2 className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-500',
      items: [
        'Account creation & management',
        'Beneficiary management',
        'Teller operations',
        'Account status control',
        'Separate neobank_accounts database'
      ]
    },
    {
      title: 'Transaction Service',
      icon: <ArrowRightLeft className="w-5 h-5" />,
      color: 'from-violet-500 to-purple-500',
      items: [
        'Money transfer processing',
        'Transaction history',
        'Transaction status tracking',
        'Financial record keeping',
        'Separate neobank_transactions database'
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services_data.map((svc, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${svc.color} text-white`}>
              {svc.icon}
            </div>
            <h3 className="text-white font-semibold">{svc.title}</h3>
          </div>
          <ul className="space-y-2">
            {svc.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}


function CrossServiceFlow({ services }: { services: ServiceStatus[] }) {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [output, setOutput] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);

  const steps = [
    {
      title: "Auth Service",
      subtitle: "Authenticate & Get Token",
      icon: "Shield",
      color: "from-purple-500 to-pink-500",
      endpoint: "POST /api/auth/login",
      description: "Logs in with demo credentials and receives a JWT token used to authorize all subsequent requests."
    },
    {
      title: "Account Service",
      subtitle: "Fetch Account Details",
      icon: "Building2",
      color: "from-blue-500 to-cyan-500",
      endpoint: "GET /api/accounts",
      description: "Uses the JWT token from Auth Service to retrieve the user's bank accounts."
    },
    {
      title: "Transaction Service",
      subtitle: "View Transaction History",
      icon: "ArrowLeftRight",
      color: "from-emerald-500 to-teal-500",
      endpoint: "GET /api/transactions",
      description: "Uses the JWT token to fetch the user's transaction history, completing the end-to-end flow."
    }
  ];

  const runCrossServiceFlow = async () => {
    setRunning(true);
    setOutput([]);
    setResults([]);
    setStep(0);
    setToken(null);

    const log = (msg: string) => setOutput(prev => [...prev, msg]);

    try {
      // Step 1: Auth - Login
      log("▶ Step 1: Authenticating via Auth Service...");
      setStep(1);
      await new Promise(r => setTimeout(r, 800));
      const loginRes = await axios.post("/api/auth/login", {
        email: "bob@neobank.com",
        password: "password123"
      }, { timeout: 5000 });
      const jwt = loginRes.data.data?.token || loginRes.data.token;
      setToken(jwt);
      log("✅ Auth Service: Login successful! JWT token acquired.");
      log(`📦 Response: ${JSON.stringify(loginRes.data, null, 2).slice(0, 200)}...`);
      setResults(prev => [...prev, "✅ Auth Service - Login: SUCCESS"]);

      // Step 2: Account - Get Accounts
      log("");
      log("▶ Step 2: Fetching accounts from Account Service...");
      setStep(2);
      await new Promise(r => setTimeout(r, 800));
      const accountsRes = await axios.get("/api/accounts", {
        headers: { Authorization: `Bearer ${jwt}` },
        timeout: 5000
      });
      log("✅ Account Service: Accounts fetched successfully!");
      log(`📦 Response: ${JSON.stringify(accountsRes.data, null, 2).slice(0, 200)}...`);
      setResults(prev => [...prev, "✅ Account Service - Get Accounts: SUCCESS"]);

      // Step 3: Transaction - Get Transactions
      log("");
      log("▶ Step 3: Fetching transactions from Transaction Service...");
      setStep(3);
      await new Promise(r => setTimeout(r, 800));
      const txRes = await axios.get("/api/transactions", {
        headers: { Authorization: `Bearer ${jwt}` },
        timeout: 5000
      });
      log("✅ Transaction Service: Transactions fetched successfully!");
      log(`📦 Response: ${JSON.stringify(txRes.data, null, 2).slice(0, 200)}...`);
      setResults(prev => [...prev, "✅ Transaction Service - Get Transactions: SUCCESS"]);

      log("");
      log("🎉 Cross-Service Flow Complete! All 3 services integrated successfully.");
    } catch (err: any) {
      log(`❌ Error: ${err.response?.data?.message || err.message}`);
      setResults(prev => [...prev, `❌ FAILED at step ${step + 1}`]);
    } finally {
      setRunning(false);
    }
  };

  const icons: Record<string, any> = {
    Shield: Shield,
    Building2: Building2,
    ArrowLeftRight: ArrowLeftRight
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-400 text-sm">
        This demo runs an end-to-end flow that links all 3 microservices together. 
        Each step depends on the previous one, showing how the services integrate:
      </p>

      {/* Flow Steps */}
      <div className="grid gap-4">
        {steps.map((s, i) => {
          const Icon = icons[s.icon];
          const isActive = step === i + 1 && running;
          const isDone = (step > i + 1) || (results.length > i && results[i].includes("SUCCESS"));
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`relative p-4 rounded-xl border ${
                isActive
                  ? "border-blue-500/50 bg-blue-500/10"
                  : isDone
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-gray-700/50 bg-gray-800/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}>
                  {Icon && <Icon className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white text-sm">{s.title}</h4>
                    {isActive && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                    {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-gray-400">{s.subtitle}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <code className="text-blue-400">{s.endpoint}</code>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{s.description}</p>
                </div>
                {/* Arrow connector */}
                {i < steps.length - 1 && (
                  <div className="absolute -bottom-3 left-5">
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Run Button */}
      <Button
        onClick={runCrossServiceFlow}
        disabled={running}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
      >
        {running ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running End-to-End Flow...</>
        ) : (
          <><Play className="w-4 h-4 mr-2" /> Run Cross-Service Integration Flow</>
        )}
      </Button>

      {/* Terminal Output */}
      {output.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl bg-gray-950 border border-gray-800 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800">
            <Terminal className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Cross-Service Integration Logs</span>
          </div>
          <div className="p-4 font-mono text-xs space-y-1 max-h-60 overflow-y-auto">
            {output.map((line, i) => (
              <div key={i} className={`${
                line.startsWith("✅") ? "text-emerald-400" :
                line.startsWith("❌") ? "text-red-400" :
                line.startsWith("▶") ? "text-blue-400" :
                line.startsWith("🎉") ? "text-yellow-400" :
                line.startsWith("📦") ? "text-gray-400" :
                "text-gray-500"
              }`}>
                {line}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results Summary */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-gray-800/50 border border-gray-700 p-4"
        >
          <h4 className="text-sm font-semibold text-white mb-3">Integration Results</h4>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm ${
                r.includes("SUCCESS") ? "text-emerald-400" : "text-red-400"
              }`}>
                {r.includes("SUCCESS") ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {r}
              </div>
            ))}
          </div>
          {results.every(r => r.includes("SUCCESS")) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30"
            >
              <p className="text-sm text-purple-300 text-center">
                🎉 All 3 services integrated successfully! The flow demonstrates how
                Auth Service → Account Service → Transaction Service work together.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function ServicesDemo() {
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>(services);
  const [activeTab, setActiveTab] = useState('live-demo');

  useEffect(() => {
    const checkServices = async () => {
      const updated = await Promise.all(
        serviceStatuses.map(async (svc) => {
          try {
            const res = await fetch(`http://localhost:${svc.port}/actuator/health`, { signal: AbortSignal.timeout(3000) });
            return { ...svc, status: res.ok ? 'online' as const : 'offline' as const };
          } catch {
            return { ...svc, status: 'offline' as const };
          }
        })
      );
      setServiceStatuses(updated);
    };
    checkServices();
    const interval = setInterval(checkServices, 15000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = serviceStatuses.filter(s => s.status === 'online').length;

  return (
    <AppLayout title="Services Demo" subtitle="Interactive Microservices Overview">
      <div className="space-y-6">
        {/* Service Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {serviceStatuses.map((svc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-xl p-5 bg-gradient-to-br ${svc.color} shadow-lg`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-lg text-white">
                    {svc.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      svc.status === 'online' ? 'bg-green-400 animate-pulse' :
                      svc.status === 'checking' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
                    }`} />
                    <span className="text-xs text-white/80 font-medium uppercase">
                      {svc.status}
                    </span>
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{svc.name}</h3>
                <p className="text-white/70 text-xs mb-3">Port {svc.port} · {svc.database}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${
                      svc.status === 'online' ? 'w-full bg-green-400' :
                      svc.status === 'checking' ? 'w-1/2 bg-yellow-400' : 'w-0 bg-red-400'
                    }`} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="live-demo" className="data-[state=active]:bg-gray-700">
              <Zap className="w-4 h-4 mr-2" />
              Live Demo ({onlineCount}/3 Online)
            </TabsTrigger>
            <TabsTrigger value="integration" className="data-[state=active]:bg-gray-700">
              <Link2 className="w-4 h-4 mr-2" />
              Integration
            </TabsTrigger>
            <TabsTrigger value="architecture" className="data-[state=active]:bg-gray-700">
              <Building2 className="w-4 h-4 mr-2" />
              Architecture
            </TabsTrigger>
            <TabsTrigger value="flow" className="data-[state=active]:bg-gray-700">
              <Activity className="w-4 h-4 mr-2" />
              Request Flow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live-demo" className="space-y-6">
            <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium mb-1">Interactive API Demo</h3>
                  <p className="text-sm text-gray-400">
                    Click any button below to make a real API call to the corresponding microservice through the Gateway.
                    All requests pass through <code className="text-cyan-400 bg-black/30 px-1 rounded">http://localhost:8080</code>.
                  </p>
                </div>
              </div>
            </div>
            {serviceStatuses.map((svc, i) => (
              <ServiceDemo key={i} service={svc} />
            ))}
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-gray-900 border-purple-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Link2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Cross-Service Integration</CardTitle>
                    <CardDescription className="text-gray-400">
                      End-to-end flow linking Auth → Account → Transaction services
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CrossServiceFlow services={serviceStatuses} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architecture">
            <ArchitectureInfo />
          </TabsContent>

          <TabsContent value="flow">
            <ArchitectureFlow />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {serviceStatuses.map((svc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-gray-800/30 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className={`w-4 h-4 ${svc.status === 'online' ? 'text-green-400' : 'text-red-400'}`} />
                    <span className="text-sm text-gray-300">{svc.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    Port: {svc.port} | DB: {svc.database}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
