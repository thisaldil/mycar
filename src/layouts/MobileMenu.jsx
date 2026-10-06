import { NavLink, useNavigate } from 'react-router-dom';
import { LogOutIcon, UserIcon } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { NAV_GROUPS, NAV_ITEMS } from '../data/navigation';
import { Drawer } from '../components/common/Drawer';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { toast } from '../components/common/Toast';

function MenuLink({ item, onClose }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClose}
      className={({ isActive }) =>
      cn('flex h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors duration-150', isActive ? 'bg-brand-soft text-brand' : 'text-ink hover:bg-subtle')
      }>
      
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      {item.label}
    </NavLink>);

}

export function MobileMenu({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    onClose();
    await logout();
    toast.success('Signed out');
    navigate('/login', { replace: true });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="left"
      width="sm"
      title="Menu"
      footer={
      <Button variant="secondary" className="w-full" leftIcon={LogOutIcon} onClick={signOut}>
          Sign out
        </Button>
      }>
      
      <NavLink to="/profile" onClick={onClose} className="mb-5 flex items-center gap-3 rounded-2xl border border-line p-3 transition-colors duration-150 hover:bg-subtle">
        <Avatar name={user?.name} src={user?.avatar} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink">{user?.name}</span>
          <span className="block truncate text-sm text-ink-muted">{user?.email}</span>
        </span>
        <UserIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
      </NavLink>
      <nav aria-label="All sections" className="space-y-5">
        {NAV_GROUPS.map((group) =>
        <div key={group.id}>
            {group.label ? <p className="px-3 pb-1 text-xs font-medium text-ink-muted">{group.label}</p> : null}
            <ul>
              {group.items.map((item) =>
            <li key={item.to}>
                  <MenuLink item={item} onClose={onClose} />
                </li>
            )}
            </ul>
          </div>
        )}
        <ul className="border-t border-line pt-4">
          <li>
            <MenuLink item={NAV_ITEMS.settings} onClose={onClose} />
          </li>
        </ul>
      </nav>
    </Drawer>);

}