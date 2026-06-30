import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, RefreshCw } from 'lucide-react';
import { agentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Simple markdown-like renderer for agent responses
function MessageContent({ content }) {
  // Convert **bold**, emoji lines, and \n to formatted HTML-like JSX
  const lines = content.split('\n');
  return (
    <div className="text-sm leading-relaxed space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        // Bold: **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j}>{part.slice(2, -2)}</strong>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

// Role-aware quick action suggestions
const getQuickActions = (role) => {
  if (role === 'provider') {
    return [
      '📋 Show my incoming rent requests',
      '✅ Accept booking #...',
      '❌ Reject booking #...',
      '🎫 Submit a support ticket',
    ];
  }
  if (role === 'admin') {
    return [
      '📄 List pending documents to verify',
      '🎫 Submit a support ticket',
    ];
  }
  // consumer (default)
  return [
    '🔍 Find cheapest scooter near Nagpur',
    '🚗 Book a car for tomorrow',
    '📅 Show my bookings',
    '🎫 Submit a support ticket',
  ];
};

export default function AgentChatWidget() {
  const { isAuthenticated, user } = useAuth();
  const userRole = user?.role || 'consumer';

  const getGreeting = () => {
    if (userRole === 'provider')
      return "👋 Hi! I'm Rentora AI. I can show your incoming rent requests, help you accept/reject them, or submit support tickets.";
    if (userRole === 'admin')
      return "👋 Hi Admin! I can list documents pending verification or help you with support tickets.";
    return "👋 Hi! I'm Rentora AI. Tell me what you need — I can find & book the cheapest vehicle, manage your bookings, or submit support tickets!";
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: getGreeting() },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickActions = getQuickActions(userRole);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen]);

  if (!isAuthenticated) return null;

  const handleSend = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setShowQuickActions(false);
    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Send only the conversation messages (exclude initial greeting from history
      // so we don't confuse the model — keep context window clean)
      const chatHistory = newMessages.filter((m) => !(m.role === 'assistant' && m.content === getGreeting()));
      const response = await agentAPI.chat({ messages: chatHistory });
      // axios interceptor returns res.data directly, so response = { success, data: { reply } }
      const reply = response?.data?.reply || response?.reply || 'Sorry, I could not get a response.';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Oops! Something went wrong. Please try again.';
      setMessages([...newMessages, { role: 'assistant', content: `⚠️ ${errMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{ role: 'assistant', content: getGreeting() }]);
    setShowQuickActions(true);
    setInput('');
  };

  const roleLabel = { provider: 'Provider', admin: 'Admin', consumer: 'Consumer' }[userRole] || 'User';
  const roleBadgeColor = { provider: '#7c3aed', admin: '#dc2626', consumer: '#0ea5e9' }[userRole] || '#0ea5e9';

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {isOpen ? (
        <div style={{
          width: '400px',
          maxWidth: 'calc(100vw - 48px)',
          height: '580px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #0f172a, #1e293b)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '8px',
                display: 'flex',
              }}>
                <Sparkles size={18} color="white" />
              </div>
              <div>
                <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px', margin: 0 }}>Rentora AI Agent</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <div style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }} />
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Online · GPT-4o</span>
                  <span style={{
                    background: roleBadgeColor,
                    color: 'white',
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '99px',
                    fontWeight: '600',
                    marginLeft: '4px',
                  }}>{roleLabel}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleReset}
                title="Reset conversation"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'white',
                }}
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'white',
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#334155 transparent',
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: '8px',
                  alignItems: 'flex-end',
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Bot size={14} color="white" />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #0ea5e9, #0284c7)'
                    : 'rgba(255,255,255,0.07)',
                  color: 'white',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '10px 14px',
                  border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  boxShadow: msg.role === 'user' ? '0 4px 12px rgba(14,165,233,0.3)' : 'none',
                }}>
                  <MessageContent content={msg.content} />
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px',
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={14} color="white" />
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '12px 16px',
                  display: 'flex',
                  gap: '5px',
                  alignItems: 'center',
                }}>
                  {[0, 150, 300].map((delay, i) => (
                    <div key={i} style={{
                      width: '7px', height: '7px',
                      background: '#0ea5e9',
                      borderRadius: '50%',
                      animation: 'bounce 1.2s infinite',
                      animationDelay: `${delay}ms`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {showQuickActions && !isLoading && (
            <div style={{
              padding: '0 16px 8px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              flexShrink: 0,
            }}>
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action.replace(/^[^ ]+ /, ''))}
                  style={{
                    background: 'rgba(14,165,233,0.12)',
                    border: '1px solid rgba(14,165,233,0.3)',
                    borderRadius: '99px',
                    color: '#7dd3fc',
                    fontSize: '11px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: '500',
                  }}
                  onMouseEnter={(e) => { e.target.style.background = 'rgba(14,165,233,0.25)'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'rgba(14,165,233,0.12)'; }}
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.04)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
          }}>
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about rentals..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '13px',
                  padding: '10px 14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#0ea5e9'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                style={{
                  background: input.trim() && !isLoading
                    ? 'linear-gradient(135deg, #0ea5e9, #6366f1)'
                    : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: input.trim() && !isLoading ? '0 4px 12px rgba(14,165,233,0.4)' : 'none',
                }}
              >
                <Send size={16} color="white" />
              </button>
            </form>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textAlign: 'center', marginTop: '8px' }}>
              Powered by OpenAI GPT-4o · Rentora AI
            </p>
          </div>
        </div>
      ) : (
        /* Floating button */
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            border: 'none',
            borderRadius: '999px',
            padding: '16px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 32px rgba(14,165,233,0.5)',
            color: 'white',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            animation: 'pulse-glow 2s infinite',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Sparkles size={20} />
          <span>AI Agent</span>
        </button>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 8px 32px rgba(14,165,233,0.5); }
          50% { box-shadow: 0 8px 40px rgba(99,102,241,0.7); }
        }
      `}</style>
    </div>
  );
}
