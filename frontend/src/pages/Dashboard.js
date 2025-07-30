import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useTenant } from '../contexts/TenantContext';
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
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Dashboard = () => {
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
    total_leads: dashboardData.metrics?.total_leads || 0,
    new_leads_this_month: dashboardData.metrics?.new_leads_this_month || 0,
    total_pages: dashboardData.metrics?.total_pages || 0,
    total_forms: dashboardData.metrics?.total_forms || 0,
    upcoming_tours: dashboardData.metrics?.upcoming_tours || 0,
    conversion_rate: dashboardData.metrics?.conversion_rate || 0,
    recent_leads: dashboardData.metrics?.recent_leads || [],
    active_users: dashboardData.metrics?.active_users || 0,
    active_members: dashboardData.metrics?.active_members || 0,
    total_bookings: dashboardData.metrics?.total_bookings || 0,
    space_utilization: dashboardData.metrics?.space_utilization || 0,
    venue_revenue: dashboardData.metrics?.venue_revenue || 0,
    citizen_reservations: dashboardData.metrics?.citizen_reservations || 0
  }) : null;

  // Icon mapping for metrics
  const metricIcons = {
    users: Users,
    members: Users,
    citizens: Users,
    guests: Users,
    leads: UserPlus,
    prospects: UserPlus,
    inquiries: UserPlus,
    bookings: Calendar,
    reservations: Calendar,
    pages: FileText,
    forms: FileText,
    tours: Clock,
    revenue: DollarSign,
    utilization: BarChart3,
    satisfaction: Star,
    conversion: TrendingUp
  };

  const getMetricIcon = (metricName) => {
    const lowerName = metricName.toLowerCase();
    for (const [key, icon] of Object.entries(metricIcons)) {
      if (lowerName.includes(key)) return icon;
    }
    return TrendingUp;
  };

  if (isLoading || moduleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colorScheme.primary }}></div>
      </div>
    );
  }

  // Dynamic dashboard widgets based on module configuration
  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'community_stats':
      case 'facility_status':
      case 'revenue_summary':
        return (
          <div key={widget.title} className="bg-white rounded-lg shadow p-6" style={{ gridColumn: `span ${widget.position?.span || 1}` }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colorScheme.text }}>{translateTerm(widget.title)}</h3>
            <div className="grid grid-cols-1 gap-4">
              {widget.metrics?.map((metric) => {
                const value = stats?.[metric] || 0;
                const IconComponent = getMetricIcon(metric);
                return (
                  <div key={metric} className="flex items-center">
                    <IconComponent className="h-5 w-5 mr-3" style={{ color: colorScheme.primary }} />
                    <div>
                      <p className="text-sm text-gray-600">{translateTerm(metric.replace(/_/g, ' '))}</p>
                      <p className="text-xl font-bold" style={{ color: colorScheme.text }}>
                        {typeof value === 'number' && metric.includes('rate') ? `${value}%` : 
                         typeof value === 'number' && metric.includes('revenue') ? `$${value.toLocaleString()}` : 
                         value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 'booking_overview':
      case 'reservation_overview':
        return (
          <div key={widget.title} className="bg-white rounded-lg shadow p-6" style={{ gridColumn: `span ${widget.position?.span || 1}` }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colorScheme.text }}>{translateTerm(widget.title)}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{translateTerm("Today's bookings")}</span>
                <span className="font-bold" style={{ color: colorScheme.text }}>{stats?.total_bookings || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{translateTerm("Utilization Rate")}</span>
                <span className="font-bold" style={{ color: colorScheme.text }}>{stats?.space_utilization || 0}%</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Fallback dashboard if no module config is available
  const fallbackStats = [
    { name: translateTerm('Total Users'), value: stats?.active_users || stats?.active_members || stats?.citizen_reservations || 0, icon: Users, change: '+12%' },
    { name: translateTerm('Active Bookings'), value: stats?.total_bookings || 0, icon: Calendar, change: '+5%' },
    { name: translateTerm('Website Pages'), value: stats?.total_pages || 0, icon: FileText, change: '0%' },
    { name: translateTerm('Conversion Rate'), value: `${stats?.conversion_rate || 0}%`, icon: TrendingUp, change: '+8%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colorScheme.text }}>
            {translateTerm('Dashboard')}
          </h1>
          <p className="text-gray-600 mt-1">
            {translateTerm('Welcome to')} {moduleInfo.name}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fallbackStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold mt-2" style={{ color: colorScheme.text }}>{stat.value}</p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: `${colorScheme.primary}15` }}>
                  <IconComponent className="h-6 w-6" style={{ color: colorScheme.primary }} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-2">{translateTerm('from last month')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Module-specific Dashboard Widgets */}
      {dashboardConfig.widgets && dashboardConfig.widgets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {dashboardConfig.widgets.map(renderWidget)}
        </div>
      )}

      {/* Quick Actions */}
      {dashboardConfig.quick_actions && dashboardConfig.quick_actions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: colorScheme.text }}>
            {translateTerm('Quick Actions')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboardConfig.quick_actions.map((action) => {
              const IconComponent = getMetricIcon(action.name);
              return (
                <button
                  key={action.name}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  style={{ borderColor: `${colorScheme.primary}30` }}
                >
                  <IconComponent className="h-6 w-6 mb-2" style={{ color: colorScheme.primary }} />
                  <p className="text-sm font-medium" style={{ color: colorScheme.text }}>
                    {translateTerm(action.name)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats?.recent_leads && stats.recent_leads.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold" style={{ color: colorScheme.text }}>
              {translateTerm('Recent Leads')}
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recent_leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colorScheme.primary}15` }}>
                      <UserPlus className="h-4 w-4" style={{ color: colorScheme.primary }} />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: colorScheme.text }}>{lead.name}</p>
                      <p className="text-sm text-gray-500">{lead.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{translateTerm(lead.status)}</p>
                    <p className="text-xs text-gray-400">{format(new Date(lead.created_at), 'MMM d')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link 
                to="/leads" 
                className="text-sm font-medium hover:underline"
                style={{ color: colorScheme.primary }}
              >
                {translateTerm('View all leads')} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;