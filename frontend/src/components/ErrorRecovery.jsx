import { WifiOff, RefreshCw, Plus, Camera, AlertCircle } from 'lucide-react';
import './ErrorRecovery.css';

const ERROR_CONFIGS = {
  upload_failed: {
    icon: Camera,
    title: "Couldn't process that image",
    message: "The photo may be too dark or blurry. Let's try again.",
    actions: [
      { label: 'Try a Different Photo', variant: 'primary', action: 'retry' },
      { label: 'Add Items Manually', variant: 'secondary', action: 'manual' },
    ],
  },
  zero_items: {
    icon: AlertCircle,
    title: 'No ingredients detected',
    message: "We couldn't spot any items. Try a well-lit photo of your fridge with doors open.",
    actions: [
      { label: 'Try a Different Photo', variant: 'primary', action: 'retry' },
      { label: 'Add Items Manually', variant: 'secondary', action: 'manual' },
    ],
  },
  recipe_failed: {
    icon: AlertCircle,
    title: 'Our chef is having a creative block',
    message: "We couldn't generate a recipe right now. Let's give it another shot.",
    actions: [
      { label: 'Try Again', variant: 'primary', action: 'retry' },
    ],
  },
  network: {
    icon: WifiOff,
    title: 'Connection lost',
    message: "We'll reconnect automatically. Your data is safe locally.",
    actions: [
      { label: 'Retry Now', variant: 'primary', action: 'retry' },
    ],
  },
  generic: {
    icon: AlertCircle,
    title: 'Something went wrong',
    message: "We hit an unexpected snag. Let's try again.",
    actions: [
      { label: 'Retry', variant: 'primary', action: 'retry' },
    ],
  },
};

export default function ErrorRecovery({ type = 'generic', onRetry, onManual, onDismiss }) {
  const config = ERROR_CONFIGS[type] || ERROR_CONFIGS.generic;
  const Icon = config.icon;

  const handleAction = (action) => {
    if (action === 'retry') onRetry?.();
    if (action === 'manual') onManual?.();
  };

  return (
    <div className={`error-recovery ${type === 'network' ? 'error-network' : ''}`}>
      <div className="error-recovery-icon">
        <Icon size={28} />
      </div>
      <h3>{config.title}</h3>
      <p>{config.message}</p>
      <div className="error-recovery-actions">
        {config.actions.map((a, i) => (
          <button key={i} className={`btn btn-${a.variant}`} onClick={() => handleAction(a.action)}>
            {a.action === 'retry' && <RefreshCw size={16} />}
            {a.action === 'manual' && <Plus size={16} />}
            {a.label}
          </button>
        ))}
      </div>
      {onDismiss && (
        <button className="error-dismiss" onClick={onDismiss}>Dismiss</button>
      )}
    </div>
  );
}
