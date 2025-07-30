import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Briefcase, Globe, Linkedin, Users, Filter } from 'lucide-react';
import api from '../services/api';

const Community = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [interestFilter, setInterestFilter] = useState('');
  
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['memberDirectory'],
    queryFn: () => api.get('/users/directory').then(res => res.data)
  });

  // Get unique skills and interests for filtering
  const allSkills = [...new Set(members.flatMap(m => m.profile?.skills || []))];
  const allInterests = [...new Set(members.flatMap(m => m.profile?.interests || []))];

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.profile?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.profile?.job_title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSkill = !skillFilter || member.profile?.skills?.includes(skillFilter);
    const matchesInterest = !interestFilter || member.profile?.interests?.includes(interestFilter);

    return matchesSearch && matchesSkill && matchesInterest;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Member Directory</h1>
        <p className="mt-1 text-sm text-gray-600">
          Connect with other members in your coworking community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Skills</option>
              {allSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={interestFilter}
              onChange={(e) => setInterestFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Interests</option>
              {allInterests.map(interest => (
                <option key={interest} value={interest}>{interest}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-white">
                    {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {member.first_name} {member.last_name}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {member.membership_tier} Member
                  </p>
                </div>
              </div>

              {/* Professional Info */}
              {(member.profile?.job_title || member.profile?.company) && (
                <div className="mb-4">
                  {member.profile?.job_title && (
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {member.profile.job_title}
                    </div>
                  )}
                  {member.profile?.company && (
                    <div className="text-sm text-gray-600 ml-6">
                      at {member.profile.company}
                    </div>
                  )}
                </div>
              )}

              {/* Bio */}
              {member.profile?.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {member.profile.bio}
                </p>
              )}

              {/* Looking For */}
              {member.profile?.looking_for && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Looking for:</p>
                  <p className="text-sm text-gray-600">{member.profile.looking_for}</p>
                </div>
              )}

              {/* Skills */}
              {member.profile?.skills && member.profile.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {member.profile.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.profile.skills.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        +{member.profile.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Interests */}
              {member.profile?.interests && member.profile.interests.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Interests:</p>
                  <div className="flex flex-wrap gap-1">
                    {member.profile.interests.slice(0, 3).map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                      >
                        {interest}
                      </span>
                    ))}
                    {member.profile.interests.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        +{member.profile.interests.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  {member.profile?.linkedin && (
                    <a
                      href={member.profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {member.profile?.website && (
                    <a
                      href={member.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                </div>
                
                <button className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium transition-colors">
                  Connect
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || skillFilter || interestFilter
              ? 'Try adjusting your search criteria.'
              : 'No members have made their profiles public yet.'
            }
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Community Stats</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{members.length}</div>
            <div className="text-sm text-blue-900">Active Members</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{allSkills.length}</div>
            <div className="text-sm text-green-900">Unique Skills</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{allInterests.length}</div>
            <div className="text-sm text-purple-900">Shared Interests</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;