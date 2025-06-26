import React from 'react';
import { CalendarIcon, ClockIcon, BellIcon, UserIcon } from 'lucide-react';
const CustomerDashboard = () => {
  // Mock data for upcoming appointments
  const upcomingAppointments = [{
    id: 1,
    service: 'Haircut & Styling',
    stylist: 'Jamie Rodriguez',
    date: 'June 15, 2023',
    time: '10:00 AM',
    status: 'confirmed'
  }, {
    id: 2,
    service: 'Beard Trim',
    stylist: 'Alex Kim',
    date: 'June 28, 2023',
    time: '2:30 PM',
    status: 'pending'
  }];
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Customer Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <CalendarIcon size={24} className="text-purple-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Upcoming</h3>
              <p className="text-2xl font-bold text-purple-700">
                {upcomingAppointments.length}
              </p>
            </div>
          </div>
          <p className="text-gray-600">Scheduled appointments</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <ClockIcon size={24} className="text-purple-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Past</h3>
              <p className="text-2xl font-bold text-purple-700">8</p>
            </div>
          </div>
          <p className="text-gray-600">Previous appointments</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <BellIcon size={24} className="text-purple-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              <p className="text-2xl font-bold text-purple-700">3</p>
            </div>
          </div>
          <p className="text-gray-600">Unread messages</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Upcoming Appointments
          </h2>
        </div>
        {upcomingAppointments.length > 0 ? <div className="divide-y divide-gray-200">
            {upcomingAppointments.map(appointment => <div key={appointment.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {appointment.service}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      with {appointment.stylist}
                    </p>
                    <div className="flex items-center text-gray-500">
                      <CalendarIcon size={16} className="mr-1" />
                      <span className="mr-3">{appointment.date}</span>
                      <ClockIcon size={16} className="mr-1" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button className="text-sm text-purple-700 hover:text-purple-900 font-medium">
                    Reschedule
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                    Cancel
                  </button>
                </div>
              </div>)}
          </div> : <div className="p-6 text-center">
            <p className="text-gray-500">No upcoming appointments</p>
            <button className="mt-4 bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800">
              Book an Appointment
            </button>
          </div>}
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Profile</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mr-4">
              <UserIcon size={32} className="text-purple-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Alex Johnson
              </h3>
              <p className="text-gray-600">alex.johnson@example.com</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Contact Information
              </h4>
              <p className="text-gray-600 mb-1">Phone: (555) 123-4567</p>
              <p className="text-gray-600">
                Address: 123 Main St, Anytown, CA 12345
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Preferences</h4>
              <p className="text-gray-600 mb-1">
                Preferred Stylist: Jamie Rodriguez
              </p>
              <p className="text-gray-600">Notification: Email & SMS</p>
            </div>
          </div>
          <div className="mt-6">
            <button className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default CustomerDashboard;