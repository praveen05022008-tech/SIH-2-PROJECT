import React, { useState } from 'react';
import { api } from '../services/api';
import { Bot, Send, User, Sparkles, X, MessageSquare, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { MarkdownRenderer } from './common/MarkdownRenderer';

export function AICareerCounselor() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Career & Industry Mentor powered by Groq. How can I help you with your career roadmap, interview prep, or skill gap strategies today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'Create a 12-Week Skill-Gap Action Plan for Full-Stack Developer',
    'What are the top DSA patterns to practice for interviews?',
    'How should I structure my resume for product startups?'
  ];

  const handleSend = async (customMessage = null) => {
    const userMsg = (customMessage || input).trim();
    if (!userMsg || loading) return;

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
          bottom: isExpanded ? '20px' : '80px',
          right: isExpanded ? '20px' : '24px',
          left: isExpanded ? '20px' : 'auto',
          top: isExpanded ? '20px' : 'auto',
          width: isExpanded ? 'auto' : '440px',
          maxWidth: isExpanded ? '920px' : '440px',
          margin: isExpanded ? '0 auto' : '0',
          height: isExpanded ? 'auto' : '580px',
          maxHeight: isExpanded ? '90vh' : '580px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10000,
          overflow: 'hidden',
          border: '1px solid #CBD5E1',
          transition: 'all 0.2s ease-in-out'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#1E2A44',
            color: '#ffffff',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #2B3856'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ backgroundColor: '#3B5BDB', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                <Bot size={18} color="#fff" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Groq AI Career Advisor</h4>
                <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>Interactive guidance & roadmaps</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', padding: '4px' }}
                title={isExpanded ? 'Collapse view' : 'Expand view'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => { setIsOpen(false); setIsExpanded(false); }}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            backgroundColor: '#F8FAFC'
          }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: isExpanded ? '92%' : '95%'
                }}
              >
                {m.role === 'assistant' && (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#3B5BDB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '4px'
                  }}>
                    <Bot size={15} color="#fff" />
                  </div>
                )}
                <div style={{
                  backgroundColor: m.role === 'user' ? '#3B5BDB' : '#ffffff',
                  color: m.role === 'user' ? '#ffffff' : '#1E293B',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  lineHeight: '1.5',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  border: m.role === 'assistant' ? '1px solid #E2E8F0' : 'none',
                  width: m.role === 'assistant' ? '100%' : 'auto'
                }}>
                  {m.role === 'assistant' ? (
                    <MarkdownRenderer content={m.content} />
                  ) : (
                    m.content
                  )}
                </div>
                {m.role === 'user' && (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '4px'
                  }}>
                    <User size={15} color="#fff" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                color: '#3B5BDB',
                fontSize: '12.5px',
                padding: '8px 12px',
                backgroundColor: '#EEF2FF',
                borderRadius: '6px',
                width: 'fit-content'
              }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Formulating personalized strategic advice via Groq Llama-3...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Suggestions */}
          {messages.length <= 2 && (
            <div style={{ padding: '8px 12px', backgroundColor: '#F1F5F9', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(qp)}
                  disabled={loading}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #CBD5E1',
                    borderRadius: '16px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    color: '#334155',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  💡 {qp}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{
            padding: '12px 14px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              placeholder="Ask for roadmap, DSA plan, system design tips..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '13.5px',
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
                padding: '9px 16px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontWeight: 600
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
