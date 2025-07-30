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

  const statCards = [
    {
      name: 'Total Leads',
      value: stats?.total_leads || 0,
      icon: UserPlus,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      href: '/leads'
    },
    {
      name: 'New This Month',
      value: stats?.new_leads_this_month || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100',
      href: '/leads'
    },
    {
      name: 'Published Pages',
      value: stats?.total_pages || 0,
      icon: Globe,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      href: '/cms/pages'
    },
    {
      name: 'Active Forms',
      value: stats?.total_forms || 0,
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      href: '/forms'
    },
    {
      name: 'Upcoming Tours',
      value: stats?.upcoming_tours || 0,
      icon: Calendar,
      color: 'text-cyan-600',
      bg: 'bg-cyan-100',
      href: '/tours'
    },
    {
      name: 'Conversion Rate',
      value: `${stats?.conversion_rate || 0}%`,
      icon: BarChart3,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
      href: '/analytics'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your space management platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <dt>
                <div className={`absolute ${item.bg} rounded-md p-3`}>
                  <Icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  {item.name}
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              </dd>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Leads
              </h3>
              <Link
                to="/leads"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
            
            {stats?.recent_leads?.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {lead.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lead.name}
                        </p>
                        <p className="text-sm text-gray-500">{lead.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                        lead.status === 'tour_completed' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'tour_scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(lead.created_at), 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent leads</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/cms/pages/new"
                className="flex flex-col items-center p-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors"
              >
                <Globe className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">New Page</span>
              </Link>
              
              <Link
                to="/forms/new"
                className="flex flex-col items-center p-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors"
              >
                <FileText className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">New Form</span>
              </Link>
              
              <Link
                to="/tours"
                className="flex flex-col items-center p-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors"
              >
                <Calendar className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Schedule Tour</span>
              </Link>
              
              <button className="flex flex-col items-center p-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                <Eye className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Preview Site</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Platform Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-lg mb-3">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-1">Website Builder</h4>
              <p className="text-sm text-gray-600">
                Create beautiful, responsive websites with our drag-and-drop builder
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-lg mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-1">Lead Management</h4>
              <p className="text-sm text-gray-600">
                Capture, nurture, and convert leads with our integrated CRM
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-purple-100 rounded-lg mb-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-1">Analytics</h4>
              <p className="text-sm text-gray-600">
                Track performance and optimize your space business
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;