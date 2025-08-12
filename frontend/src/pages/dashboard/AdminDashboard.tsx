import { 
  UserIcon, 
  CalendarIcon, 
  UsersIcon, 
  ScissorsIcon, 
  BellIcon,
  SearchIcon,
  MenuIcon,
  XIcon,
  SettingsIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  Users2Icon,
  CalendarDaysIcon,
  FilterIcon,
  PlusIcon,
  EditIcon,
  EyeIcon,  
  Trash2Icon,
  MoreVerticalIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../assets/Niyo Logo.jpg';
import useUserData from '../../hooks/useUserData';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const user = useUserData();

  // Key metrics without financial data
  const keyMetrics = [
    {
      title: 'Active Appointments',
      value: 24,
      subtitle: 'Today',
      icon: CalendarIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Staff',
      value: 8,
      subtitle: '6 Available',
      icon: Users2Icon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Customers',
      value: 342,
      subtitle: '12 New this week',
      icon: UsersIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Active Services',
      value: 15,
      subtitle: '3 Categories',
      icon: ScissorsIcon,
      color: 'text-[#F7BF24]',
      bgColor: 'bg-[#F7BF24]/10'
    }
  ];
  // Navigation menu items
  const navigationItems = [
    { icon: CalendarDaysIcon, label: 'Dashboard', active: true, path: '/dashboard/admin' },
    { icon: UsersIcon, label: 'Customers', count: 342, path: '/dashboard/users' },
    { icon: Users2Icon, label: 'Staff', count: 8, path: '/dashboard/adminstaff' },
    { icon: CalendarIcon, label: 'Appointments', count: 24, path: '/dashboard/appointments' },
    { icon: ScissorsIcon, label: 'Services', count: 15, path: '/dashboard/services' },
    { icon: BellIcon, label: 'Notifications', count: 5, path: '/dashboard/notifications' },
    { icon: SettingsIcon, label: 'Settings', path: '/dashboard/settings' }
  ];

  // Recent appointments data
  const recentAppointments = [
    {
      id: 1,
      customer: 'Sarah Johnson',
      service: 'Premium Haircut',
      staff: 'Jamie Rodriguez',
      date: '2025-06-26',
      time: '10:00 AM',
      status: 'confirmed',
      duration: '60 min'
    },
    {
      id: 2,
      customer: 'Michael Chen',
      service: 'Beard Styling',
      staff: 'Alex Kim',
      date: '2025-06-26',
      time: '11:30 AM',
      status: 'in-progress',
      duration: '45 min'
    },
    {
      id: 3,
      customer: 'Jessica Williams',
      service: 'Hair Coloring',
      staff: 'Jordan Smith',
      date: '2025-06-26',
      time: '2:00 PM',
      status: 'pending',
      duration: '120 min'
    },
    {
      id: 4,
      customer: 'Robert Garcia',
      service: 'Full Service Package',
      staff: 'Taylor Morgan',
      date: '2025-06-26',
      time: '3:30 PM',
      status: 'confirmed',
      duration: '90 min'
    }
  ];

  // Staff availability data
  const staffStatus = [
    {
      id: 1,
      name: 'Jamie Rodriguez',
      role: 'Senior Hair Stylist',
      status: 'available',
      currentAppointment: null,
      nextAppointment: '2:00 PM',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&q=80'
    },
    {
      id: 2,
      name: 'Alex Kim',
      role: 'Master Barber',
      status: 'busy',
      currentAppointment: 'Michael Chen - Beard Styling',
      nextAppointment: '1:00 PM',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&q=80'
    },
    {
      id: 3,
      name: 'Jordan Smith',
      role: 'Hair Colorist',
      status: 'available',
      currentAppointment: null,
      nextAppointment: '2:00 PM',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&q=80'
    },
    {
      id: 4,
      name: 'Taylor Morgan',
      role: 'Spa Specialist',
      status: 'break',
      currentAppointment: null,
      nextAppointment: '3:30 PM',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&q=80'
    }
  ];

  // Recent notifications
  const recentNotifications = [
    {
      id: 1,
      type: 'appointment',
      message: 'New appointment booked by Sarah Johnson',
      time: '5 min ago',
      read: false
    },
    {
      id: 2,
      type: 'staff',
      message: 'Alex Kim updated availability',
      time: '15 min ago',
      read: false
    },
    {
      id: 3,
      type: 'service',
      message: 'New service "Deep Conditioning" added',
      time: '1 hour ago',
      read: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'in-progress': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStaffStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-400';
      case 'busy': return 'bg-red-400';
      case 'break': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-[#212121] text-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } bg-[#181818] border-r border-gray-700`}>
        
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center">
              <img src={logo} alt="Niyo Salon" className="h-8 w-8 rounded-full mr-3" />
              <h1 className="text-lg font-bold text-[#F7BF24] font-abril">NIYO ADMIN</h1>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-[#232323] transition-colors"
          >
            {sidebarCollapsed ? <MenuIcon size={20} /> : <XIcon size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-2">
          <div className="space-y-2">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-3 py-3 text-left rounded-lg transition-all duration-200 group ${
                  item.active 
                    ? 'bg-[#F7BF24] text-black' 
                    : 'text-gray-300 hover:bg-[#232323] hover:text-[#F7BF24]'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <div className="flex items-center">
                  <item.icon size={20} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.count && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.active ? 'bg-black text-[#F7BF24]' : 'bg-[#F7BF24] text-black'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Quick Actions */}
        {!sidebarCollapsed && (
          <div className="absolute left-4 right-4 bottom-4 items-center flex flex-col gap-2">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.reload();
                navigate('/login');
              }}
              className="w-20 py-2 bg-red-700 text-sm font-semibold text-white border border-red-500/50 rounded-lg hover:border-red-500 hover:bg-red-500/10 transition-all duration-300 uppercase"
            >
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
              <h1 className="text-2xl font-bold text-white font-abril">Admin Dashboard</h1>
              <p className="text-gray-400 mt-1">Manage your salon operations efficiently</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search customers, staff, services..."
                  className="bg-[#232323] border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-[#F7BF24] focus:outline-none w-80"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 bg-[#232323] rounded-lg hover:bg-[#2a2a2a] transition-colors">
                <BellIcon size={20} className="text-gray-300" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  5
                </span>
              </button>
              
              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-white text-sm font-medium">
                    {user.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Admin'}
                  </p>
                  <p className="text-gray-400 text-xs">System Administrator</p>
                </div>
                <div className="w-10 h-10 bg-[#F7BF24] rounded-full flex items-center justify-center">
                  <UserIcon size={20} className="text-black" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {keyMetrics.map((metric, index) => (
              <div key={index} className="bg-[#181818] p-6 rounded-xl border border-gray-700 hover:border-[#F7BF24] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <metric.icon size={24} className={metric.color} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{metric.value}</h3>
                <p className="text-gray-400 font-medium mb-1">{metric.title}</p>
                <p className="text-xs text-gray-500">{metric.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Appointments */}
            <div className="lg:col-span-2 bg-[#181818] rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Today's Appointments</h2>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setSelectedFilter(selectedFilter === 'all' ? 'pending' : 'all')}
                      className="p-2 bg-[#232323] rounded-lg hover:bg-[#2a2a2a] transition-colors"
                    >
                      <FilterIcon size={16} className="text-gray-400" />
                    </button>
                    <button 
                      onClick={() => navigate('/dashboard/appointments')}
                      className="text-[#F7BF24] hover:text-yellow-400 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-[#232323] rounded-lg hover:bg-[#2a2a2a] transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`}></div>
                        <div>
                          <h4 className="font-semibold text-white">{appointment.customer}</h4>
                          <p className="text-sm text-gray-400">{appointment.service}</p>
                          <p className="text-xs text-gray-500">{appointment.staff} • {appointment.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">{appointment.time}</p>
                          <p className="text-xs text-gray-400 capitalize">{appointment.status}</p>
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-1 hover:bg-[#3a3a3a] rounded transition-colors">
                            <EyeIcon size={16} className="text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-[#3a3a3a] rounded transition-colors">
                            <EditIcon size={16} className="text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-[#3a3a3a] rounded transition-colors">
                            <MoreVerticalIcon size={16} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Staff Status */}
            <div className="bg-[#181818] rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Staff Status</h2>
                  <button 
                    onClick={() => navigate('/dashboard/staff')}
                    className="text-[#F7BF24] hover:text-yellow-400 text-sm font-medium"
                  >
                    Manage
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {staffStatus.map((staff) => (
                    <div key={staff.id} className="flex items-center space-x-4 p-3 bg-[#232323] rounded-lg hover:bg-[#2a2a2a] transition-colors">
                      <div className="relative">
                        <img src={staff.avatar} alt={staff.name} className="w-12 h-12 rounded-full object-cover" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#232323] ${getStaffStatusColor(staff.status)}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">{staff.name}</h4>
                        <p className="text-sm text-gray-400">{staff.role}</p>
                        {staff.currentAppointment ? (
                          <p className="text-xs text-blue-400 truncate">{staff.currentAppointment}</p>
                        ) : (
                          <p className="text-xs text-gray-500">Next: {staff.nextAppointment}</p>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        staff.status === 'available' ? 'bg-green-500/20 text-green-400' :
                        staff.status === 'busy' ? 'bg-red-500/20 text-red-400' :
                        staff.status === 'break' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {staff.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row - Notifications & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Notifications */}
            <div className="bg-[#181818] rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Recent Notifications</h2>
                  <button 
                    onClick={() => navigate('/dashboard/notifications')}
                    className="text-[#F7BF24] hover:text-yellow-400 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentNotifications.map((notification) => (
                    <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                      notification.read ? 'bg-[#232323]' : 'bg-[#F7BF24]/10 border border-[#F7BF24]/20'
                    }`}>
                      <div className={`p-2 rounded-full ${
                        notification.type === 'appointment' ? 'bg-blue-500/20' :
                        notification.type === 'staff' ? 'bg-green-500/20' :
                        'bg-purple-500/20'
                      }`}>
                        {notification.type === 'appointment' ? <CalendarIcon size={16} className="text-blue-400" /> :
                         notification.type === 'staff' ? <UsersIcon size={16} className="text-green-400" /> :
                         <ScissorsIcon size={16} className="text-purple-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{notification.message}</p>
                        <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[#F7BF24] rounded-full mt-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#181818] rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => navigate('/dashboard/users/add')}
                    className="p-4 bg-[#232323] hover:bg-[#2a2a2a] rounded-lg text-center transition-colors group"
                  >
                    <UsersIcon size={24} className="text-[#F7BF24] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-white">Add Customer</span>
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/staff/add')}
                    className="p-4 bg-[#232323] hover:bg-[#2a2a2a] rounded-lg text-center transition-colors group"
                  >
                    <UserIcon size={24} className="text-[#F7BF24] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-white">Add Staff</span>
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/appointments/new')}
                    className="p-4 bg-[#232323] hover:bg-[#2a2a2a] rounded-lg text-center transition-colors group"
                  >
                    <CalendarIcon size={24} className="text-[#F7BF24] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-white">Book Appointment</span>
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/services/add')}
                    className="p-4 bg-[#232323] hover:bg-[#2a2a2a] rounded-lg text-center transition-colors group"
                  >
                    <ScissorsIcon size={24} className="text-[#F7BF24] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-white">Add Service</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;