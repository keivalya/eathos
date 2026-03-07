import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import './ChatInterface.css';

const QUICK_ACTIONS = [
  'What can I make with these?',
  'Suggest a healthy recipe',
  'What should I use first?',
  'Something quick and easy',
];

/**
 * ChatInterface — chat with the Eathos model.
 *
 * Props:
 *   sessionId   – existing session id (optional, creates one on first msg)
 *   onRecipeReady – callback when the model generates a recipe event
 *   onSessionCreated – optional callback when a new session is auto-created
 */
export default function ChatInterface({ sessionId, onRecipeReady, onSessionCreated }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || null);
  const messagesEndRef = useRef(null);

  // Sync external sessionId prop
  useEffect(() => {
    if (sessionId) setCurrentSessionId(sessionId);
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ensureSession = async () => {
    if (currentSessionId) return currentSessionId;
    // Create a new session on-the-fly
    const res = await fetch('http://localhost:8000/api/session/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    setCurrentSessionId(data.session_id);
    onSessionCreated?.(data.session_id);
    return data.session_id;
  };

  const sendMessage = async (text) => {
    if (!text.trim() || sending) return;

    const userMsg = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const sid = await ensureSession();

      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, message: text.trim() }),
      });

      if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
      const data = await res.json();

      let hasUserReply = false;
      for (const reply of data.replies) {
        // Skip raw analyzer output (not meant for user)
        if (reply.items !== undefined && reply.total_items !== undefined) continue;
        // Skip empty inventory review
        if (reply.action === 'review_inventory') {
          const inv = reply.inventory;
          const items = Array.isArray(inv) ? inv : (inv?.inventory || []);
          if (items.length === 0) continue;
          // Show inventory count if items found
          setMessages(prev => [...prev, {
            role: 'bot',
            text: `I found ${items.length} items in your fridge! ${reply.message || ''}`,
          }]);
          hasUserReply = true;
          continue;
        }
        // Recipe generated
        if (reply.action === 'review_recipe' && reply.recipe) {
          setMessages(prev => [...prev, {
            role: 'bot',
            text: `I've created a recipe: **${reply.recipe.title}**! Loading it now...`,
          }]);
          onRecipeReady?.(reply);
          hasUserReply = true;
          continue;
        }
        // Normal text
        if (reply.text) {
          setMessages(prev => [...prev, { role: 'bot', text: reply.text }]);
          hasUserReply = true;
        } else if (reply.message) {
          setMessages(prev => [...prev, { role: 'bot', text: reply.message }]);
          hasUserReply = true;
        }
      }

      if (!hasUserReply) {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: "I'm here to help with recipes and meal planning! Try uploading a fridge photo first, or ask me about cooking tips.",
        }]);
      }
    } catch (err) {
      console.error('[Chat] Error:', err);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="chat-container" id="chat-interface">
      <div className="chat-header">
        <span className="chat-header-icon">💬</span>
        <h3>Chat with Eathos</h3>
        <span className="chat-header-hint">Ask about your ingredients or request a recipe</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <span className="chat-empty-icon">🍳</span>
            <p>Ask me anything about your fridge items, or tell me what you're in the mood for!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role === 'user' ? 'user' : 'bot'}`}>
              <div className={`msg-avatar ${msg.role === 'user' ? 'human' : 'bot'}`}>
                {msg.role === 'user' ? '👤' : '🧑‍🍳'}
              </div>
              <div className="msg-bubble">{msg.text}</div>
            </div>
          ))
        )}
        {sending && (
          <div className="chat-message bot">
            <div className="msg-avatar bot">🧑‍🍳</div>
            <div className="msg-bubble typing-indicator">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 0 && (
        <div className="chat-quick-actions">
          {QUICK_ACTIONS.map(q => (
            <button
              key={q}
              className="quick-action-btn"
              onClick={() => sendMessage(q)}
              disabled={sending}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="chat-input"
          disabled={sending}
          id="chat-input"
        />
        <button
          className="chat-send-btn"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || sending}
          id="chat-send-btn"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
