import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { adminClasses } from '../../styles/adminTheme';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  Settings,
  Globe,
  Building,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  Search,
  Home,
  Database,
  UserCog,
  Layers,
  BarChart3,
  Mail,
  HelpCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const AdminLayout = ({ children, level = 'tenant' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { moduleInfo, translateTerm } = useTenant();

  // Navigation configuration based on level
  const getNavigationItems = () => {
    if (level === 'saas') {
      return [
        { name: 'Dashboard', href: '/admin/saas/dashboard', icon: LayoutDashboard },
        { name: 'Tenants', href: '/admin/saas/tenants', icon: Building },
        { name: 'Users', href: '/admin/saas/users', icon: Users },
        { name: 'Analytics', href: '/admin/saas/analytics', icon: BarChart3 },
        { name: 'System', href: '/admin/saas/system', icon: Database },
        { name: 'Settings', href: '/admin/saas/settings', icon: Settings },
      ];
    } else if (level === 'tenant') {
      return [
        { name: translateTerm('Dashboard'), href: '/dashboard', icon: Home },
        { 
          name: translateTerm('Content Management'), 
          icon: FileText,
          children: [
            { name: translateTerm('Pages'), href: '/cms/pages' },
            { name: translateTerm('Forms'), href: '/forms' },
            { name: translateTerm('Leads'), href: '/leads' },
          ]
        },
        { name: translateTerm('Members'), href: '/members', icon: Users },
        { name: translateTerm('Bookings'), href: '/bookings', icon: Calendar },
        { name: translateTerm('Events'), href: '/events', icon: Calendar },
        { name: translateTerm('Community'), href: '/community', icon: MessageSquare },
        { name: translateTerm('Tours'), href: '/tours', icon: Globe },
        { name: translateTerm('Settings'), href: '/settings', icon: Settings },
      ];
    }
    return [];
  };

  const navigationItems = getNavigationItems();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActiveLink = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const SidebarItem = ({ item, depth = 0 }) => {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = hasChildren 
      ? item.children.some(child => isActiveLink(child.href))
      : isActiveLink(item.href);

    const itemClass = `
      group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors
      ${depth > 0 ? 'ml-6 pl-4' : ''}
      ${isActive 
        ? 'bg-primary-600 text-white' 
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      }
    `;

    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className={itemClass}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="flex-1 text-left">{item.name}</span>
            {expanded ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronRight className="ml-2 h-4 w-4" />
            )}
          </button>
          {expanded && (
            <div className="mt-1">
              {item.children.map((child, index) => (
                <Link
                  key={index}
                  to={child.href}
                  className={`
                    group flex items-center w-full px-3 py-2 ml-6 pl-8 text-sm font-medium rounded-md transition-colors
                    ${isActiveLink(child.href)
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link to={item.href} className={itemClass}>
        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transition-transform transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {level === 'saas' ? 'Claude Platform' : (moduleInfo?.name || 'Admin')}
                </h1>
                {level === 'tenant' && (
                  <p className="text-xs text-gray-400">{translateTerm('Management')}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item, index) => (
              <SidebarItem key={index} item={item} />
            ))}
          </nav>

          {/* User info */}
          <div className="flex-shrink-0 p-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Breadcrumb */}
              <nav className="hidden md:flex space-x-2 text-sm">
                <span className="text-gray-500">
                  {level === 'saas' ? 'Platform Admin' : moduleInfo?.name || 'Admin'}
                </span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900 font-medium">
                  {location.pathname.split('/').pop()?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'}
                </span>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Notifications */}
              <button className="relative text-gray-500 hover:text-gray-700">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Settings
                    </Link>
                    <Link
                      to="/help"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <HelpCircle className="w-4 h-4 inline mr-2" />
                      Help
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;