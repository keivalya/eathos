import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './RestockAlert.css';

export default function RestockAlert({ lowItems = [] }) {
  const navigate = useNavigate();

  if (lowItems.length === 0) return null;

  return (
    <div className="restock-alert">
      <div className="restock-icon">
        <AlertTriangle size={18} />
      </div>
      <div className="restock-text">
        <strong>Running low:</strong> {lowItems.slice(0, 3).join(', ')}
        {lowItems.length > 3 && ` +${lowItems.length - 3} more`}
      </div>
      <button className="restock-action" onClick={() => navigate('/shopping')}>
        Review <ArrowRight size={14} />
      </button>
    </div>
  );
}
