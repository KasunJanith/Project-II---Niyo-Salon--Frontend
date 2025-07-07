import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  Users2Icon,
  ScissorsIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  SettingsIcon
} from 'lucide-react';
import logo from '../../assets/Niyo Logo.jpg';
import useUserData from '../../hooks/useUserData';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [showAvailabilitySettings, setShowAvailabilitySettings] = useState(false);
  const user = useUserData();

  // Simple appointments data
  const todaysAppointments = [
    {
      id: 1,
      clientName: 'Sarah Johnson',
      service: 'Haircut',
      time: '10:00 AM',
      status: 'upcoming'
    },
    {
      id: 2,
      clientName: 'Michael Chen',
      service: 'Beard Trim',
      time: '11:00 AM',
      status: 'in-progress'
    }
  ];

  // Simple metrics
  const keyMetrics = [
    { title: 'Today\'s Appointments', value: 3, icon: CalendarIcon, color: 'text-blue-400' },
    { title: 'Active Clients', value: 12, icon: Users2Icon, color: 'text-green-400' },
    { title: 'Services Today', value: 8, icon: ScissorsIcon, color: 'text-purple-400' },
    { title: 'Working Hours', value: '8h', icon: ClockIcon, color: 'text-[#F7BF24]' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleAvailability = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/staff/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          available: !isAvailable,
          staffId: user.id 
        })
      });

      if (response.ok) {
        setIsAvailable(!isAvailable);
        alert(`You are now ${!isAvailable ? 'Available' : 'Unavailable'} for appointments`);
      } else {
        alert('Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Error updating availability');
    }
  };

  return (
    <div className="min-h-screen bg-[#212121] text-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } bg-[#181818] border-r border-gray-700`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center">
              <img src={logo} alt="Niyo Salon" className="h-8 w-8 rounded-full mr-3" />
              <h1 className="text-lg font-bold text-[#F7BF24]">NIYO STAFF</h1>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-[#232323] transition-colors"
          >
            {sidebarCollapsed ? <MenuIcon size={20} /> : <XIcon size={20} />}
          </button>
        </div>

        {/* Availability Toggle */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Availability</span>
              <button
                onClick={toggleAvailability}
                className="flex items-center space-x-2"
              >
                {isAvailable ? (
                  <ToggleRightIcon size={20} className="text-green-400" />
                ) : (
                  <ToggleLeftIcon size={20} className="text-red-400" />
                )}
              </button>
            </div>
            <div className="mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${
                isAvailable 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        )}

        {/* Logout */}
        {!sidebarCollapsed && (
          <div className="absolute left-4 right-4 bottom-4">
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-red-700 text-sm font-semibold text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <LogOutIcon size={16} />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} flex-1`}>
        {/* Header */}
        <header className="bg-[#181818] border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Staff Dashboard</h1>
              <p className="text-gray-400 mt-1">Welcome back, {user.username || 'Staff Member'}!</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Availability Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  isAvailable ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className="text-sm text-gray-400">
                  {isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              <div className="text-right">
                <p className="text-white text-sm font-medium">
                  {user.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Staff'}
                </p>
                <p className="text-gray-400 text-xs">Staff Member</p>
              </div>
              <div className="w-10 h-10 bg-[#F7BF24] rounded-full flex items-center justify-center">
                <UserIcon size={20} className="text-black" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Availability Card */}
          <div className="bg-[#181818] rounded-xl border border-gray-700 mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${
                    isAvailable ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    <SettingsIcon size={24} className={isAvailable ? 'text-green-400' : 'text-red-400'} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Status: {isAvailable ? 'Available' : 'Unavailable'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {isAvailable 
                        ? 'You can receive new appointment requests' 
                        : 'New appointments are paused'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleAvailability}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isAvailable 
                      ? 'bg-red-700 hover:bg-red-600 text-white' 
                      : 'bg-green-700 hover:bg-green-600 text-white'
                  }`}
                >
                  {isAvailable ? 'Go Unavailable' : 'Go Available'}
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {keyMetrics.map((metric, index) => (
              <div key={index} className="bg-[#181818] p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gray-500/10">
                    <metric.icon size={24} className={metric.color} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{metric.value}</h3>
                <p className="text-gray-400 font-medium">{metric.title}</p>
              </div>
            ))}
          </div>

          {/* Today's Appointments */}
          <div className="bg-[#181818] rounded-xl border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Today's Appointments</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {todaysAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-[#232323] rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#F7BF24] rounded-full flex items-center justify-center text-black font-bold">
                          {appointment.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{appointment.clientName}</h4>
                          <p className="text-sm text-gray-400">{appointment.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">{appointment.time}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                          appointment.status === 'in-progress' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {appointment.status}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition-colors">
                        <CheckCircleIcon size={14} className="inline mr-1" />
                        Start
                      </button>
                      <button className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors">
                        <XCircleIcon size={14} className="inline mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;