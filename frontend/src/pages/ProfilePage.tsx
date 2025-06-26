import React, { useState } from 'react';
import { UserIcon, CalendarIcon, BellIcon, SettingsIcon, LockIcon, CameraIcon } from 'lucide-react';
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('personal');
  // Mock user data
  const user = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, CA 12345',
    profileImage: null,
    joinDate: 'January 2023',
    preferredStaff: 'Jamie Rodriguez'
  };
  // Mock appointment history
  const appointmentHistory = [{
    id: 1,
    service: 'Haircut & Styling',
    staff: 'Jamie Rodriguez',
    date: 'June 1, 2023',
    time: '10:00 AM',
    status: 'completed',
    amount: '$30'
  }, {
    id: 2,
    service: 'Beard Trim',
    staff: 'Alex Kim',
    date: 'May 15, 2023',
    time: '2:30 PM',
    status: 'completed',
    amount: '$20'
  }, {
    id: 3,
    service: 'Custom Tattoo',
    staff: 'Taylor Morgan',
    date: 'April 28, 2023',
    time: '1:00 PM',
    status: 'completed',
    amount: '$150'
  }];
  // Mock notification settings
  const notificationSettings = [{
    id: 'email_appt',
    label: 'Email appointment reminders',
    checked: true
  }, {
    id: 'sms_appt',
    label: 'SMS appointment reminders',
    checked: true
  }, {
    id: 'email_promo',
    label: 'Email promotions and news',
    checked: false
  }, {
    id: 'sms_promo',
    label: 'SMS promotions and news',
    checked: false
  }];
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Profile</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-20">
            <div className="p-6 text-center border-b border-gray-200">
              <div className="relative inline-block mb-4">
                <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                  {user.profileImage ? <img src={user.profileImage} alt={user.name} className="h-24 w-24 rounded-full object-cover" /> : <UserIcon size={48} className="text-purple-700" />}
                </div>
                <button className="absolute bottom-0 right-0 bg-purple-700 text-white p-1 rounded-full">
                  <CameraIcon size={16} />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.name}
              </h2>
              <p className="text-gray-600 text-sm">
                Member since {user.joinDate}
              </p>
            </div>
            <nav className="p-4">
              <button className={`flex items-center w-full px-4 py-2 mb-2 rounded-md text-left ${activeTab === 'personal' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => setActiveTab('personal')}>
                <UserIcon size={18} className="mr-3" />
                Personal Information
              </button>
              <button className={`flex items-center w-full px-4 py-2 mb-2 rounded-md text-left ${activeTab === 'appointments' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => setActiveTab('appointments')}>
                <CalendarIcon size={18} className="mr-3" />
                Appointment History
              </button>
              <button className={`flex items-center w-full px-4 py-2 mb-2 rounded-md text-left ${activeTab === 'notifications' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => setActiveTab('notifications')}>
                <BellIcon size={18} className="mr-3" />
                Notification Settings
              </button>
              <button className={`flex items-center w-full px-4 py-2 mb-2 rounded-md text-left ${activeTab === 'security' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => setActiveTab('security')}>
                <LockIcon size={18} className="mr-3" />
                Security
              </button>
              <button className={`flex items-center w-full px-4 py-2 rounded-md text-left ${activeTab === 'preferences' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => setActiveTab('preferences')}>
                <SettingsIcon size={18} className="mr-3" />
                Preferences
              </button>
            </nav>
          </div>
        </div>
        <div className="md:w-3/4">
          {activeTab === 'personal' && <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Personal Information
                </h2>
                <button className="text-sm text-purple-700 hover:text-purple-900 font-medium">
                  Edit
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Full Name
                    </h3>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Email Address
                    </h3>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Phone Number
                    </h3>
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Address
                    </h3>
                    <p className="text-gray-900">{user.address}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Preferred Staff
                    </h3>
                    <p className="text-gray-900">{user.preferredStaff}</p>
                  </div>
                </div>
              </div>
            </div>}
          {activeTab === 'appointments' && <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Appointment History
                </h2>
              </div>
              <div className="p-6">
                {appointmentHistory.length > 0 ? <div className="space-y-6">
                    {appointmentHistory.map(appointment => <div key={appointment.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {appointment.service}
                          </h3>
                          <span className="text-purple-700 font-medium">
                            {appointment.amount}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">
                          with {appointment.staff}
                        </p>
                        <div className="flex items-center text-gray-500 mb-4">
                          <CalendarIcon size={16} className="mr-1" />
                          <span>
                            {appointment.date}, {appointment.time}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                          <button className="text-sm text-purple-700 hover:text-purple-900 font-medium">
                            Book Again
                          </button>
                        </div>
                      </div>)}
                  </div> : <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      You don't have any appointment history yet.
                    </p>
                    <button className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800">
                      Book Your First Appointment
                    </button>
                  </div>}
              </div>
            </div>}
          {activeTab === 'notifications' && <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Notification Settings
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {notificationSettings.map(setting => <div key={setting.id} className="flex items-center">
                      <input id={setting.id} type="checkbox" className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" defaultChecked={setting.checked} />
                      <label htmlFor={setting.id} className="ml-3 text-gray-700">
                        {setting.label}
                      </label>
                    </div>)}
                </div>
                <div className="mt-6">
                  <button className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>}
          {activeTab === 'security' && <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Security
                </h2>
              </div>
              <div className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  Change Password
                </h3>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input type="password" id="current-password" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input type="password" id="new-password" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input type="password" id="confirm-password" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <button type="submit" className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800">
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>}
          {activeTab === 'preferences' && <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Preferences
                </h2>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Appointment Preferences
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="preferred-staff" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Staff
                      </label>
                      <select id="preferred-staff" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" defaultValue={user.preferredStaff}>
                        <option>No preference</option>
                        <option>Jamie Rodriguez</option>
                        <option>Alex Kim</option>
                        <option>Taylor Morgan</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="preferred-day" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Day
                      </label>
                      <select id="preferred-day" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500">
                        <option>No preference</option>
                        <option>Monday</option>
                        <option>Tuesday</option>
                        <option>Wednesday</option>
                        <option>Thursday</option>
                        <option>Friday</option>
                        <option>Saturday</option>
                        <option>Sunday</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="preferred-time" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Time
                      </label>
                      <select id="preferred-time" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500">
                        <option>No preference</option>
                        <option>Morning (9AM - 12PM)</option>
                        <option>Afternoon (12PM - 5PM)</option>
                        <option>Evening (5PM - 8PM)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <button className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>}
        </div>
      </div>
    </div>;
};
export default ProfilePage;