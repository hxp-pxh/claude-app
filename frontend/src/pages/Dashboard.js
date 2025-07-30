import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Building, Calendar, TrendingUp, UserCheck, CalendarDays, DollarSign } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(res => res.data)
  });

  const { data: analytics } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => api.get('/dashboard/analytics').then(res => res.data),
    enabled: stats && (stats.total_members > 0 || stats.total_resources > 0)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Members',
      value: stats?.total_members || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      href: '/members'
    },
    {
      name: 'Active Members',
      value: stats?.active_members || 0,
      icon: UserCheck,
      color: 'text-green-600',
      bg: 'bg-green-100',
      href: '/members'
    },
    {
      name: 'Resources',
      value: stats?.total_resources || 0,
      icon: Building,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      href: '/resources'
    },
    {
      name: 'Today\'s Bookings',
      value: stats?.today_bookings || 0,
      icon: Calendar,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      href: '/bookings'
    },
    {
      name: 'Current Check-ins',
      value: stats?.current_checkins || 0,
      icon: UserCheck,
      color: 'text-cyan-600',
      bg: 'bg-cyan-100',
      href: '/checkin'
    },
    {
      name: 'Upcoming Events',
      value: stats?.upcoming_events || 0,
      icon: CalendarDays,
      color: 'text-pink-600',
      bg: 'bg-pink-100',
      href: '/events'
    },
    {
      name: 'Monthly Revenue',
      value: `$${stats?.monthly_revenue || 0}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      href: '/bookings'
    },
    {
      name: 'Growth',
      value: '+12%',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
      href: '/dashboard'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your coworking space management dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Bookings
            </h3>
            {stats?.recent_bookings?.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {stats.recent_bookings.map((booking, index) => (
                    <li key={booking.id}>
                      <div className="relative pb-8">
                        {index !== stats.recent_bookings.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <Calendar className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                New booking{' '}
                                <span className="font-medium text-gray-900">
                                  {booking.resource_id.substring(0, 8)}...
                                </span>
                                {booking.total_cost && (
                                  <span className="text-green-600 font-medium">
                                    {' '}• ${booking.total_cost}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {format(new Date(booking.created_at), 'MMM d, HH:mm')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent bookings</p>
            )}
          </div>
        </div>

        {/* Resource Usage Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Popular Resources
            </h3>
            {analytics?.resource_usage?.length > 0 ? (
              <div className="space-y-3">
                {analytics.resource_usage.slice(0, 5).map((resource, index) => (
                  <div key={resource._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-900">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Resource {resource._id.substring(0, 8)}...
                        </p>
                        <p className="text-sm text-gray-500">
                          {Math.round(resource.total_hours)} hours used
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {resource.bookings} bookings
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No usage data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/bookings"
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Calendar className="mx-auto h-8 w-8 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                New Booking
              </span>
            </Link>
            
            <Link
              to="/events"
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <CalendarDays className="mx-auto h-8 w-8 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Create Event
              </span>
            </Link>
            
            <Link
              to="/checkin"
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <UserCheck className="mx-auto h-8 w-8 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Check In
              </span>
            </Link>

            <Link
              to="/community"
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Users className="mx-auto h-8 w-8 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Browse Community
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;