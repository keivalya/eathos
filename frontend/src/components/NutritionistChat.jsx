import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, ArrowLeft, Sparkles, Loader, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatWithNutritionist } from '../api';
import './NutritionistChat.css';

/* ─── Lightweight markdown → React ─── */
function renderMarkdown(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null; // 'ul' or 'ol'

  const flushList = () => {
    if (listItems.length > 0) {
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(<Tag key={`list-${elements.length}`}>{listItems}</Tag>);
      listItems = [];
      listType = null;
    }
  };

  const inlineFormat = (str, lineKey) => {
    // Bold, italic, inline code
    const parts = [];
    let remaining = str;
    let idx = 0;

    const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(remaining.slice(lastIndex, match.index));
      }
      if (match[2]) {
        parts.push(<strong key={`${lineKey}-${idx}`}><em>{match[2]}</em></strong>);
      } else if (match[3]) {
        parts.push(<strong key={`${lineKey}-${idx}`}>{match[3]}</strong>);
      } else if (match[4]) {
        parts.push(<em key={`${lineKey}-${idx}`}>{match[4]}</em>);
      } else if (match[5]) {
        parts.push(<code key={`${lineKey}-${idx}`}>{match[5]}</code>);
      }
      lastIndex = match.index + match[0].length;
      idx++;
    }
    if (lastIndex < remaining.length) {
      parts.push(remaining.slice(lastIndex));
    }
    return parts.length > 0 ? parts : [str];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const Tag = `h${Math.min(level + 2, 6)}`; // h3–h6 in chat
      elements.push(<Tag key={`h-${i}`}>{inlineFormat(headingMatch[2], `h-${i}`)}</Tag>);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[\s]*[-*•]\s+(.+)/);
    if (ulMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(<li key={`li-${i}`}>{inlineFormat(ulMatch[1], `li-${i}`)}</li>);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^[\s]*(\d+)[.)]\s+(.+)/);
    if (olMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(<li key={`li-${i}`}>{inlineFormat(olMatch[2], `li-${i}`)}</li>);
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      flushList();
      elements.push(<hr key={`hr-${i}`} />);
      continue;
    }

    // Empty line
    if (!line.trim()) {
      flushList();
      continue;
    }

    // Normal paragraph
    flushList();
    elements.push(<p key={`p-${i}`}>{inlineFormat(line, `p-${i}`)}</p>);
  }

  flushList();
  return elements;
}


/* ─── System prompt builder ─── */
function buildSystemContext(userProfile, preferences, mealHistory, inventory) {
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

  // Inventory context
  if (Array.isArray(inventory) && inventory.length > 0) {
    const itemNames = inventory.map(i => i.name).join(', ');
    parts.push(`The user currently has these items in their fridge: ${itemNames}.`);
    const expiring = inventory.filter(i => i.days_until_expiry != null && i.days_until_expiry <= 3);
    if (expiring.length > 0) {
      parts.push(`Items expiring soon: ${expiring.map(i => `${i.name} (${i.days_until_expiry} days)`).join(', ')}.`);
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = (mealHistory || []).filter(m => m.loggedAt?.startsWith(today));
  if (todayMeals.length) {
    const summary = todayMeals.map(m => `${m.type}: ${m.name} (${m.calories || '?'} cal)`).join('; ');
    parts.push(`Today's meals so far: ${summary}.`);
  }

  parts.push('Provide concise, actionable nutrition advice. Be encouraging. Use markdown formatting (bold, lists, headings) to make responses clear and readable.');
  parts.push('When the user asks for a recipe or you suggest one, end your message with exactly this line on its own: "👉 **Would you like me to generate this recipe?** Type **yes** to start!"');
  parts.push('If the user says "yes", "generate", "make it", "cook it", or similar confirmation, respond with EXACTLY this JSON and nothing else: {"action":"generate_recipe"}');

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

export default function NutritionistChat({
  userProfile,
  preferences,
  mealHistory,
  inventory,
  sessionId,
  onGenerateRecipe,
}) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(loadChatHistory);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const systemContext = useRef(
    buildSystemContext(userProfile, preferences, mealHistory, inventory)
  );

  useEffect(() => {
    systemContext.current = buildSystemContext(userProfile, preferences, mealHistory, inventory);
  }, [userProfile, preferences, mealHistory, inventory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const sendMessage = useCallback(async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || isLoading) return;

    const userMsg = { role: 'user', content: text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const reply = await chatWithNutritionist(systemContext.current, history);

      // Check if the model wants to trigger recipe generation
      try {
        const parsed = JSON.parse(reply);
        if (parsed.action === 'generate_recipe') {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '🍳 **Great! Let me generate that recipe for you...** Redirecting to the recipe generator!',
            ts: Date.now(),
          }]);
          // Trigger the recipe flow
          if (onGenerateRecipe) {
            setTimeout(() => onGenerateRecipe(), 1200);
          } else {
            setTimeout(() => navigate('/scan'), 1200);
          }
          return;
        }
      } catch { /* not JSON, normal text reply */ }

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
  }, [input, isLoading, messages, navigate, onGenerateRecipe]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = useMemo(() => {
    const base = [
      'What should I eat for dinner tonight?',
      'How can I get more protein in my diet?',
      'Suggest a healthy snack under 200 calories',
    ];
    if (Array.isArray(inventory) && inventory.length > 0) {
      base.unshift('Make me a recipe with what I have');
    }
    return base;
  }, [inventory]);

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
              {suggestions.map((s, i) => (
                <button key={i} className="chat-suggestion" onClick={() => { sendMessage(s); }}>
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
            <div className="bubble-content markdown-body">
              {msg.role === 'assistant'
                ? renderMarkdown(msg.content)
                : <p>{msg.content}</p>
              }
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
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader size={18} className="spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
