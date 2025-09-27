import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MenuIcon,
  XIcon,
  LogOutIcon,
  HomeIcon,
  CalendarIcon,
  PackageIcon,
  BellIcon
} from 'lucide-react';
import logo from '../../assets/Niyo Logo.jpg';
import useUserData from '../../hooks/useUserData';
import { staffMembers } from '../../services/appointmentService';
import StaffOverview from './Staff/StaffOverview';
import StaffAppointments from './Staff/StaffAppointments';
import StaffServices from './Staff/StaffServices';
import StaffNotifications from './Staff/StaffNotifications';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const user = useUserData();

  // Get current staff member data
  const currentStaff = staffMembers.find(staff => 
    staff.name.toLowerCase().includes(user.username?.toLowerCase() || '') ||
    staff.id === `staff-${user.id}`
  ) || staffMembers[0]; // Fallback to first staff member

  // Load staff status from backend
  useEffect(() => {
    const loadStaffStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/admin/staff`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const staffList = await response.json();
          // Find current staff member in the list
          const currentStaffData = staffList.find((staff: { id: number; name: string; isActive: boolean }) => 
            staff.id === user.id || 
            staff.name.toLowerCase().includes(user.username?.toLowerCase() || '')
          );
          
          if (currentStaffData) {
            setIsAvailable(currentStaffData.isActive);
          }
        }
      } catch (error) {
        console.error('Error loading staff status:', error);
      }
    };

    if (user.id) {
      loadStaffStatus();
    }
  }, [user.id, user.username]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'appointments', label: 'Appointments', icon: CalendarIcon },
    { id: 'services', label: 'Services', icon: PackageIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <StaffOverview />;
      case 'appointments':
        return <StaffAppointments />;
      case 'services':
        return <StaffServices />;
      case 'notifications':
        return <StaffNotifications />;
      default:
        return <StaffOverview />;
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

        {/* Navigation Menu */}
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-[#232323] transition-colors ${
                activeTab === item.id ? 'bg-[#232323] border-r-2 border-[#F7BF24]' : ''
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-[#F7BF24]' : 'text-gray-400'} />
              {!sidebarCollapsed && (
                <span className={`font-medium ${activeTab === item.id ? 'text-[#F7BF24]' : 'text-gray-300'}`}>
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Availability Status (Read-only) */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-t border-gray-700 mt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Availability Status</span>
              <div className="flex items-center space-x-2">
                {isAvailable ? (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                )}
              </div>
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
            <div className="mt-2 text-xs text-gray-500">
              <p>Contact admin to change availability status</p>
            </div>
            {currentStaff && (
              <div className="mt-2 text-xs text-gray-400">
                <p>{user.username || 'Staff Member'}</p>
              </div>
            )}
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
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;