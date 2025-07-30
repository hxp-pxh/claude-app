import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Clock, Users, MapPin } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format, addHours, startOfHour } from 'date-fns';

const CreateBookingModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    resource_id: '',
    start_time: '',
    end_time: '',
    attendees: 1,
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: resources = [] } = useQuery({
    queryKey: ['resources'],
    queryFn: () => api.get('/resources').then(res => res.data)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        attendees: parseInt(formData.attendees),
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString()
      };

      await api.post('/bookings', data);
      onSuccess();
      onClose();
      setFormData({
        resource_id: '',
        start_time: '',
        end_time: '',
        attendees: 1,
        notes: ''
      });
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Set default times (next hour, 1 hour duration)
  React.useEffect(() => {
    if (isOpen && !formData.start_time) {
      const now = new Date();
      const nextHour = addHours(startOfHour(now), 1);
      const endTime = addHours(nextHour, 1);
      
      setFormData(prev => ({
        ...prev,
        start_time: format(nextHour, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(endTime, "yyyy-MM-dd'T'HH:mm")
      }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Booking</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Resource</label>
            <select
              required
              value={formData.resource_id}
              onChange={(e) => setFormData({...formData, resource_id: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a resource</option>
              {resources.filter(r => r.is_bookable).map(resource => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} ({resource.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="datetime-local"
              required
              value={formData.start_time}
              onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input
              type="datetime-local"
              required
              value={formData.end_time}
              onChange={(e) => setFormData({...formData, end_time: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Attendees</label>
            <input
              type="number"
              min="1"
              required
              value={formData.attendees}
              onChange={(e) => setFormData({...formData, attendees: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional notes or requirements..."
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Bookings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings').then(res => res.data)
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['resources'],
    queryFn: () => api.get('/resources').then(res => res.data)
  });

  const getResourceName = (resourceId) => {
    const resource = resources.find(r => r.id === resourceId);
    return resource ? resource.name : 'Unknown Resource';
  };

  const handleCreateSuccess = () => {
    queryClient.invalidateQueries(['bookings']);
    queryClient.invalidateQueries(['dashboard-stats']);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sortedBookings = bookings.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  const upcomingBookings = sortedBookings.filter(b => new Date(b.start_time) > new Date());
  const pastBookings = sortedBookings.filter(b => new Date(b.start_time) <= new Date());

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage resource bookings and reservations
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </button>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Upcoming Bookings ({upcomingBookings.length})
          </h3>
          
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">
                          {getResourceName(booking.resource_id)}
                        </h4>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {format(new Date(booking.start_time), 'MMM d, yyyy h:mm a')} -
                          {format(new Date(booking.end_time), 'h:mm a')}
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {booking.attendees} attendee{booking.attendees !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                      {booking.total_cost && (
                        <span className="text-sm font-medium text-gray-900">
                          ${booking.total_cost.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  {booking.notes && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                      {booking.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming bookings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first booking to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Past Bookings ({pastBookings.length})
            </h3>
            
            <div className="space-y-4">
              {pastBookings.slice(0, 10).map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">
                          {getResourceName(booking.resource_id)}
                        </h4>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {format(new Date(booking.start_time), 'MMM d, yyyy h:mm a')} -
                          {format(new Date(booking.end_time), 'h:mm a')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        completed
                      </span>
                      {booking.total_cost && (
                        <span className="text-sm font-medium text-gray-900">
                          ${booking.total_cost.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CreateBookingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Bookings;