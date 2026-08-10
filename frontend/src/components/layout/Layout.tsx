import * as React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import {
  Briefcase,
  Building2,
  Calendar,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
  FileSignature,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Jobs', path: '/jobs', icon: Briefcase },
    { label: 'Companies', path: '/companies', icon: Building2 },
    { label: 'Interviews', path: '/interviews', icon: Calendar },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'Templates', path: '/templates', icon: FileSignature },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-ios-bg-light dark:bg-ios-bg-dark text-neutral-800 dark:text-neutral-200">
      {/* Mobile Nav Drawer */}
      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative w-64 max-w-xs bg-white dark:bg-neutral-900 border-r border-ios-border-light dark:border-ios-border-dark p-6 flex flex-col z-50">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-bold tracking-tight text-ios-blue">
                KAZANA
              </span>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-3 px-4 h-11 rounded-ios-md text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-ios-blue text-white shadow-sm'
                        : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-ios-border-light dark:border-ios-border-dark flex flex-col gap-3">
              <div className="flex items-center gap-3 px-2">
                <Avatar name={user?.name || 'Guest'} size="sm" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    {user?.name || 'Guest'}
                  </span>
                  <span className="text-[10px] text-neutral-500 truncate max-w-[150px]">
                    {user?.email}
                  </span>
                </div>
              </div>
              <Button variant="ghost" className="w-full gap-2 justify-start h-10 px-2" onClick={handleLogout}>
                <LogOut className="w-4 h-4 text-ios-red" />
                <span className="text-ios-red font-bold">Log Out</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md border-r border-ios-border-light dark:border-ios-border-dark p-6 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          {isSidebarOpen ? (
            <span className="text-xl font-bold tracking-tight text-ios-blue select-none">
              KAZANA
            </span>
          ) : (
            <span className="text-xl font-extrabold text-ios-blue mx-auto select-none">
              K
            </span>
          )}
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-ios-md text-sm font-semibold transition-all duration-200 ${
                  isSidebarOpen ? 'px-4 h-11' : 'justify-center w-11 h-11 mx-auto'
                } ${
                  isActive
                    ? 'bg-ios-blue text-white shadow-sm'
                    : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-ios-border-light dark:border-ios-border-dark flex flex-col gap-4">
          <div className={`flex items-center gap-3 ${isSidebarOpen ? 'px-2' : 'justify-center'}`}>
            <Avatar name={user?.name || 'Guest'} size="sm" />
            {isSidebarOpen ? (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  {user?.name || 'Guest'}
                </span>
                <span className="text-[10px] text-neutral-500 truncate max-w-[150px]">
                  {user?.email}
                </span>
              </div>
            ) : null}
          </div>
          <Button
            variant="ghost"
            className={`w-full gap-2 justify-start h-10 ${
              isSidebarOpen ? 'px-2' : 'justify-center px-0'
            }`}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 text-ios-red" />
            {isSidebarOpen ? <span className="text-ios-red font-bold">Log Out</span> : null}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-ios-border-light dark:border-ios-border-dark bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md px-6 flex items-center justify-between lg:justify-end">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-500 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>

          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 items-center justify-center text-neutral-500 focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
