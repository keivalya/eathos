import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Camera, BarChart3, User } from 'lucide-react';
import './BottomNav.css';

const NAV_ITEMS = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/scan', icon: Camera, label: 'Scan' },
  { path: '/tracker', icon: BarChart3, label: 'Tracker' },
  { path: '/recap', icon: User, label: 'Me' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => {
        const isActive = location.pathname === item.path ||
          (item.path === '/scan' && ['/scan', '/inventory', '/recipe'].includes(location.pathname));
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
