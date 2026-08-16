import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Trash2,
  Minimize2,
  Maximize2,
  RefreshCw,
  Database,
  ArrowRight,
  GraduationCap,
  Copy,
  Check,
} from 'lucide-react';

const SUGGESTIONS = [
  '📅 What upcoming events & hackathons are scheduled?',
  '📢 Are there any urgent exam or placement notices?',
  '📚 Where can I download Data Structures & DBMS notes?',
  '⏰ What is the weekly timetable for Computer Science Sem 4?',
  '💡 How to register for Google Gemini AI Workshop?',
];

const AIChatModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `👋 **Hello ${user?.name || 'there'}!**\n\nI am **CampusAssist AI**, powered by Google Gemini and live campus database records.\n\nI can answer questions about your **class timetables**, **latest circulars**, **upcoming events**, or **available study notes & question papers**.\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history for context
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ sender: m.sender, text: m.text }));

      const res = await aiService.askAI({
        question: userMessage.text,
        conversationHistory: history,
      });

      if (res.data && res.data.success) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.data.answer,
          source: res.data.source || 'gemini-2.5-flash',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(res.data?.message || 'Unable to get response');
      }
    } catch (err) {
      console.error('AI Error:', err);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `⚠️ **Apologies!** I encountered an issue connecting to the AI service.\n\n*Error details:* ${err.response?.data?.message || err.message}\n\nPlease verify that the backend is running and your \`GEMINI_API_KEY\` is configured in \`backend/.env\`.`,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: `Conversation cleared! What else would you like to know about our campus?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Simple Markdown text formatter for AI replies
  const renderFormattedText = (content) => {
    // Split by newlines
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bold syntax **text**
      let formattedLine = line;
      
      // Parse markdown bold **text**
      const parts = [];
      let lastIndex = 0;
      const regex = /\*\*(.*?)\*\*/g;
      let match;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-slate-900">{match[1]}</strong>);
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const isHeader = line.trim().startsWith('#') || line.trim().startsWith('📢') || line.trim().startsWith('📅') || line.trim().startsWith('📚') || line.trim().startsWith('🤖');

      return (
        <p
          key={idx}
          className={`${
            isBullet ? 'pl-4 relative my-1 text-slate-700' : isHeader ? 'font-semibold text-slate-900 mt-2 mb-1' : 'my-1 text-slate-700'
          } leading-relaxed text-sm`}
        >
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 pointer-events-none">
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs pointer-events-auto sm:hidden"
        onClick={onClose}
      />

      {/* Main Drawer / Modal */}
      <div
        className={`pointer-events-auto w-full sm:w-[480px] ${
          isExpanded ? 'sm:w-[700px] h-[85vh]' : 'h-[620px] max-h-[90vh]'
        } bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-6 sm:slide-in-from-right-6`}
      >
        {/* Chat Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-brand-900 via-blue-900 to-indigo-950 text-white flex items-center justify-between shadow-sm relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">CampusAssist AI</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  gemini-2.5-flash
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <Database className="w-3 h-3 text-cyan-400" />
                <span>RAG Grounded • Live Campus DB</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <button
              onClick={handleClear}
              title="Clear Conversation"
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse' : 'Expand'}
              className="hidden sm:block p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-sm shadow-xs relative group ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-brand-600 to-blue-600 text-white rounded-br-none'
                    : msg.isError
                    ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-bl-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.sender === 'ai' ? (
                  <div>
                    {renderFormattedText(msg.text)}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 hover:text-slate-700"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="whitespace-pre-wrap leading-relaxed text-white font-medium">{msg.text}</p>
                    <span className="text-[10px] text-blue-100 block text-right mt-1 opacity-80">
                      {msg.timestamp}
                    </span>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1 text-xs font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          ))}

          {/* Typing / Loading indicator */}
          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3.5 shadow-sm flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce"></span>
                </div>
                <span className="text-xs text-slate-500 font-medium">Scanning live campus context...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-slate-100/70 border-t border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Prompts:
          </span>
          {SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item)}
              disabled={loading}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 border border-slate-200 text-xs font-medium text-slate-700 transition shadow-2xs shrink-0"
            >
              <span>{item}</span>
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about timetable, exams, notes, events..."
              disabled={loading}
              className="flex-1 bg-slate-100 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 text-white flex items-center justify-center shadow-md shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Powered by Gemini 2.5 Flash & RAG</span>
            <span>Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;
