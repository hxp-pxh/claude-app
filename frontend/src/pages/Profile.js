import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, MapPin, Briefcase, Globe, Linkedin, Phone, Edit3, Save, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: user?.profile?.bio || '',
    company: user?.profile?.company || '',
    job_title: user?.profile?.job_title || '',
    skills: user?.profile?.skills?.join(', ') || '',
    interests: user?.profile?.interests?.join(', ') || '',
    linkedin: user?.profile?.linkedin || '',
    website: user?.profile?.website || '',
    phone: user?.profile?.phone || '',
    looking_for: user?.profile?.looking_for || '',
    open_to_connect: user?.profile?.open_to_connect ?? true
  });

  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => api.put('/users/me/profile', {
      profile: {
        ...profileData,
        skills: profileData.skills ? profileData.skills.split(',').map(s => s.trim()) : [],
        interests: profileData.interests ? profileData.interests.split(',').map(s => s.trim()) : []
      }
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data);
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      bio: user?.profile?.bio || '',
      company: user?.profile?.company || '',
      job_title: user?.profile?.job_title || '',
      skills: user?.profile?.skills?.join(', ') || '',
      interests: user?.profile?.interests?.join(', ') || '',
      linkedin: user?.profile?.linkedin || '',
      website: user?.profile?.website || '',
      phone: user?.profile?.phone || '',
      looking_for: user?.profile?.looking_for || '',
      open_to_connect: user?.profile?.open_to_connect ?? true
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user?.first_name} {user?.last_name}
                </h1>
                <p className="text-blue-100 capitalize">
                  {user?.membership_tier} Member • {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isLoading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updateProfileMutation.isLoading ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Bio Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-600">
                {user?.profile?.bio || 'No bio available'}
              </p>
            )}
          </div>

          {/* Professional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Professional</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your company"
                    />
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {user?.profile?.company || 'Not specified'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.job_title}
                      onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your job title"
                    />
                  ) : (
                    <div className="text-gray-600">
                      {user?.profile?.job_title || 'Not specified'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Contact</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your phone number"
                    />
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {user?.profile?.phone || 'Not specified'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://yourwebsite.com"
                    />
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <Globe className="h-4 w-4 mr-2" />
                      {user?.profile?.website ? (
                        <a 
                          href={user.profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {user.profile.website}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <Linkedin className="h-4 w-4 mr-2" />
                      {user?.profile?.linkedin ? (
                        <a 
                          href={user.profile.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills and Interests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Skills</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="React, Node.js, Design, etc."
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user?.profile?.skills?.length > 0 ? 
                    user.profile.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    )) : (
                      <span className="text-gray-500">No skills added</span>
                    )
                  }
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Interests</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({...formData, interests: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Technology, Startups, Music, etc."
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user?.profile?.interests?.length > 0 ? 
                    user.profile.interests.map((interest, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        {interest}
                      </span>
                    )) : (
                      <span className="text-gray-500">No interests added</span>
                    )
                  }
                </div>
              )}
            </div>
          </div>

          {/* Looking For & Networking */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Looking For</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.looking_for}
                onChange={(e) => setFormData({...formData, looking_for: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Collaboration opportunities, networking, mentorship, etc."
              />
            ) : (
              <p className="text-gray-600">
                {user?.profile?.looking_for || 'Not specified'}
              </p>
            )}
          </div>

          {/* Networking Preferences */}
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <input
                  type="checkbox"
                  id="open_to_connect"
                  checked={formData.open_to_connect}
                  onChange={(e) => setFormData({...formData, open_to_connect: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="open_to_connect" className="text-sm text-gray-700">
                  Show my profile in the member directory
                </label>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${user?.profile?.open_to_connect ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {user?.profile?.open_to_connect ? 'Open to connect' : 'Not available for networking'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;