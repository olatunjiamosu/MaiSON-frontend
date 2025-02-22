import React, { useState } from 'react';
import { 
  Bell,
  Eye,
  MessageCircle,
  Calendar,
  Heart,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'viewing' | 'message' | 'offer' | 'saved' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  propertyId?: string;
  propertyAddress?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'viewing',
    title: 'New Viewing Request',
    message: 'John Smith requested a viewing for 123 Park Avenue',
    timestamp: '10 minutes ago',
    read: false,
    propertyId: 'prop1',
    propertyAddress: '123 Park Avenue, London'
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'Sarah Johnson sent you a message about 45 Queen Street',
    timestamp: '1 hour ago',
    read: false,
    propertyId: 'prop2',
    propertyAddress: '45 Queen Street, London'
  },
  {
    id: '3',
    type: 'saved',
    title: 'Property Saved',
    message: 'Your property was saved by 3 new potential buyers',
    timestamp: '2 hours ago',
    read: true,
    propertyId: 'prop1',
    propertyAddress: '123 Park Avenue, London'
  },
  {
    id: '4',
    type: 'system',
    title: 'Market Update',
    message: 'Property prices in your area have increased by 2.5%',
    timestamp: '1 day ago',
    read: true
  },
  // Add more notifications...
];

const NotificationsSection = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const filteredNotifications = notifications.filter(notification =>
    selectedFilter === 'unread' ? !notification.read : true
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'viewing':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-emerald-600" />;
      case 'offer':
        return <PoundSterling className="h-5 w-5 text-purple-600" />;
      case 'saved':
        return <Heart className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-500">Stay updated with your property activity</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'unread')}
            className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread ({unreadCount})</option>
          </select>

          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-emerald-600 hover:text-emerald-700"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg border shadow-sm p-4 ${
              !notification.read ? 'border-l-4 border-l-emerald-500' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full ${
                !notification.read ? 'bg-emerald-50' : 'bg-gray-50'
              }`}>
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    <p className="text-gray-600">{notification.message}</p>
                    {notification.propertyAddress && (
                      <p className="text-sm text-gray-500 mt-1">
                        Property: {notification.propertyAddress}
                      </p>
                    )}
                    <p className="text-sm text-gray-400 mt-1">{notification.timestamp}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Delete notification"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notifications found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsSection; 