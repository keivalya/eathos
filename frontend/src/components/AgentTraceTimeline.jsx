import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Loader } from 'lucide-react';
import './AgentTraceTimeline.css';

const STATUS_CONFIG = {
  pending:  { dot: 'dot-pending',  icon: null },
  active:   { dot: 'dot-active',   icon: <Loader size={12} className="spin-icon" /> },
  complete: { dot: 'dot-complete',  icon: <Check size={12} /> },
  error:    { dot: 'dot-error',    icon: null },
};

export default function AgentTraceTimeline({ steps }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`timeline-container ${collapsed ? 'collapsed' : ''}`} id="agent-trace">
      <button
        className="timeline-header"
        onClick={() => setCollapsed(!collapsed)}
        id="timeline-toggle"
      >
        <span className="timeline-title">
          <span className="timeline-icon">🔬</span>
          Agent Activity
        </span>
        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>

      {!collapsed && (
        <div className="timeline-steps">
          {steps.map((step, i) => {
            const config = STATUS_CONFIG[step.status] || STATUS_CONFIG.pending;
            const isLast = i === steps.length - 1;
            return (
              <div key={step.id} className={`timeline-step status-${step.status}`}>
                <div className="step-indicator">
                  <div className={`step-dot ${config.dot}`}>
                    {config.icon}
                  </div>
                  {!isLast && <div className="step-line" />}
                </div>
                <div className="step-content">
                  <span className="step-name">{step.name}</span>
                  {step.summary && (
                    <span className="step-summary">{step.summary}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
