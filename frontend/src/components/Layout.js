import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { 
  Home, 
  Globe,
  FileText,
  Users,
  Calendar,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  UserPlus,
  BarChart3,
  Building,
  Bell,
  Image,
  Clipboard,
  CalendarCheck,
  CalendarPlus,
  Briefcase,
  MessageSquare,
  UserCheck,
  TrendingUp,
  CheckCircle,
  Star
} from 'lucide-react';

// Icon mapping for module navigation
const iconMap = {
  'home': Home,
  'globe': Globe,
  'file-text': FileText,
  'users': Users,
  'calendar': Calendar,
  'settings': SettingsIcon,
  'user-plus': UserPlus,
  'bar-chart': BarChart3,
  'building': Building,
  'bell': Bell,
  'image': Image,
  'clipboard': Clipboard,
  'calendar-check': CalendarCheck,
  'calendar-plus': CalendarPlus,
  'briefcase': Briefcase,
  'message-square': MessageSquare,
  'user-check': UserCheck,
  'trending-up': TrendingUp,
  'check-circle': CheckCircle,
  'star': Star,
  'user-group': Users
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { 
    getNavigation, 
    getModuleInfo, 
    getColorScheme, 
    translateTerm,
    loading: moduleLoading 
  } = useTenant();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Get module-specific navigation or fallback to default
  const moduleNavigation = getNavigation();
  const moduleInfo = getModuleInfo();
  const colorScheme = getColorScheme();
  
  // Fallback navigation if module hasn't loaded yet
  const defaultNavigation = [
    { name: 'Dashboard', path: '/dashboard', icon: 'home', roles: ['*'] },
    { name: 'Website', path: '/cms/pages', icon: 'globe', roles: ['*'] },
    { name: 'Forms', path: '/forms', icon: 'file-text', roles: ['*'] },
    { name: 'Leads', path: '/leads', icon: 'user-plus', roles: ['*'] },
    { name: 'Tours', path: '/tours', icon: 'calendar', roles: ['*'] },
    { name: 'Analytics', path: '/analytics', icon: 'bar-chart', roles: ['*'] },
    { name: 'Settings', path: '/settings', icon: 'settings', roles: ['*'] },
  ];

  const navigation = moduleNavigation.length > 0 ? moduleNavigation : defaultNavigation;

  // Filter navigation based on user role and module permissions
  const canAccess = (item) => {
    if (!user) return false;
    
    const userRole = user.role;
    const itemRoles = item.roles || ['*'];
    
    // Check if user role is allowed
    if (itemRoles.includes('*')) return true;
    if (itemRoles.includes(userRole)) return true;
    
    // Special case for members - only dashboard
    if (userRole === 'member') {
      return item.name.toLowerCase().includes('dashboard') || item.path === '/dashboard';
    }
    
    return false;
  };

  const filteredNavigation = navigation.filter(canAccess);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Dynamic styling based on module color scheme
  const dynamicStyles = {
    primary: colorScheme.primary,
    secondary: colorScheme.secondary,
    background: colorScheme.background,
    text: colorScheme.text
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: dynamicStyles.background }}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold" style={{ color: dynamicStyles.text }}>
            {moduleInfo.name}
          </h1>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {moduleLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: dynamicStyles.primary }}></div>
          </div>
        ) : (
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {filteredNavigation.map((item) => {
                const IconComponent = iconMap[item.icon] || Home;
                const itemPath = item.path || item.href; // Support both path and href
                return (
                  <li key={item.name}>
                    <Link
                      to={itemPath}
                      className={`
                        flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                        ${isActive(itemPath)
                          ? 'text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                      style={isActive(itemPath) ? { 
                        backgroundColor: dynamicStyles.primary,
                        color: 'white'
                      } : {}}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      {translateTerm(item.name)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: dynamicStyles.primary }}
              >
                <span className="text-white text-sm font-medium">
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium" style={{ color: dynamicStyles.text }}>
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {translateTerm(user?.role?.replace('_', ' '))}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6 text-gray-500" />
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {translateTerm('Welcome back')}, {user?.first_name}!
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;