import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, notifyNewMatches: boolean) => void;
  currentFilters: any; // We'll type this properly based on your filter structure
}

const SaveSearchModal = ({
  isOpen,
  onClose,
  onSave,
  currentFilters,
}: SaveSearchModalProps) => {
  const [searchName, setSearchName] = useState('');
  const [notifyNewMatches, setNotifyNewMatches] = useState(true);

  const handleSave = () => {
    onSave(searchName, notifyNewMatches);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Save Search</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Name
            </label>
            <input
              type="text"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              placeholder="e.g., 3 bed houses in London"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notifications"
              checked={notifyNewMatches}
              onChange={e => setNotifyNewMatches(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label
              htmlFor="notifications"
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <Bell className="h-4 w-4" />
              Notify me when new properties match this search
            </label>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={!searchName.trim()}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveSearchModal;
