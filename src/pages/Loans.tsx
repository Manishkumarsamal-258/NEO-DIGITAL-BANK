import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { requireAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/mockData';
import { toast } from 'sonner';
import { 
  Landmark, 
  Home, 
  Car, 
  GraduationCap, 
  Briefcase, 
  Calculator,
  CheckCircle2,
  Loader2,
  FileText,
  Clock,
  Percent,
  Calendar,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import type { User } from '@/types';

interface LoanProduct {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  minTerm: number;
  maxTerm: number;
  color: string;
}

const loanProducts: LoanProduct[] = [
  {
    id: 'personal',
    name: 'Personal Loan',
    description: 'Flexible funding for any personal need',
    icon: <Briefcase className="h-6 w-6" />,
    minAmount: 1000,
    maxAmount: 50000,
    interestRate: 8.5,
    minTerm: 6,
    maxTerm: 60,
    color: 'from-blue-500/20 to-cyan-500/10',
  },
  {
    id: 'home',
    name: 'Home Loan',
    description: 'Finance your dream home',
    icon: <Home className="h-6 w-6" />,
    minAmount: 10000,
    maxAmount: 500000,
    interestRate: 3.5,
    minTerm: 12,
    maxTerm: 360,
    color: 'from-green-500/20 to-emerald-500/10',
  },
  {
    id: 'auto',
    name: 'Auto Loan',
    description: 'Drive your dream car',
    icon: <Car className="h-6 w-6" />,
    minAmount: 5000,
    maxAmount: 100000,
    interestRate: 5.5,
    minTerm: 12,
    maxTerm: 84,
    color: 'from-orange-500/20 to-red-500/10',
  },
  {
    id: 'education',
    name: 'Education Loan',
    description: 'Invest in your future',
    icon: <GraduationCap className="h-6 w-6" />,
    minAmount: 2000,
    maxAmount: 100000,
    interestRate: 4.5,
    minTerm: 12,
    maxTerm: 120,
    color: 'from-purple-500/20 to-pink-500/10',
  },
];

function LoanCalculator({ product }: { product: LoanProduct }) {
  const [amount, setAmount] = useState(product.minAmount);
  const [term, setTerm] = useState(12);

  const monthlyRate = product.interestRate / 100 / 12;
  const numPayments = term;
  const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1) || 0;
  const totalPayment = monthlyPayment * numPayments;
  const totalInterest = totalPayment - amount;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-gray-300">Loan Amount: <span className="text-white font-bold">{formatCurrency(amount)}</span></Label>
        </div>
        <Slider
          value={[amount]}
          onValueChange={([v]) => setAmount(v)}
          min={product.minAmount}
          max={product.maxAmount}
          step={1000}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatCurrency(product.minAmount)}</span>
          <span>{formatCurrency(product.maxAmount)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-gray-300">Term: <span className="text-white font-bold">{term} months</span></Label>
        </div>
        <Slider
          value={[term]}
          onValueChange={([v]) => setTerm(v)}
          min={product.minTerm}
          max={product.maxTerm}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{product.minTerm} mo</span>
          <span>{product.maxTerm} mo</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-gray-700/30 border border-gray-700 text-center">
          <p className="text-xs text-gray-400">Monthly</p>
          <p className="text-lg font-bold text-white">{formatCurrency(Math.round(monthlyPayment))}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-700/30 border border-gray-700 text-center">
          <p className="text-xs text-gray-400">Interest</p>
          <p className="text-lg font-bold text-orange-400">{formatCurrency(Math.round(totalInterest))}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-700/30 border border-gray-700 text-center">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-lg font-bold text-blue-400">{formatCurrency(Math.round(totalPayment))}</p>
        </div>
      </div>
    </div>
  );
}

export default function Loans() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('personal');
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [employmentStatus, setEmploymentStatus] = useState<string>('');

  useEffect(() => {
    const u = requireAuth();
    if (u) setUser(u);
    setLoading(false);
  }, []);

  const product = loanProducts.find(p => p.id === selectedProduct) || loanProducts[0];

  const handleApply = () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setApplied(true);
      toast.success('Loan application submitted successfully!');
    }, 2000);
  };

  if (loading) {
    return (
      <AppLayout title="Loans" subtitle="Apply for loans">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Loans & Financing" subtitle="Explore loan options and apply online">
      <AnimatePresence mode="wait">
        {applied ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto"
          >
            <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Application Submitted!</h2>
                <p className="text-gray-400">
                  Your {product.name} application has been received. Our team will review it and get back to you within 2-3 business days.
                </p>
                <div className="p-3 rounded-lg bg-gray-700/30 border border-gray-700 text-left text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Application ID</span>
                    <span className="text-white font-mono">LN-{Date.now().toString(36).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Status</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Under Review</Badge>
                  </div>
                </div>
                <Button onClick={() => setApplied(false)} variant="outline" className="border-gray-600">
                  Apply for Another Loan
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Loan Products */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {loanProducts.map(p => (
                <motion.button
                  key={p.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedProduct(p.id); setApplied(false); }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedProduct === p.id
                      ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <div className={`p-2 rounded-lg w-fit mb-3 ${
                    selectedProduct === p.id ? 'bg-blue-500/20' : 'bg-gray-700/50'
                  }`}>
                    {p.icon}
                  </div>
                  <p className="font-medium text-white text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-1">From {p.interestRate}% APR</p>
                </motion.button>
              ))}
            </div>

            {/* Loan Detail & Calculator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-400" />
                    Loan Calculator
                  </CardTitle>
                  <CardDescription>Adjust amounts to see your estimated payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <LoanCalculator product={product} />
                </CardContent>
              </Card>

              <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Apply for {product.name}
                  </CardTitle>
                  <CardDescription>Fill in the details to apply</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-gray-700/30 border border-gray-700 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Interest Rate</span>
                      <span className="text-green-400 font-medium">{product.interestRate}% APR</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Loan Range</span>
                      <span className="text-white">{formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Term Range</span>
                      <span className="text-white">{product.minTerm} - {product.maxTerm} months</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Annual Income</Label>
                    <Input type="number" placeholder="e.g. 60000" className="bg-gray-800/50 border-gray-700 text-white" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Employment Status</Label>
                    <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                      <SelectTrigger className="w-full h-10 border border-gray-700 bg-gray-800/50 text-white">
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="self-employed">Self-Employed</SelectItem>
                        <SelectItem value="business">Business Owner</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
                  >
                    {applying ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                    ) : (
                      <><ArrowRight className="h-4 w-4 mr-2" /> Submit Application</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
