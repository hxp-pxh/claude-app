import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useTenant } from '../contexts/TenantContext';
import { AdminCard, AdminBadge, AdminLoading, AdminEmptyState } from '../components/admin/AdminComponents';
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp,
  UserPlus,
  DollarSign,
  Clock,
  Star,
  CheckCircle,
  BarChart3,
  Activity,
  ArrowUpRight,
  AlertCircle,
  Globe,
  Settings,
  PlusCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { 
    translateTerm, 
    translateObject, 
    getDashboardConfig, 
    getColorScheme,
    getModuleInfo,
    loading: moduleLoading 
  } = useTenant();
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-enhanced'],
    queryFn: () => api.get('/dashboard/enhanced').then(res => res.data)
  });

  const dashboardConfig = getDashboardConfig();
  const colorScheme = getColorScheme();
  const moduleInfo = getModuleInfo();

  // Extract and translate stats from the enhanced dashboard response
  const stats = dashboardData ? translateObject({
    total_users: dashboardData.total_users || 0,
    total_pages: dashboardData.total_pages || 0,
    total_bookings: dashboardData.total_bookings || 0,
    total_revenue: dashboardData.total_revenue || 0,
    total_leads: dashboardData.total_leads || 0,
    total_forms: dashboardData.total_forms || 0,
    active_users: dashboardData.active_users || 0,
    conversion_rate: dashboardData.conversion_rate || 0
  }) : {};

  // AdminJS-inspired dashboard metrics
  const metricsConfig = [
    {
      title: translateTerm('Total Members'),
      value: stats.total_users || 0,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500',
      href: '/members'
    },
    {
      title: translateTerm('Active Pages'),
      value: stats.total_pages || 0,
      change: '+3',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-green-500',
      href: '/cms/pages'
    },
    {
      title: translateTerm('Monthly Revenue'),
      value: `$${(stats.total_revenue || 0).toLocaleString()}`,
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-emerald-500',
      href: '/analytics'
    },
    {
      title: translateTerm('Active Bookings'),
      value: stats.total_bookings || 0,
      change: '+8%',
      changeType: 'positive',
      icon: Calendar,
      color: 'bg-purple-500',
      href: '/bookings'
    }
  ];

  // Quick actions based on module
  const quickActions = [
    {
      name: translateTerm('Create Page'),
      description: 'Add a new page to your website',
      href: '/cms/pages/new',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      name: translateTerm('Add Member'),
      description: 'Invite a new member to join',
      href: '/members/new',
      icon: UserPlus,
      color: 'bg-green-500'
    },
    {
      name: translateTerm('View Analytics'),
      description: 'Check performance metrics',
      href: '/analytics',
      icon: BarChart3,
      color: 'bg-orange-500'
    },
    {
      name: translateTerm('Site Settings'),
      description: 'Configure your platform',
      href: '/settings',
      icon: Settings,
      color: 'bg-gray-500'
    }
  ];

  if (isLoading || moduleLoading) {
    return <AdminLoading message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* AdminJS-style Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {translateTerm('Dashboard')}
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Welcome back to {moduleInfo?.name || 'your admin panel'}
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
            All systems operational
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Last updated: {format(new Date(), 'MMM d, yyyy HH:mm')}
          </div>
        </div>
      </div>

      {/* Key Metrics - AdminJS Card Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsConfig.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Link key={index} to={metric.href} className="group">
              <AdminCard className="hover:shadow-lg transition-all duration-200 group-hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {metric.value}
                    </p>
                    <div className={`flex items-center text-sm ${
                      metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      {metric.change} from last month
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${metric.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
              </AdminCard>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <AdminCard
            title="Quick Actions"
            description="Commonly used features and shortcuts"
            actions={
              <Link to="/help" className="text-sm text-gray-500 hover:text-gray-700">
                View all
              </Link>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="group relative p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all duration-200 hover:bg-gray-50"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                          {action.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </AdminCard>
        </div>

        {/* Activity Feed */}
        <div>
          <AdminCard
            title="Recent Activity"
            description="Latest updates and changes"
            actions={
              <Link to="/activity" className="text-sm text-gray-500 hover:text-gray-700">
                View all
              </Link>
            }
          >
            <div className="space-y-4">
              {dashboardData?.recent_activity ? (
                dashboardData.recent_activity.slice(0, 6).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <AdminEmptyState
                  icon={Activity}
                  title="No recent activity"
                  description="Activity will appear here as your team uses the platform"
                />
              )}
            </div>
          </AdminCard>
        </div>
      </div>

      {/* System Status & Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminCard title="System Health">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Website</span>
              </div>
              <AdminBadge variant="success">Online</AdminBadge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Database</span>
              </div>
              <AdminBadge variant="success">Healthy</AdminBadge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Email Service</span>
              </div>
              <AdminBadge variant="warning">Limited</AdminBadge>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Storage Usage">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Images & Media</span>
                <span className="text-sm font-medium">2.3 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: '45%',
                    backgroundColor: colorScheme.primary 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">45% of 5 GB used</p>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <Link 
                to="/storage" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Manage storage →
              </Link>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Performance Metrics">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Page Load Time</span>
              <AdminBadge variant="success">1.2s</AdminBadge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <AdminBadge variant="success">99.9%</AdminBadge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <AdminBadge variant="success">120ms</AdminBadge>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <Link 
                to="/analytics" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View detailed analytics →
              </Link>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
};

export default AdminDashboard;