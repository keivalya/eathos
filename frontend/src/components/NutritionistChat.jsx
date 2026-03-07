import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ArrowLeft, Sparkles, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatWithNutritionist } from '../api';
import './NutritionistChat.css';

function buildSystemContext(userProfile, preferences, mealHistory) {
  const parts = ['You are Eathos AI Nutritionist — a warm, knowledgeable nutrition advisor.'];

  const name = userProfile?.profile?.name || userProfile?.name;
  if (name) parts.push(`The user's name is ${name}.`);

  const profile = userProfile?.profile || userProfile;
  if (profile?.goals) parts.push(`Their nutrition goals: ${profile.goals}.`);
  if (profile?.height) parts.push(`Height: ${profile.height}.`);
  if (profile?.weight) parts.push(`Weight: ${profile.weight}.`);
  if (profile?.activityLevel) parts.push(`Activity level: ${profile.activityLevel}.`);

  if (preferences) {
    if (preferences.restrictions?.length)
      parts.push(`Dietary restrictions: ${preferences.restrictions.join(', ')}.`);
    if (preferences.cuisines?.length)
      parts.push(`Preferred cuisines: ${preferences.cuisines.join(', ')}.`);
    if (preferences.allergies)
      parts.push(`Allergies: ${preferences.allergies}.`);
  }

  const mealPrefs = profile?.mealPrefs;
  if (mealPrefs) {
    const active = Object.entries(mealPrefs)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (active.length) parts.push(`Active meals: ${active.join(', ')}.`);
  }

  const mealNotes = profile?.mealNotes;
  if (mealNotes) {
    Object.entries(mealNotes).forEach(([meal, note]) => {
      if (note) parts.push(`${meal} preferences: ${note}.`);
    });
  }

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = (mealHistory || []).filter(m => m.loggedAt?.startsWith(today));
  if (todayMeals.length) {
    const summary = todayMeals.map(m => `${m.type}: ${m.name} (${m.calories || '?'} cal)`).join('; ');
    parts.push(`Today's meals so far: ${summary}.`);
  }

  parts.push('Provide concise, actionable nutrition advice. Be encouraging. Use the user\'s context to personalize every response.');
  return parts.join(' ');
}

const STORAGE_KEY = 'eathos_chat_history';

function loadChatHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveChatHistory(msgs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-100))); } catch {}
}

export default function NutritionistChat({ userProfile, preferences, mealHistory }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(loadChatHistory);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const systemContext = useRef(
    buildSystemContext(userProfile, preferences, mealHistory)
  );

  useEffect(() => {
    systemContext.current = buildSystemContext(userProfile, preferences, mealHistory);
  }, [userProfile, preferences, mealHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = { role: 'user', content: text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const reply = await chatWithNutritionist(systemContext.current, history);
      setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment.", ts: Date.now(), error: true },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="chat-back" onClick={() => navigate('/home')}>
          <ArrowLeft size={20} />
        </button>
        <div className="chat-header-info">
          <div className="chat-avatar">
            <Sparkles size={18} />
          </div>
          <div>
            <h3>AI Nutritionist</h3>
            <span className="chat-status">Powered by Eathos</span>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon"><Sparkles size={32} /></div>
            <h4>Hi{userProfile?.profile?.name ? `, ${userProfile.profile.name}` : ''}!</h4>
            <p>I'm your AI Nutritionist. Ask me about meal planning, nutrition advice, food swaps, or anything related to your diet and wellness goals.</p>
            <div className="chat-suggestions">
              {[
                'What should I eat for dinner tonight?',
                'How can I get more protein in my diet?',
                'Suggest a healthy snack under 200 calories',
              ].map((s, i) => (
                <button key={i} className="chat-suggestion" onClick={() => { setInput(s); inputRef.current?.focus(); }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role} ${msg.error ? 'error' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="bubble-avatar"><Sparkles size={14} /></div>
            )}
            <div className="bubble-content">
              <p>{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-bubble assistant">
            <div className="bubble-avatar"><Sparkles size={14} /></div>
            <div className="bubble-content typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrap">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your nutritionist..."
            rows={1}
            disabled={isLoading}
          />
          <button
            className="chat-send"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader size={18} className="spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
