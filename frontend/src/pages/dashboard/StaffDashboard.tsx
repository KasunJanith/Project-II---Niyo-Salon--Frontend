import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  SettingsIcon,
  DollarSignIcon,
  PhoneIcon,
  AlertCircleIcon
} from 'lucide-react';
import logo from '../../assets/Niyo Logo.jpg';
import useUserData from '../../hooks/useUserData';
import { AppointmentBooking, appointmentService, services, staffMembers, formatTimeForDisplay } from '../../services/appointmentService';
import { bookingService, AppointmentResponse } from '../../services/bookingService';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [todaysAppointments, setTodaysAppointments] = useState<AppointmentBooking[]>([]);
  const [backendAppointments, setBackendAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAppointment, setUpdatingAppointment] = useState<string | null>(null);
  
  const user = useUserData();
  const isStaff = user.role === 'STAFF';

  // Get current staff member data
  const currentStaff = staffMembers.find(staff => 
    staff.name.toLowerCase().includes(user.username?.toLowerCase() || '') ||
    staff.id === `staff-${user.id}`
  ) || staffMembers[0]; // Fallback to first staff member

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Try to get appointments from backend first
      try {
        const backendData = await bookingService.getAppointmentsByDate(today);
        setBackendAppointments(backendData);
      } catch (backendError) {
        console.log('Backend not available, using local data:', backendError);
      }
      
      // Get local appointments (always available as fallback)
      const localAppointments = await appointmentService.getAppointmentsByDate(today);
      
      // Filter appointments for current staff member if logged in as staff
      let filteredAppointments = localAppointments;
      if (isStaff && currentStaff) {
        filteredAppointments = localAppointments.filter(apt => 
          apt.staffId === currentStaff.id || apt.staffName === currentStaff.name
        );
      }
      
      // Sort by time
      filteredAppointments.sort((a, b) => a.time.localeCompare(b.time));
      
      setTodaysAppointments(filteredAppointments);
    } catch (err) {
      setError('Failed to load appointments');
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [isStaff, currentStaff]);

  // Load appointments on component mount
  useEffect(() => {
    loadAppointments();
    // Set up interval to refresh appointments every 30 seconds
    const interval = setInterval(loadAppointments, 30000);
    return () => clearInterval(interval);
  }, [loadAppointments]);

  // Calculate key metrics from real data
  const calculateMetrics = () => {
    const completed = todaysAppointments.filter(apt => apt.status === 'COMPLETED').length;
    const revenue = todaysAppointments
      .filter(apt => apt.status === 'COMPLETED')
      .reduce((sum, apt) => sum + (apt.servicePrice || 0), 0);
    
    const totalWorkingHours = todaysAppointments
      .filter(apt => apt.status === 'COMPLETED')
      .reduce((sum, apt) => {
        const service = services.find(s => s.name === apt.service);
        return sum + (service ? service.duration / 60 : 1);
      }, 0);
    
    return [
      { title: 'Today\'s Appointments', value: todaysAppointments.length, icon: CalendarIcon, color: 'text-blue-400' },
      { title: 'Completed Today', value: completed, icon: CheckCircleIcon, color: 'text-green-400' },
      { title: 'Revenue Earned', value: `$${revenue}`, icon: DollarSignIcon, color: 'text-purple-400' },
      { title: 'Working Hours', value: `${totalWorkingHours.toFixed(1)}h`, icon: ClockIcon, color: 'text-[#F7BF24]' }
    ];
  };

  const keyMetrics = calculateMetrics();

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
      // Update locally even if backend fails
      setIsAvailable(!isAvailable);
      alert(`You are now ${!isAvailable ? 'Available' : 'Unavailable'} for appointments (Local update only)`);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
    try {
      setUpdatingAppointment(appointmentId);
      
      // Try backend update first
      const appointment = todaysAppointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        // Try updating via bookingService if it has a numeric ID
        if (backendAppointments.length > 0) {
          const backendApt = backendAppointments.find(apt => 
            apt.customerName === appointment.customerName && 
            apt.time === appointment.time
          );
          if (backendApt) {
            try {
              await bookingService.updateAppointmentStatus(backendApt.id, newStatus);
            } catch (backendError) {
              console.log('Backend update failed, updating locally:', backendError);
            }
          }
        }
        
        // Update locally
        await appointmentService.updateAppointment(appointmentId, { status: newStatus });
        
        // Reload appointments to reflect changes
        await loadAppointments();
        
        const actions = {
          'CONFIRMED': 'confirmed',
          'CANCELLED': 'cancelled', 
          'COMPLETED': 'completed'
        };
        
        alert(`Appointment ${actions[newStatus]} successfully!`);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment status');
    } finally {
      setUpdatingAppointment(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500/20 text-green-400';
      case 'PENDING': return 'bg-blue-500/20 text-blue-400';
      case 'COMPLETED': return 'bg-purple-500/20 text-purple-400';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmed';
      case 'PENDING': return 'Pending';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
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
            {currentStaff && (
              <div className="mt-2 text-xs text-gray-400">
                <p>{currentStaff.name}</p>
                <p>{currentStaff.role}</p>
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
        {/* Dashboard Content */}
        <main className="p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircleIcon size={20} className="text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

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
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Today's Appointments</h2>
              <button
                onClick={loadAppointments}
                disabled={loading}
                className="px-3 py-1 bg-[#F7BF24] text-black rounded-lg hover:bg-[#F7BF24]/80 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7BF24]"></div>
                </div>
              ) : todaysAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-[#232323] rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[#F7BF24] rounded-full flex items-center justify-center text-black font-bold">
                            {appointment.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{appointment.customerName}</h4>
                            <p className="text-sm text-gray-400">{appointment.service}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <PhoneIcon size={12} />
                                <span>{appointment.customerPhone}</span>
                              </div>
                              {appointment.servicePrice && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <DollarSignIcon size={12} />
                                  <span>${appointment.servicePrice}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">
                              {formatTimeForDisplay(appointment.time)}
                            </p>
                            {appointment.serviceDuration && (
                              <p className="text-xs text-gray-400">{appointment.serviceDuration}</p>
                            )}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status || 'PENDING')}`}>
                            {getStatusDisplay(appointment.status || 'PENDING')}
                          </div>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mb-3 p-2 bg-[#2a2a2a] rounded text-sm text-gray-300">
                          <strong>Notes:</strong> {appointment.notes}
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        {appointment.status === 'PENDING' && (
                          <button 
                            onClick={() => appointment.id && updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                            disabled={updatingAppointment === appointment.id}
                            className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors disabled:opacity-50"
                          >
                            <CheckCircleIcon size={14} className="inline mr-1" />
                            Confirm
                          </button>
                        )}
                        {(appointment.status === 'CONFIRMED' || appointment.status === 'PENDING') && (
                          <button 
                            onClick={() => appointment.id && updateAppointmentStatus(appointment.id, 'COMPLETED')}
                            disabled={updatingAppointment === appointment.id}
                            className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition-colors disabled:opacity-50"
                          >
                            <CheckCircleIcon size={14} className="inline mr-1" />
                            Complete
                          </button>
                        )}
                        {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                          <button 
                            onClick={() => appointment.id && updateAppointmentStatus(appointment.id, 'CANCELLED')}
                            disabled={updatingAppointment === appointment.id}
                            className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors disabled:opacity-50"
                          >
                            <XCircleIcon size={14} className="inline mr-1" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;