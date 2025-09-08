import { useState, useEffect, useCallback } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  BellIcon,
  DollarSignIcon,
  UserIcon,
  AlertCircleIcon
} from 'lucide-react';
import useUserData from '../../../hooks/useUserData';
import { AppointmentBooking, appointmentService, staffMembers, formatTimeForDisplay } from '../../../services/appointmentService';
import { bookingService } from '../../../services/bookingService';

const StaffOverview = () => {
  const [todaysAppointments, setTodaysAppointments] = useState<AppointmentBooking[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentBooking[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const user = useUserData();
  const isStaff = user.role === 'STAFF';

  // Get current staff member data
  const currentStaff = staffMembers.find(staff => 
    staff.name.toLowerCase().includes(user.username?.toLowerCase() || '') ||
    staff.id === `staff-${user.id}`
  ) || staffMembers[0];

  // Load staff availability status from backend
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

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Get next 7 days for upcoming appointments
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      // Try to get appointments from backend first
      try {
        const backendData = await bookingService.getAppointmentsByDate(todayStr);
        console.log('Backend appointments loaded:', backendData);
      } catch (backendError) {
        console.log('Backend not available, using local data:', backendError);
      }
      
      // Get local appointments
      const allAppointments = await appointmentService.getAllAppointments();
      
      // Filter appointments for current staff member
      let filteredAppointments = allAppointments;
      if (isStaff && currentStaff) {
        filteredAppointments = allAppointments.filter(apt => 
          apt.staffId === currentStaff.id || apt.staffName === currentStaff.name
        );
      }
      
      // Separate today's and upcoming appointments
      const todayApts = filteredAppointments.filter(apt => apt.date === todayStr);
      const upcomingApts = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate > today && aptDate <= nextWeek;
      });
      
      // Sort by time
      todayApts.sort((a, b) => a.time.localeCompare(b.time));
      upcomingApts.sort((a, b) => {
        if (a.date === b.date) return a.time.localeCompare(b.time);
        return a.date.localeCompare(b.date);
      });
      
      setTodaysAppointments(todayApts);
      setUpcomingAppointments(upcomingApts);
    } catch (err) {
      setError('Failed to load appointments');
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [isStaff, currentStaff]);

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 30000);
    return () => clearInterval(interval);
  }, [loadAppointments]);

  // Calculate metrics
  const calculateMetrics = () => {
    const revenue = todaysAppointments
      .filter(apt => apt.status === 'COMPLETED')
      .reduce((sum, apt) => sum + (apt.servicePrice || 0), 0);
    
    const pendingNotifications = todaysAppointments.filter(apt => apt.status === 'PENDING').length +
                                upcomingAppointments.filter(apt => apt.status === 'PENDING').length;
    
    return [
      { 
        title: 'Today\'s Appointments', 
        value: todaysAppointments.length, 
        icon: CalendarIcon, 
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10'
      },
      { 
        title: 'Upcoming Appointments', 
        value: upcomingAppointments.length, 
        icon: ClockIcon, 
        color: 'text-green-400',
        bgColor: 'bg-green-500/10'
      },
      { 
        title: 'Pending Notifications', 
        value: pendingNotifications, 
        icon: BellIcon, 
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10'
      },
      { 
        title: 'Revenue Today', 
        value: `$${revenue}`, 
        icon: DollarSignIcon, 
        color: 'text-[#F7BF24]',
        bgColor: 'bg-[#F7BF24]/10'
      }
    ];
  };

  const keyMetrics = calculateMetrics();

  // Generate calendar view for current month
  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const allAppointments = [...todaysAppointments, ...upcomingAppointments];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayAppointments = allAppointments.filter(apt => apt.date === dateStr);
      
      days.push({
        date: date.getDate(),
        fullDate: dateStr,
        isCurrentMonth: date.getMonth() === currentMonth,
        isToday: dateStr === today.toISOString().split('T')[0],
        appointmentCount: dayAppointments.length,
        hasAppointments: dayAppointments.length > 0
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircleIcon size={20} className="text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-[#F7BF24] rounded-full flex items-center justify-center">
            <UserIcon size={32} className="text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user.username || 'Staff Member'}!
            </h1>
            <p className="text-gray-400 mt-1">
              {currentStaff?.role || 'Staff Member'} • Today is {new Date().toLocaleDateString()}
            </p>
            {currentStaff && (
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-500">
                  Specialties: {currentStaff.specialties?.join(', ') || 'General'}
                </span>
                <div className="flex items-center space-x-2">
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
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon size={24} className={metric.color} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{metric.value}</h3>
            <p className="text-gray-400 font-medium">{metric.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar View */}
        <div className="bg-[#181818] rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <p className="text-gray-400 text-sm">Your appointment schedule</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`
                    relative p-2 text-center text-sm rounded-lg transition-colors cursor-pointer
                    ${day.isCurrentMonth ? 'text-white' : 'text-gray-600'}
                    ${day.isToday ? 'bg-[#F7BF24] text-black font-bold' : 'hover:bg-[#232323]'}
                    ${day.hasAppointments && !day.isToday ? 'bg-blue-500/20 text-blue-400' : ''}
                  `}
                >
                  <span>{day.date}</span>
                  {day.hasAppointments && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className={`w-1 h-1 rounded-full ${
                        day.isToday ? 'bg-black' : 'bg-blue-400'
                      }`}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Appointments Summary */}
        <div className="bg-[#181818] rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Today's Schedule</h2>
            <p className="text-gray-400 text-sm">Your appointments for today</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7BF24]"></div>
              </div>
            ) : todaysAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No appointments today</p>
                <p className="text-gray-500 text-sm">Enjoy your free time!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {todaysAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="bg-[#232323] rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#F7BF24] rounded-full flex items-center justify-center text-black font-bold text-sm">
                          {appointment.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium text-white text-sm">{appointment.customerName}</h4>
                          <p className="text-xs text-gray-400">{appointment.service}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {formatTimeForDisplay(appointment.time)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          appointment.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                          appointment.status === 'PENDING' ? 'bg-blue-500/20 text-blue-400' :
                          appointment.status === 'COMPLETED' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {appointment.status || 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {todaysAppointments.length > 5 && (
                  <div className="text-center pt-2">
                    <p className="text-gray-400 text-sm">
                      +{todaysAppointments.length - 5} more appointments
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-[#232323] hover:bg-[#2a2a2a] border border-gray-700 rounded-lg p-4 text-left transition-colors">
            <CalendarIcon size={24} className="text-blue-400 mb-2" />
            <h3 className="font-medium text-white">View All Appointments</h3>
            <p className="text-gray-400 text-sm">Manage your schedule</p>
          </button>
          <button className="bg-[#232323] hover:bg-[#2a2a2a] border border-gray-700 rounded-lg p-4 text-left transition-colors">
            <CheckCircleIcon size={24} className="text-green-400 mb-2" />
            <h3 className="font-medium text-white">My Services</h3>
            <p className="text-gray-400 text-sm">View assigned services</p>
          </button>
          <button className="bg-[#232323] hover:bg-[#2a2a2a] border border-gray-700 rounded-lg p-4 text-left transition-colors">
            <BellIcon size={24} className="text-purple-400 mb-2" />
            <h3 className="font-medium text-white">Notifications</h3>
            <p className="text-gray-400 text-sm">Check updates</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffOverview;
