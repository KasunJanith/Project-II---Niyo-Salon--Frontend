import React, { useState } from 'react';
import { BellIcon, XIcon } from 'lucide-react';
const NotificationBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  // Mock notification - in a real app, this would come from a notification system
  const hasNotifications = true;
  const notificationCount: number = 2;
  if (!isVisible || !hasNotifications) return null;
  return <div className="bg-purple-700 text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <BellIcon size={16} className="mr-2" />
          <span className="text-sm">
            You have {notificationCount} upcoming{' '}
            {notificationCount === 1 ? 'appointment' : 'appointments'} this week
          </span>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-white hover:text-gray-200 focus:outline-none" aria-label="Dismiss notification">
          <XIcon size={16} />
        </button>
      </div>
    </div>;
};
export default NotificationBar;