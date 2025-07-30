import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, MapPin, LogIn, LogOut, Users, Calendar } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

const CheckIn = () => {
  const queryClient = useQueryClient();
  const [selectedResource, setSelectedResource] = useState('');

  const { data: currentCheckIn } = useQuery({
    queryKey: ['currentCheckIn'],
    queryFn: () => api.get('/checkin/current').then(res => res.data),
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['resources'],
    queryFn: () => api.get('/resources').then(res => res.data)
  });

  const checkInMutation = useMutation({
    mutationFn: (resourceId) => api.post('/checkin', { 
      resource_id: resourceId || undefined 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentCheckIn']);
      queryClient.invalidateQueries(['dashboard-stats']);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => api.post('/checkout'),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentCheckIn']);
      queryClient.invalidateQueries(['dashboard-stats']);
    },
  });

  const handleCheckIn = () => {
    checkInMutation.mutate(selectedResource);
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate();
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getResourceName = (resourceId) => {
    const resource = resources.find(r => r.id === resourceId);
    return resource ? resource.name : 'General Space';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Current Status */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Check-In Status</h2>
        </div>
        
        <div className="p-6">
          {currentCheckIn?.checked_in ? (
            <div className="space-y-4">
              {/* Checked In Status */}
              <div className="flex items-center justify-center p-6 bg-green-50 rounded-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogIn className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-green-900 mb-2">
                    You're Checked In!
                  </h3>
                  <p className="text-green-700">
                    Duration: {formatDuration(currentCheckIn.duration_minutes)}
                  </p>
                </div>
              </div>

              {/* Check-in Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Check-in Time</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(currentCheckIn.checkin.check_in_time), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  {currentCheckIn.checkin.resource_id && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">
                          {getResourceName(currentCheckIn.checkin.resource_id)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Check Out Button */}
              <div className="text-center">
                <button
                  onClick={handleCheckOut}
                  disabled={checkOutMutation.isLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  {checkOutMutation.isLoading ? 'Checking Out...' : 'Check Out'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Not Checked In Status */}
              <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogOut className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Check In?
                  </h3>
                  <p className="text-gray-600">
                    Let us know you're here and start using the space
                  </p>
                </div>
              </div>

              {/* Resource Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a space (optional)
                </label>
                <select
                  value={selectedResource}
                  onChange={(e) => setSelectedResource(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">General Space</option>
                  {resources.filter(r => r.type !== 'building' && r.type !== 'floor').map(resource => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} ({resource.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Check In Button */}
              <div className="text-center">
                <button
                  onClick={handleCheckIn}
                  disabled={checkInMutation.isLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  {checkInMutation.isLoading ? 'Checking In...' : 'Check In'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Activity</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-blue-900">Members Here</p>
            <p className="text-2xl font-bold text-blue-600">--</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-900">Active Bookings</p>
            <p className="text-2xl font-bold text-green-600">--</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-purple-900">Your Hours</p>
            <p className="text-2xl font-bold text-purple-600">
              {currentCheckIn?.checked_in ? formatDuration(currentCheckIn.duration_minutes) : '0h 0m'}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <LogIn className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              How Check-In Works
            </h3>
            <div className="text-sm text-blue-800">
              <ul className="list-disc list-inside space-y-1">
                <li>Check in when you arrive at the space</li>
                <li>Optionally select a specific area you'll be using</li>
                <li>Your time will be tracked automatically</li>
                <li>Remember to check out when you leave</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;