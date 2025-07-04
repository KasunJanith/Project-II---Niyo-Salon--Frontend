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
  ServiceIcon,
  FilterIcon,
  PlusIcon,
  EditIcon,
  EyeIcon,  
  Trash2Icon,
  MoreVerticalIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../../assets/Niyo Logo.jpg';
import useUserData from '../../hooks/useUserData';
import { adminService } from '../../services/adminService';

// Interfaces for real data
interface Staff {
  id: number;
  name: string;
  email?: string;
  phone: string;
  role: string;
  status: string;
  isActive: boolean;
  createdAt?: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  registrationDate: string;
  totalAppointments: number;
}

interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  isActive: boolean;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const user = useUserData();

  // Real data states
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [servicesData, setServicesData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadStaff(),
          loadCustomers(),
          loadServices()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Load staff data
  const loadStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/staff', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const staffFromApi = await response.json();
        setStaffData(staffFromApi);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  // Load customers data
  const loadCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const usersFromApi = await response.json();
        const customerUsers = usersFromApi.filter((user: any) => user.role === 'customer');
        setCustomersData(customerUsers);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  // Load services data
  const loadServices = async () => {
    try {
      const servicesFromApi = await adminService.getAllServices();
      setServicesData(servicesFromApi);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  // Calculate real metrics
  const keyMetrics = [
    {
      title: 'Active Appointments',
      value: 0, // You can connect this to appointments API when available
      subtitle: 'Today',
      icon: CalendarIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Staff',
      value: staffData.length,
      subtitle: `${staffData.filter(s => s.isActive).length} Active`,
      icon: Users2Icon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Customers',
      value: customersData.length,
      subtitle: `${customersData.filter(c => c.status === 'active').length} Active`,
      icon: UsersIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Active Services',
      value: servicesData.filter(s => s.isActive).length,
      subtitle: `${new Set(servicesData.map(s => s.category)).size} Categories`,
      icon: ScissorsIcon,
      color: 'text-[#F7BF24]',
      bgColor: 'bg-[#F7BF24]/10'
    }
  ];

  // Navigation menu items with real counts
  const navigationItems = [
    { icon: CalendarDaysIcon, label: 'Dashboard', active: true, path: '/dashboard/admin' },
    { icon: UsersIcon, label: 'Customers', count: customersData.length, path: '/dashboard/users' },
    { icon: Users2Icon, label: 'Staff', count: staffData.length, path: '/dashboard/adminstaff' },
    { icon: CalendarIcon, label: 'Appointments', count: 0, path: '/dashboard/appointments' }, // Connect to appointments API
    { icon: ScissorsIcon, label: 'Services', count: servicesData.length, path: '/dashboard/services' },
    { icon: BellIcon, label: 'Notifications', count: 5, path: '/dashboard/notifications' },
    { icon: SettingsIcon, label: 'Settings', path: '/dashboard/settings' }
  ];

  // Mock appointments data (replace with real API when available)
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
    }
  ];

  // Real staff status based on loaded data
  const getStaffStatusForDashboard = () => {
    return staffData.slice(0, 4).map(staff => ({
      id: staff.id,
      name: staff.name,
      role: staff.role,
      status: staff.isActive ? 'available' : 'offline',
      currentAppointment: null,
      nextAppointment: '2:00 PM',
      avatar: `https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&q=80`
    }));
  };

  // Real notifications based on recent activity
  const getRecentNotifications = () => {
    const notifications = [];
    
    // Add notifications for recent customers
    if (customersData.length > 0) {
      const recentCustomers = customersData
        .filter(c => new Date(c.registrationDate) > new Date(Date.now() - 24 * 60 * 60 * 1000))
        .slice(0, 2);
      
      recentCustomers.forEach(customer => {
        notifications.push({
          id: `customer-${customer.id}`,
          type: 'customer',
          message: `New customer ${customer.name} registered`,
          time: '2 hours ago',
          read: false
        });
      });
    }

    // Add notifications for recent services
    if (servicesData.length > 0) {
      const recentServices = servicesData.slice(0, 1);
      recentServices.forEach(service => {
        notifications.push({
          id: `service-${service.id}`,
          type: 'service',
          message: `Service "${service.name}" is available`,
          time: '1 hour ago',
          read: true
        });
      });
    }

    // Add staff notifications
    if (staffData.length > 0) {
      const activeStaff = staffData.filter(s => s.isActive).slice(0, 1);
      activeStaff.forEach(staff => {
        notifications.push({
          id: `staff-${staff.id}`,
          type: 'staff',
          message: `${staff.name} is available for appointments`,
          time: '30 min ago',
          read: false
        });
      });
    }

    return notifications.slice(0, 3);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#F7BF24] mx-auto mb-4"></div>
          <p className="text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

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
                  {getRecentNotifications().filter(n => !n.read).length}
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
                  <h2 className="text-xl font-bold text-white">Recent Activity</h2>
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
                  {/* Show recent customers */}
                  {customersData.slice(0, 2).map((customer) => (
                    <div key={`customer-${customer.id}`} className="flex items-center justify-between p-4 bg-[#232323] rounded-lg hover:bg-[#2a2a2a] transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div>
                          <h4 className="font-semibold text-white">{customer.name}</h4>
                          <p className="text-sm text-gray-400">New Customer Registration</p>
                          <p className="text-xs text-gray-500">Email: {customer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">
                            {new Date(customer.registrationDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">Active</p>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => navigate(`/dashboard/users`)}
                            className="p-1 hover:bg-[#3a3a3a] rounded transition-colors"
                          >
                            <EyeIcon size={16} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show recent services */}
                  {servicesData.slice(0, 1).map((service) => (
                    <div key={`service-${service.id}`} className="flex items-center justify-between p-4 bg-[#232323] rounded-lg hover:bg-[#2a2a2a] transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <div>
                          <h4 className="font-semibold text-white">{service.name}</h4>
                          <p className="text-sm text-gray-400">{service.category}</p>
                          <p className="text-xs text-gray-500">Rs. {service.price} • {service.duration}min</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">Active</p>
                          <p className="text-xs text-gray-400">Service</p>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => navigate(`/dashboard/services`)}
                            className="p-1 hover:bg-[#3a3a3a] rounded transition-colors"
                          >
                            <EyeIcon size={16} className="text-gray-400" />
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
                    onClick={() => navigate('/dashboard/adminstaff')}
                    className="text-[#F7BF24] hover:text-yellow-400 text-sm font-medium"
                  >
                    Manage
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {getStaffStatusForDashboard().map((staff) => (
                    <div key={staff.id} className="flex items-center space-x-4 p-3 bg-[#232323] rounded-lg hover:bg-[#2a2a2a] transition-colors">
                      <div className="relative">
                        <div className="w-12 h-12 bg-[#F7BF24] rounded-full flex items-center justify-center text-black font-semibold">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#232323] ${getStaffStatusColor(staff.status)}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">{staff.name}</h4>
                        <p className="text-sm text-gray-400">{staff.role}</p>
                        <p className="text-xs text-gray-500">
                          {staff.status === 'available' ? 'Ready for appointments' : 'Currently offline'}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        staff.status === 'available' ? 'bg-green-500/20 text-green-400' :
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
                  {getRecentNotifications().map((notification) => (
                    <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                      notification.read ? 'bg-[#232323]' : 'bg-[#F7BF24]/10 border border-[#F7BF24]/20'
                    }`}>
                      <div className={`p-2 rounded-full ${
                        notification.type === 'customer' ? 'bg-purple-500/20' :
                        notification.type === 'staff' ? 'bg-green-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        {notification.type === 'customer' ? <UsersIcon size={16} className="text-purple-400" /> :
                         notification.type === 'staff' ? <Users2Icon size={16} className="text-green-400" /> :
                         <ScissorsIcon size={16} className="text-blue-400" />}
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
                    onClick={() => navigate('/dashboard/users')}
                    className="p-4 bg-[#232323] hover:bg-[#2a2a2a] rounded-lg text-center transition-colors group"
                  >
                    <UsersIcon size={24} className="text-[#F7BF24] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-white">Manage Customers</span>
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/adminstaff')}
                    className="p-4 bg-[#232323] hover:bg-[#2a2a2a] rounded-lg text-center transition-colors group"
                  >
                    <Users2Icon size={24} className="text-[#F7BF24] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-white">Manage Staff</span>
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/appointments')}
                    className="p-4 bg-[#232323] hover:bg-[#2a2a2a] rounded-lg text-center transition-colors group"
                  >
                    <CalendarIcon size={24} className="text-[#F7BF24] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-white">Appointments</span>
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/services')}
                    className="p-4 bg-[#232323] hover:bg-[#2a2a2a] rounded-lg text-center transition-colors group"
                  >
                    <ScissorsIcon size={24} className="text-[#F7BF24] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-white">Manage Services</span>
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