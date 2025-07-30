import React from 'react';
import { Calendar, Clock, User, Plus } from 'lucide-react';

const Tours = () => {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tours</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage tour schedules and bookings
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Tour Slot
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tour Management Coming Soon</h3>
          <p className="mt-1 text-sm text-gray-500">
            Tour scheduling and management features will be available in the next update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Tours;