/**
 * ── NeoBank AI Assistant ChatBot ────────────────────────────
 * A floating chat bubble that provides access to NEO, the
 * AI banking assistant powered by Google Gemini.
 *
 * Features:
 * - Floating action button with animated pulse
 * - Slide-in chat panel with smooth animation
 * - Conversation history with timestamps
 * - Markdown-rendered responses
 * - Suggested follow-up questions
 * - API key configuration dialog
 * - Context-aware responses (uses account data)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, Sparkles, Key,
  Trash2, RefreshCw,
  User, WifiOff, Cpu, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import aiService, { type ChatMessage, loadChatHistory, saveChatHistory, clearChatHistory } from '@/services/aiService';
import NeoBotLogo from '@/components/features/NeoBotLogo';

// ── Message Bubble Component ───────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-muted/50 text-xs text-muted-foreground px-3 py-1.5 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-gradient-to-br from-blue-500 to-blue-600">
          <User className="w-3.5 h-3.5 text-white" />
        </div>
      ) : (
        <div className="shrink-0 mt-0.5">
          <NeoBotLogo size={28} variant="minimal" animated={true} />
        </div>
      )}

      {/* Message */}
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-md'
            : 'bg-card border border-border rounded-tl-md text-card-foreground'
        }`}>
          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0">
            {renderMessageContent(message.content)}
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground mt-1 block px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

// Simple markdown-like rendering
// SAFE: dangerouslySetInnerHTML is used to render markdown-like formatting from
// AI-generated responses (Gemini API) or hardcoded fallback text. No user-provided
// content is passed through innerHTML without escaping. All input is sanitized by
// the Gemini API or comes from trusted static data in aiService.ts.
function renderMessageContent(content: string) {
  // Escape raw HTML tags to prevent XSS, then apply markdown formatting
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
  // Convert markdown-like syntax to HTML
  const html = escaped
    .replace(/### (.+)/g, '<h3 class="text-sm font-bold mt-2 mb-1">$1</h3>')
    .replace(/## (.+)/g, '<h2 class="text-base font-bold mt-2 mb-1">$1</h2>')
    .replace(/# (.+)/g, '<h1 class="text-lg font-bold mt-2 mb-1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-2 rounded-lg text-xs my-1 overflow-x-auto break-all">$1</pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 rounded text-xs">$1</code>')
    .replace(/^[\s]*[-*]\s(.+)/gm, '<li class="ml-3 list-disc">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// ── API Key Setup Dialog ───────────────────────────────────

function ApiKeySetup({ onClose }: { onClose: () => void }) {
  const [key, setKey] = useState(aiService.getApiKey() || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!key.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    setIsSaving(true);
    aiService.setApiKey(key.trim());
    toast.success('API key saved!', {
      description: 'Gemini AI is now active. Your responses will be smarter.',
    });
    setIsSaving(false);
    onClose();
  };

  const handleClear = () => {
    setKey('');
    localStorage.removeItem('neobank_gemini_api_key');
    toast.info('API key cleared. Using fallback responses.');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden border-b border-border"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold">Gemini API Key</h3>
          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600">Free</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Get a free API key from{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Google AI Studio
          </a>
          {' '}for smarter AI responses. Without it, NEO uses built-in responses.
        </p>
        <div className="flex gap-2">
          <Input
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="Paste your Gemini API key..."
            className="text-xs flex-1"
            type="password"
          />
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Save
          </Button>
        </div>
        {aiService.getApiKey() && (
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-muted-foreground">
            <Trash2 className="w-3 h-3 mr-1" />
            Clear saved key
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ── Suggested Replies Component ────────────────────────────

function SuggestedReplies({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}) {
  if (!suggestions.length) return null;

  return (
    <div className="px-3 py-2 flex flex-wrap gap-1.5">
      {suggestions.map((suggestion, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(suggestion)}
          className="text-xs bg-muted hover:bg-primary/10 hover:text-primary border border-border 
                     rounded-full px-3 py-1.5 transition-all duration-200 text-muted-foreground"
        >
          {suggestion}
        </motion.button>
      ))}
    </div>
  );
}

// ── Main ChatBot Component ─────────────────────────────────

export default function AiChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputValueRef = useRef('');

  // Load chat history on mount
  useEffect(() => {
    const history = loadChatHistory();
    if (history.length > 0) {
      setMessages(history);
    } else {
      // Welcome message
      const welcome: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: '👋 Hello! I\'m **NEO**, your AI banking assistant.\n\nI can help you with:\n- 💰 Account & balance info\n- 💸 Transfers & payments\n- 📊 Transactions & history\n- 🏦 Banking services\n\nWhat can I help you with today?',
        timestamp: Date.now(),
      };
      setMessages([welcome]);
      setSuggestions(['How do I check my balance?', 'How do I transfer money?', 'What is KYC?']);
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Track unread messages when minimized
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastAssistantMsgs = messages.filter(m => m.role === 'assistant');
      setUnreadCount(Math.max(0, lastAssistantMsgs.length - 1));
    }
  }, [messages, isOpen]);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || inputValueRef.current;
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    inputValueRef.current = '';
    setIsLoading(true);
    setSuggestions([]);

    try {
      const response = await aiService.sendMessage(
        userMessage.content,
        updatedMessages
      );

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_resp`,
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      setSuggestions(response.suggestions || []);
      saveChatHistory(finalMessages);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try asking your question again.',
        timestamp: Date.now(),
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    clearChatHistory();
    const welcome: ChatMessage = {
      id: `welcome_${Date.now()}`,
      role: 'assistant',
      content: '👋 Hello! I\'m **NEO**, your AI banking assistant.\n\nHow can I help you today?',
      timestamp: Date.now(),
    };
    setMessages([welcome]);
    setSuggestions(['How do I check my balance?', 'How do I transfer money?', 'What is KYC?']);
    toast.info('Chat history cleared');
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl 
                   bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500
                   text-white flex items-center justify-center transition-all duration-300
                   hover:scale-110 hover:shadow-2xl hover:shadow-emerald-500/30
                   active:scale-95 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-200" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 transition-transform duration-200 group-hover:rotate-12" />
            {/* Notification badge */}
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold 
                           rounded-full flex items-center justify-center shadow-lg"
              >
                {unreadCount}
              </motion.span>
            )}
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          </>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, originY: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] 
                       h-[580px] max-h-[calc(100vh-8rem)] bg-background rounded-2xl shadow-2xl 
                       border border-border flex flex-col overflow-hidden"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08)' }}
          >
            {/* Header */}
            <div className="shrink-0 bg-gradient-to-r from-emerald-500 to-teal-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <NeoBotLogo size={44} animated={true} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-lg tracking-tight">NEO</h3>
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-green-300"
                      />
                      <Badge className="text-[9px] px-1.5 py-0 bg-white/20 text-white border-0">
                        {aiService.isConfigured() ? 'AI' : 'Bot'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-white/70 flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" />
                      {aiService.isConfigured() ? 'Powered by Gemini' : 'Smart Banking Assistant'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowApiSetup(!showApiSetup)}
                    className={`p-1.5 rounded-lg transition-all ${
                      aiService.isConfigured()
                        ? 'bg-emerald-500/30 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    title="Configure API"
                  >
                    <Cpu className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClearChat}
                    className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    title="Clear chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* API Key Setup */}
            <AnimatePresence>
              {showApiSetup && <ApiKeySetup onClose={() => setShowApiSetup(false)} />}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3 bg-gradient-to-b from-background via-background to-muted/20">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5"
                >
                  <div className="shrink-0">
                    <NeoBotLogo size={28} variant="chat" animated={true} />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                        className="w-2 h-2 bg-emerald-400 rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                        className="w-2 h-2 bg-emerald-400 rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                        className="w-2 h-2 bg-emerald-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Replies */}
            <AnimatePresence>
              {suggestions.length > 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="shrink-0 border-t border-border bg-muted/20"
                >
                  <SuggestedReplies
                    suggestions={suggestions}
                    onSelect={handleSuggestionClick}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="shrink-0 p-3 border-t border-border bg-background">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={e => {
                      setInput(e.target.value);
                      inputValueRef.current = e.target.value;
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask NEO anything..."
                    className="pr-10 text-sm bg-muted/50 border-border rounded-xl"
                    disabled={isLoading}
                  />
                  {!aiService.isConfigured() && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <WifiOff className="w-3.5 h-3.5 text-amber-400" title="Using built-in responses" />
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="rounded-xl w-10 h-10 shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 
                             hover:from-emerald-400 hover:to-teal-500"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                {aiService.isConfigured()
                  ? 'Powered by Google Gemini AI'
                  : 'Add a Gemini API key for AI-powered responses'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
