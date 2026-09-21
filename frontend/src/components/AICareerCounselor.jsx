import React, { useState } from 'react';
import { api } from '../services/api';
import { Bot, Send, User, Sparkles, X, MessageSquare, Loader2 } from 'lucide-react';

export function AICareerCounselor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Career & Industry Mentor powered by Groq. How can I help you with your career roadmap, interview prep, or skill gap strategies today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user', content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const chatPayload = newHistory.map(m => ({ role: m.role, content: m.content }));
      const res = await api.post('/ai/career-counselor', {
        message: userMsg,
        chat_history: chatPayload
      });
      setMessages([...newHistory, { role: 'assistant', content: res.response }]);
    } catch (err) {
      setMessages([...newHistory, { role: 'assistant', content: 'Sorry, I encountered an error connecting to Groq AI. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#3B5BDB',
          color: '#ffffff',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 20px rgba(59, 91, 219, 0.35)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px',
          zIndex: 9999,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Sparkles size={18} />
        <span>Ask AI Counselor</span>
      </button>

      {/* Counselor Modal / Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '24px',
          width: '380px',
          height: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10000,
          overflow: 'hidden',
          border: '1px solid #E2E8F0'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#1E2A44',
            color: '#ffffff',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ backgroundColor: '#3B5BDB', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                <Bot size={16} color="#fff" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Groq AI Career Advisor</h4>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Real-time student guidance</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#F8FAFC'
          }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {m.role === 'assistant' && (
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#3B5BDB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={14} color="#fff" />
                  </div>
                )}
                <div style={{
                  backgroundColor: m.role === 'user' ? '#3B5BDB' : '#ffffff',
                  color: m.role === 'user' ? '#ffffff' : '#1E293B',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  whiteSpace: 'pre-wrap',
                  border: m.role === 'assistant' ? '1px solid #E2E8F0' : 'none'
                }}>
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={14} color="#fff" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748B', fontSize: '12px' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Thinking via Groq Llama-3...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{
            padding: '12px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              placeholder="Ask about careers, skills, resumes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                backgroundColor: '#3B5BDB',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 14px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
