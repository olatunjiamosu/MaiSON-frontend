import React from 'react';
import { Search, Trash2 } from 'lucide-react';

const SavedSearchesSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Saved Searches</h2>
          <p className="text-gray-500">Manage your saved property searches</p>
        </div>
      </div>

      {/* Saved Searches List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">No saved searches yet</p>
            <p className="text-sm mt-2">Your saved property searches will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedSearchesSection; 