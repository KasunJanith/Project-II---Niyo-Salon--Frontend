import { useState, useEffect } from 'react';
import { 
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  AlertCircleIcon,
  CalendarIcon,
  XCircleIcon,
  MailIcon
} from 'lucide-react';
import { useAlert } from '../../../hooks/useAlert';
import AlertBox from '../../../components/ui/AlertBox';

interface Notification {
  id: string;
  type: 'appointment' | 'update' | 'cancellation' | 'assignment' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedId?: string; // appointment ID or service ID
}

type FilterType = 'all' | 'unread' | 'appointment' | 'system';

const StaffNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  
  const { alert, showSuccess, showError, hideAlert } = useAlert();

  const filterNotifications = () => {
    let filtered = notifications;

    switch (selectedFilter) {
      case 'unread':
        filtered = notifications.filter(n => !n.isRead);
        break;
      case 'appointment':
        filtered = notifications.filter(n => n.type === 'appointment' || n.type === 'update' || n.type === 'cancellation');
        break;
      case 'system':
        filtered = notifications.filter(n => n.type === 'system' || n.type === 'assignment');
        break;
      default:
        filtered = notifications;
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setFilteredNotifications(filtered);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, selectedFilter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from backend first
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/staff/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const backendNotifications = await response.json();
          setNotifications(backendNotifications);
          return;
        }
      } catch (backendError) {
        console.log('Backend not available, using mock data:', backendError);
      }

      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'appointment',
          title: 'New Appointment Assigned',
          message: 'You have been assigned a new appointment with Sarah Johnson for Hair Cut on Dec 28, 2024 at 2:00 PM.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          isRead: false,
          priority: 'high',
          relatedId: 'apt-001'
        },
        {
          id: '2',
          type: 'update',
          title: 'Appointment Time Changed',
          message: 'Appointment with Michael Chen has been rescheduled from 3:00 PM to 4:00 PM today.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          isRead: false,
          priority: 'medium',
          relatedId: 'apt-002'
        },
        {
          id: '3',
          type: 'cancellation',
          title: 'Appointment Cancelled',
          message: 'Jessica Williams has cancelled her appointment scheduled for today at 11:00 AM.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          isRead: true,
          priority: 'medium',
          relatedId: 'apt-003'
        },
        {
          id: '4',
          type: 'assignment',
          title: 'New Service Assigned',
          message: 'Admin has assigned you a new service: "Premium Hair Styling". You can now accept bookings for this service.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          isRead: true,
          priority: 'low',
          relatedId: 'srv-001'
        },
        {
          id: '5',
          type: 'system',
          title: 'Schedule Updated',
          message: 'Your working hours have been updated for next week. Please check your schedule.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          isRead: true,
          priority: 'low'
        },
        {
          id: '6',
          type: 'appointment',
          title: 'Appointment Reminder',
          message: 'You have 3 appointments scheduled for tomorrow. Please review your schedule.',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          isRead: true,
          priority: 'low'
        }
      ];

    setNotifications(mockNotifications);
  } catch (err) {
    setError('Failed to load notifications');
    console.error('Error loading notifications:', err);
  } finally {
    setLoading(false);
  }
};  const markAsRead = async (notificationId: string) => {
    try {
      // Update locally
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );
      setNotifications(updatedNotifications);

      // Try to update backend
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:8080/api/staff/notifications/${notificationId}/read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (backendError) {
        console.log('Backend update failed, updated locally:', backendError);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
      setNotifications(updatedNotifications);

      // Try to update backend
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:8080/api/staff/notifications/mark-all-read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (backendError) {
        console.log('Backend update failed, updated locally:', backendError);
      }

      showSuccess('Success!', 'All notifications have been marked as read.');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showError('Update Failed', 'Failed to mark notifications as read. Please try again.');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <CalendarIcon size={20} className="text-blue-400" />;
      case 'update':
        return <ClockIcon size={20} className="text-yellow-400" />;
      case 'cancellation':
        return <XCircleIcon size={20} className="text-red-400" />;
      case 'assignment':
        return <UserIcon size={20} className="text-green-400" />;
      case 'system':
        return <MailIcon size={20} className="text-purple-400" />;
      default:
        return <BellIcon size={20} className="text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/50 bg-red-500/5';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/5';
      case 'low':
        return 'border-gray-500/50 bg-gray-500/5';
      default:
        return 'border-gray-700';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const appointmentCount = notifications.filter(n => n.type === 'appointment' || n.type === 'update' || n.type === 'cancellation').length;
  const systemCount = notifications.filter(n => n.type === 'system' || n.type === 'assignment').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-gray-400 mt-1">Stay updated with your appointments and assignments</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-[#F7BF24] text-black rounded-lg hover:bg-[#F7BF24]/80 transition-colors text-sm font-medium"
          >
            Mark All Read
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircleIcon size={20} className="text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <BellIcon size={24} className="text-blue-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{notifications.length}</h3>
          <p className="text-gray-400 font-medium">Total Notifications</p>
        </div>

        <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-500/10">
              <MailIcon size={24} className="text-red-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{unreadCount}</h3>
          <p className="text-gray-400 font-medium">Unread</p>
        </div>

        <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <CalendarIcon size={24} className="text-green-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{appointmentCount}</h3>
          <p className="text-gray-400 font-medium">Appointment Related</p>
        </div>

        <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <UserIcon size={24} className="text-purple-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{systemCount}</h3>
          <p className="text-gray-400 font-medium">System Updates</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Filter Notifications</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'appointment', label: 'Appointments', count: appointmentCount },
            { key: 'system', label: 'System', count: systemCount }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSelectedFilter(option.key as FilterType)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFilter === option.key
                  ? 'bg-[#F7BF24] text-black'
                  : 'bg-[#232323] text-gray-300 hover:bg-[#2a2a2a]'
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-[#181818] rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {selectedFilter === 'all' ? 'All Notifications' :
             selectedFilter === 'unread' ? 'Unread Notifications' :
             selectedFilter === 'appointment' ? 'Appointment Notifications' :
             'System Notifications'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {filteredNotifications.length} notification(s)
          </p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7BF24]"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <BellIcon size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No notifications found</p>
              <p className="text-gray-500 text-sm">
                {selectedFilter === 'unread' ? 'All notifications have been read' : 'No notifications to display'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg p-4 border transition-colors cursor-pointer ${
                    notification.isRead
                      ? 'bg-[#232323] border-gray-700'
                      : `bg-[#2a2a2a] ${getPriorityColor(notification.priority)}`
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${
                      notification.isRead ? 'bg-gray-600/20' : 'bg-gray-500/10'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className={`font-semibold ${
                              notification.isRead ? 'text-gray-300' : 'text-white'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-[#F7BF24] rounded-full"></div>
                            )}
                          </div>
                          <p className={`mt-1 text-sm ${
                            notification.isRead ? 'text-gray-500' : 'text-gray-300'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notification.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {notification.priority} priority
                            </span>
                          </div>
                        </div>
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <CheckCircleIcon size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Alert Box */}
      <AlertBox
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={hideAlert}
        autoClose={true}
        autoCloseDelay={3000}
      />
    </div>
  );
};

export default StaffNotifications;
