import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ChevronRight, ChevronLeft, Check, Eye, EyeOff, Mail, Lock, User, Phone, MapPin, FileText, Sparkles, Shield, CreditCard, ArrowRight, Loader2, Github, Smartphone, Globe, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { register } from '@/lib/auth';
import logoImg from '@/assets/logo.png';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  accountType: string;
}

interface FormErrors {
  [key: string]: string;
}

const steps = [
  { id: 1, title: 'Account Type', icon: <Building2 className="w-4 h-4" /> },
  { id: 2, title: 'Personal Info', icon: <User className="w-4 h-4" /> },
  { id: 3, title: 'Security', icon: <Shield className="w-4 h-4" /> },
  { id: 4, title: 'Review', icon: <FileText className="w-4 h-4" /> },
]

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    accountType: 'personal'
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    if (score <= 25) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 50) return { score, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 75) return { score, label: 'Good', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const validateStep = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (step === 1) {
      if (!formData.accountType) newErrors.accountType = 'Select an account type';
    }
    
    if (step === 2) {
      if (!formData.name.trim()) newErrors.name = 'Full name is required';
      else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
      
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
      
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^\d{10}$/.test(formData.phone.replace(/[\s-]/g, ''))) newErrors.phone = 'Invalid phone number (10 digits)';
    }
    
    if (step === 3) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Password must contain an uppercase letter';
      else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Password must contain a number';
      
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone.replace(/[\s-]/g, ''),
        address: formData.address
      });
      
      if (result.success) {
        toast.success('Account created successfully!', {
          description: 'Welcome to NeoBank. You are being redirected.',
          duration: 4000,
        });
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        toast.error(result.error || 'Registration failed', {
          description: 'Please try again with different details.',
        });
      }
    } catch (err: any) {
      toast.error('Registration error', {
        description: err?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(formData.password);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              step > s.id 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30' 
                : step === s.id 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-110' 
                : 'bg-gray-700 text-gray-400'
            }`}>
              {step > s.id ? <Check className="w-5 h-5" /> : s.icon}
            </div>
            <span className={`ml-2 text-sm hidden sm:block ${
              step === s.id ? 'text-cyan-400 font-medium' : 'text-gray-500'
            }`}>
              {s.title}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-12 sm:w-20 h-0.5 mx-2 rounded transition-colors duration-300 ${
              step > s.id ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gray-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderAccountType = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Choose Your Account Type</h2>
        <p className="text-gray-400 text-sm">Select the type of account that best fits your needs</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            id: 'personal',
            title: 'Personal Account',
            desc: 'For everyday banking, savings, and personal finances',
            icon: <User className="w-8 h-8" />,
            features: ['Free checking account', 'Debit card included', 'Mobile banking access', 'No monthly fees'],
            gradient: 'from-blue-500 to-indigo-600'
          },
          {
            id: 'business',
            title: 'Business Account',
            desc: 'For entrepreneurs, startups, and growing businesses',
            icon: <Building2 className="w-8 h-8" />,
            features: ['Multi-user access', 'Invoice management', 'Business credit line', 'Team cards'],
            gradient: 'from-emerald-500 to-teal-600'
          }
        ].map((type) => (
          <motion.button
            key={type.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { updateField('accountType', type.id); }}
            className={`relative p-6 rounded-xl text-left transition-all border-2 ${
              formData.accountType === type.id
                ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 shadow-lg shadow-cyan-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
            }`}
          >
            {formData.accountType === type.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center text-white mb-4`}>
              {type.icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{type.title}</h3>
            <p className="text-sm text-gray-400 mb-4">{type.desc}</p>
            <ul className="space-y-1.5">
              {type.features.map((f, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.button>
        ))}
      </div>
      {errors.accountType && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> {errors.accountType}
        </p>
      )}
    </motion.div>
  );

  const renderPersonalInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white mb-2">Personal Information</h2>
        <p className="text-gray-400 text-sm">Tell us a bit about yourself</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          <User className="w-4 h-4 inline mr-1" /> Full Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="John Doe"
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${
            errors.name ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          <Mail className="w-4 h-4 inline mr-1" /> Email Address
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="john@example.com"
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${
            errors.email ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          <Smartphone className="w-4 h-4 inline mr-1" /> Phone Number
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="1234567890"
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${
            errors.phone ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          <MapPin className="w-4 h-4 inline mr-1" /> Address (Optional)
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="123 Main St, City, Country"
          rows={2}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none"
        />
      </div>
    </motion.div>
  );

  const renderSecurity = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white mb-2">Security Details</h2>
        <p className="text-gray-400 text-sm">Create a strong password to protect your account</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          <Lock className="w-4 h-4 inline mr-1" /> Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="Create a strong password"
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all pr-10 ${
              errors.password ? 'border-red-500' : 'border-gray-700'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        {formData.password && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: `${strength.score}%` }} />
              </div>
              <span className={`text-xs font-medium ${
                strength.score <= 25 ? 'text-red-400' :
                strength.score <= 50 ? 'text-orange-400' :
                strength.score <= 75 ? 'text-yellow-400' :
                'text-green-400'
              }`}>{strength.label}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
                <CheckCircle2 className="w-3 h-3" /> 8+ chars
              </span>
              <span className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'}`}>
                <CheckCircle2 className="w-3 h-3" /> Uppercase
              </span>
              <span className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'}`}>
                <CheckCircle2 className="w-3 h-3" /> Number
              </span>
              <span className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-400' : 'text-gray-500'}`}>
                <CheckCircle2 className="w-3 h-3" /> Symbol
              </span>
            </div>
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          <Shield className="w-4 h-4 inline mr-1" /> Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            placeholder="Re-enter your password"
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all pr-10 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
        {formData.confirmPassword && formData.password && (
          <div className={`flex items-center gap-1 mt-1 ${formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'} text-xs`}>
            {formData.password === formData.confirmPassword ? (
              <><CheckCircle2 className="w-3 h-3" /> Passwords match</>
            ) : (
              <><X className="w-3 h-3" /> Passwords do not match</>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderReview = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white mb-2">Review Your Details</h2>
        <p className="text-gray-400 text-sm">Please verify your information before submitting</p>
      </div>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${
            formData.accountType === 'personal' ? 'from-blue-500 to-indigo-600' : 'from-emerald-500 to-teal-600'
          } text-white`}>
            {formData.accountType === 'personal' ? <User className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-sm text-gray-400">Account Type</p>
            <p className="text-white font-medium capitalize">{formData.accountType} Account</p>
          </div>
        </div>
        
        {[
          { label: 'Full Name', value: formData.name, icon: <User className="w-4 h-4" /> },
          { label: 'Email', value: formData.email, icon: <Mail className="w-4 h-4" /> },
          { label: 'Phone', value: formData.phone, icon: <Smartphone className="w-4 h-4" /> },
          { label: 'Address', value: formData.address || 'Not provided', icon: <MapPin className="w-4 h-4" /> },
          { label: 'Password Strength', value: strength.label, icon: <Shield className="w-4 h-4" /> },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 pb-3 border-b border-gray-700/50 last:border-0 last:pb-0">
            <div className="text-gray-500">{item.icon}</div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-sm text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderStep = () => {
    switch (step) {
      case 1: return renderAccountType();
      case 2: return renderPersonalInfo();
      case 3: return renderSecurity();
      case 4: return renderReview();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl"
      >
        <div className="bg-gradient-to-br from-gray-900 to-gray-800/80 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Logo & Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {logoImg ? (
              <img src={logoImg} alt="NeoBank" className="h-10 w-10" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            )}
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              NeoBank
            </span>
          </div>

          {/* Benefits Banner */}
          <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/20 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-4 justify-center flex-wrap text-xs text-gray-400">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> No monthly fees</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Instant setup</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Secure encryption</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> 24/7 support</span>
            </div>
          </div>

          {renderStepIndicator()}

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
            <div>
              {step > 1 ? (
                <button
                  onClick={prevStep}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>
            <div>
              {step < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/25"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-70"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Create Account</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
