import React, { useState } from 'react';
import { Bell, Home, Calendar, FileText, Settings, Check, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'property' | 'viewing' | 'application' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const NotificationsSection = () => {
  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'property',
      title: 'Price Reduction',
      message: '123 Park Avenue price has been reduced by £25,000',
      timestamp: '2 hours ago',
      isRead: false,
    },
    {
      id: '2',
      type: 'viewing',
      title: 'Viewing Confirmed',
      message: 'Your viewing for 45 Queen Street is confirmed for tomorrow at 2 PM',
      timestamp: '5 hours ago',
      isRead: false,
    },
    {
      id: '3',
      type: 'application',
      title: 'Document Required',
      message: 'Please upload your proof of income for your application',
      timestamp: '1 day ago',
      isRead: true,
    },
    {
      id: '4',
      type: 'system',
      title: 'New Feature Available',
      message: 'You can now schedule virtual viewings directly from the app',
      timestamp: '2 days ago',
      isRead: true,
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'property' | 'viewing' | 'application' | 'system'>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <Home className="h-5 w-5 text-emerald-600" />;
      case 'viewing':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'application':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.isRead;
    return notif.type === filter;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Stay updated with your property journey</p>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="property">Property Updates</option>
            <option value="viewing">Viewings</option>
            <option value="application">Applications</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg border p-4 flex items-start gap-4 transition-colors ${
              !notification.isRead ? 'border-emerald-200 bg-emerald-50' : ''
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                </div>
                <span className="text-sm text-gray-500">{notification.timestamp}</span>
              </div>
              
              {!notification.isRead && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="flex items-center text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark as read
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No notifications to show
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsSection;
