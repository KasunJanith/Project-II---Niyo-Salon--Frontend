import React, { useState } from 'react';
import { CalendarIcon, ClockIcon, UserIcon, CheckIcon, XIcon } from 'lucide-react';
const StaffDashboard = () => {
  const [date, setDate] = useState(new Date());
  // Mock data for today's appointments
  const todaysAppointments = [{
    id: 1,
    clientName: 'Sarah Johnson',
    service: 'Haircut & Styling',
    time: '10:00 AM',
    duration: '45 min',
    status: 'upcoming'
  }, {
    id: 2,
    clientName: 'Michael Chen',
    service: 'Beard Trim',
    time: '11:00 AM',
    duration: '30 min',
    status: 'upcoming'
  }, {
    id: 3,
    clientName: 'Jessica Williams',
    service: 'Hair Coloring',
    time: '12:00 PM',
    duration: '90 min',
    status: 'upcoming'
  }, {
    id: 4,
    clientName: 'Robert Garcia',
    service: 'Custom Tattoo Consultation',
    time: '2:30 PM',
    duration: '60 min',
    status: 'upcoming'
  }];
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Staff Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <CalendarIcon size={24} className="text-purple-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Today</h3>
              <p className="text-2xl font-bold text-purple-700">
                {todaysAppointments.length}
              </p>
            </div>
          </div>
          <p className="text-gray-600">Appointments scheduled</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <ClockIcon size={24} className="text-purple-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
              <p className="text-2xl font-bold text-purple-700">18</p>
            </div>
          </div>
          <p className="text-gray-600">Total appointments</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <UserIcon size={24} className="text-purple-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Clients</h3>
              <p className="text-2xl font-bold text-purple-700">42</p>
            </div>
          </div>
          <p className="text-gray-600">Active clients</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Today's Schedule
          </h2>
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">June 15, 2023</span>
            <button className="bg-purple-100 text-purple-700 p-2 rounded-md hover:bg-purple-200">
              <CalendarIcon size={18} />
            </button>
          </div>
        </div>
        {todaysAppointments.length > 0 ? <div className="divide-y divide-gray-200">
            {todaysAppointments.map(appointment => <div key={appointment.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 mr-2">
                        {appointment.clientName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        #{appointment.id}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{appointment.service}</p>
                    <div className="flex items-center text-gray-500">
                      <ClockIcon size={16} className="mr-1" />
                      <span className="mr-3">{appointment.time}</span>
                      <span>({appointment.duration})</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-green-100 text-green-700 p-2 rounded-md hover:bg-green-200">
                      <CheckIcon size={18} />
                    </button>
                    <button className="bg-red-100 text-red-700 p-2 rounded-md hover:bg-red-200">
                      <XIcon size={18} />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button className="text-sm text-purple-700 hover:text-purple-900 font-medium">
                    Client Details
                  </button>
                  <button className="text-sm text-purple-700 hover:text-purple-900 font-medium">
                    View Notes
                  </button>
                  <button className="text-sm text-purple-700 hover:text-purple-900 font-medium">
                    Reschedule
                  </button>
                </div>
              </div>)}
          </div> : <div className="p-6 text-center">
            <p className="text-gray-500">No appointments scheduled for today</p>
          </div>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Availability
            </h2>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">
                Your Working Hours
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Monday</span>
                    <span className="text-gray-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tuesday</span>
                    <span className="text-gray-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Wednesday</span>
                    <span className="text-gray-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thursday</span>
                    <span className="text-gray-900">9:00 AM - 6:00 PM</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Friday</span>
                    <span className="text-gray-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Saturday</span>
                    <span className="text-gray-900">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="text-gray-900">Closed</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800">
              Update Availability
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Notifications
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <p className="font-medium text-gray-900">
                  New appointment request
                </p>
                <p className="text-gray-600 text-sm">
                  Emily Davis requested a haircut appointment for tomorrow at
                  3:00 PM.
                </p>
                <p className="text-gray-500 text-xs mt-1">10 minutes ago</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-medium text-gray-900">
                  Appointment confirmed
                </p>
                <p className="text-gray-600 text-sm">
                  Your 2:30 PM appointment with Robert Garcia has been
                  confirmed.
                </p>
                <p className="text-gray-500 text-xs mt-1">1 hour ago</p>
              </div>
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <p className="font-medium text-gray-900">
                  Appointment cancelled
                </p>
                <p className="text-gray-600 text-sm">
                  The 4:00 PM appointment with Lisa Thompson has been cancelled.
                </p>
                <p className="text-gray-500 text-xs mt-1">3 hours ago</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button className="text-sm text-purple-700 hover:text-purple-900 font-medium">
                View All Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default StaffDashboard;