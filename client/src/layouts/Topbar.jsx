import { Link, useNavigate } from 'react-router-dom';
import { LogOutIcon, PlusIcon, SettingsIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QUICK_ADD } from '../data/navigation';
import { Dropdown } from '../components/common/Dropdown';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { toast } from '../components/common/Toast';
import { VehicleSwitcher } from './VehicleSwitcher';
import { NotificationsMenu } from './NotificationsMenu';

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="shrink-0 rounded-xl md:hidden" aria-label="CarLife dashboard">
          <Logo showText={false} />
        </Link>
        <VehicleSwitcher />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Dropdown
            className="hidden sm:block"
            items={[{ type: 'label', label: 'Add to active vehicle' }, ...QUICK_ADD.map((q) => ({ label: q.label, icon: q.icon, to: q.to }))]}
            trigger={(props) =>
            <Button {...props} size="sm" leftIcon={PlusIcon}>
                Add
              </Button>
            } />
          
          <NotificationsMenu />
          <Dropdown
            items={[
            { label: 'Profile', icon: UserIcon, to: '/profile' },
            { label: 'Settings', icon: SettingsIcon, to: '/settings' },
            { type: 'divider' },
            { label: 'Sign out', icon: LogOutIcon, danger: true, onSelect: signOut }]
            }
            trigger={(props) =>
            <button {...props} type="button" className="flex h-11 items-center rounded-full pl-1 pr-1 transition-colors duration-150 hover:bg-subtle" aria-label={`Account menu for ${user?.name || 'you'}`}>
                <Avatar name={user?.name} src={user?.avatar} size="sm" />
              </button>
            }>
            
            <div className="border-b border-line px-3 pb-2.5 pt-2">
              <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
              <p className="truncate text-xs text-ink-muted">{user?.email}</p>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>);

}