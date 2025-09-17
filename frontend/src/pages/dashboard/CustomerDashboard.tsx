import { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  BellIcon, 
  UserIcon, 
  PlusIcon, 
  HistoryIcon,
  StarIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  EditIcon,
  LogOutIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  InfoIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useUserData from '../../hooks/useUserData';
import { bookingService } from '../../services/bookingService';

interface Appointment {
  id: number;
  customerName: string;
  customerPhone: string;
  services: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
}

interface Notification {
  id: number;
  type: 'reminder' | 'promotion' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const userData = useUserData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Load customer appointments and data
  useEffect(() => {
    const loadCustomerData = async () => {
      if (!userData?.id || userData.id === -1) return;
      
      setLoading(true);
      try {
        // Load all appointments for the customer
        const allAppointments = await bookingService.getAllAppointments();
        
        // Filter appointments for this customer based on their phone number
        // Since we don't have direct customer ID mapping, we'll use phone number as identifier
        const customerAppointments = allAppointments.filter(apt => 
          userData.phoneNumber && apt.customerPhone === userData.phoneNumber
        );

        // Separate upcoming and completed appointments
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const upcoming = customerAppointments.filter(apt => {
          const aptTime = apt.time.split(':');
          const aptMinutes = parseInt(aptTime[0]) * 60 + parseInt(aptTime[1]);
          
          return apt.date > today || (apt.date === today && aptMinutes > currentTime);
        }).filter(apt => apt.status !== 'CANCELLED');

        const completed = customerAppointments.filter(apt => {
          const aptTime = apt.time.split(':');
          const aptMinutes = parseInt(aptTime[0]) * 60 + parseInt(aptTime[1]);
          
          return apt.date < today || (apt.date === today && aptMinutes <= currentTime && apt.status === 'COMPLETED');
        });

        setUpcomingAppointments(upcoming);
        setCompletedAppointments(completed);

        // Calculate total spent from completed appointments
        const total = completed.reduce((sum, apt) => {
          // Extract price from services string or use a default calculation
          // This is a simplified calculation - you might want to implement proper pricing logic
          const serviceCount = apt.services.split(',').length;
          return sum + (serviceCount * 50); // Assuming average $50 per service
        }, 0);
        setTotalSpent(total);

        // Generate mock notifications based on appointments
        const mockNotifications: Notification[] = [
          {
            id: 1,
            type: 'reminder' as const,
            title: 'Appointment Reminder',
            message: upcoming.length > 0 
              ? `You have an upcoming appointment on ${new Date(upcoming[0]?.date).toLocaleDateString()}`
              : 'No upcoming appointments',
            time: '2 hours ago',
            read: false
          },
          {
            id: 2,
            type: 'promotion' as const,
            title: 'Special Offer',
            message: 'Get 20% off on your next spa treatment!',
            time: '1 day ago',
            read: false
          }
        ];
        setNotifications(mockNotifications);

      } catch (error) {
        console.error('Error loading customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, [userData]);

  // Mock recent appointments
  const recentAppointments = completedAppointments.slice(0, 3).map(apt => ({
    ...apt,
    rating: Math.floor(Math.random() * 2) + 4 // Random rating between 4-5
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon size={14} />;
      case 'pending':
        return <AlertCircleIcon size={14} />;
      case 'completed':
        return <CheckCircleIcon size={14} />;
      case 'cancelled':
        return <XCircleIcon size={14} />;
      default:
        return <ClockIcon size={14} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-[#212121] text-white">
      {/* Header */}
      <div className="bg-[#181818] border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {userData?.username || 'Customer'}!</h1>
            <p className="text-gray-400 mt-1">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/appointment')}
              className="bg-[#F7BF24] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#F7BF24]/90 transition-colors flex items-center gap-2"
            >
              <PlusIcon size={20} />
              Book Appointment
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#232323] rounded-lg transition-colors"
            >
              <LogOutIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Upcoming</p>
                <p className="text-2xl font-bold text-[#F7BF24]">{upcomingAppointments.length}</p>
              </div>
              <div className="bg-[#F7BF24]/20 p-3 rounded-lg">
                <CalendarIcon size={24} className="text-[#F7BF24]" />
              </div>
            </div>
          </div>

          <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-400">{completedAppointments.length}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <CheckCircleIcon size={24} className="text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-blue-400">${totalSpent}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <StarIcon size={24} className="text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Notifications</p>
                <p className="text-2xl font-bold text-purple-400">{notifications.filter(n => !n.read).length}</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <BellIcon size={24} className="text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#181818] rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Upcoming Appointments</h2>
                  <button
                    onClick={() => navigate('/appointment')}
                    className="text-[#F7BF24] hover:text-[#F7BF24]/80 text-sm font-medium"
                  >
                    Book New
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7BF24] mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading appointments...</p>
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-6 hover:bg-[#232323] transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {appointment.services}
                          </h3>
                          <p className="text-gray-400 mb-2">Customer: {appointment.customerName}</p>
                          <div className="flex items-center text-gray-400 text-sm space-x-4">
                            <div className="flex items-center gap-1">
                              <CalendarIcon size={14} />
                              <span>{formatDate(appointment.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon size={14} />
                              <span>{formatTime(appointment.time)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status.toLowerCase())}`}>
                            {getStatusIcon(appointment.status.toLowerCase())}
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                          Reschedule
                        </button>
                        <button className="text-sm text-red-400 hover:text-red-300 font-medium">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <CalendarIcon size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No upcoming appointments</p>
                  <button
                    onClick={() => navigate('/appointment')}
                    className="bg-[#F7BF24] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#F7BF24]/90 transition-colors"
                  >
                    Book Your First Appointment
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Section */}
            <div className="bg-[#181818] rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Notifications</h2>
                  <span className="text-sm text-gray-400">{notifications.filter(n => !n.read).length} unread</span>
                </div>
              </div>

              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-6 hover:bg-[#232323] transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          notification.type === 'reminder' 
                            ? 'bg-blue-500/20' 
                            : notification.type === 'promotion' 
                            ? 'bg-green-500/20' 
                            : 'bg-gray-500/20'
                        }`}>
                          {notification.type === 'reminder' ? (
                            <BellIcon size={16} className="text-blue-400" />
                          ) : notification.type === 'promotion' ? (
                            <StarIcon size={16} className="text-green-400" />
                          ) : (
                            <InfoIcon size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-white">{notification.title}</h4>
                            <span className="text-xs text-gray-400">{notification.time}</span>
                          </div>
                          <p className="text-gray-400 text-sm">{notification.message}</p>
                          {!notification.read && (
                            <div className="flex items-center gap-2 mt-3">
                              <button className="text-xs text-blue-400 hover:text-blue-300">
                                Mark as read
                              </button>
                              <button className="text-xs text-red-400 hover:text-red-300">
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-[#F7BF24] rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <BellIcon size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No notifications</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Your Profile</h3>
                <button
                  onClick={() => navigate('/profile')}
                  className="p-1 text-gray-400 hover:text-white hover:bg-[#232323] rounded transition-colors"
                >
                  <EditIcon size={16} />
                </button>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-[#F7BF24]/20 flex items-center justify-center mr-3">
                  <UserIcon size={24} className="text-[#F7BF24]" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{userData?.username || 'Guest User'}</h4>
                  <p className="text-gray-400 text-sm">Customer #{userData?.id || '---'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-400 text-sm">
                  <PhoneIcon size={14} className="mr-2" />
                  <span>{userData?.phoneNumber || '+1 (555) 123-4567'}</span>
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <MailIcon size={14} className="mr-2" />
                  <span>customer@example.com</span>
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <MapPinIcon size={14} className="mr-2" />
                  <span>New York, NY</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Visits</h3>
                <HistoryIcon size={18} className="text-gray-400" />
              </div>
              
              <div className="space-y-3">
                {recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-[#232323] rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{appointment.services}</p>
                      <p className="text-xs text-gray-400">{formatDate(appointment.date)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          size={12}
                          className={i < appointment.rating ? 'text-[#F7BF24] fill-current' : 'text-gray-600'}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/appointment')}
                  className="w-full text-left p-3 rounded-lg bg-[#232323] hover:bg-[#2a2a2a] transition-colors text-white"
                >
                  <PlusIcon size={16} className="inline mr-2" />
                  Book New Appointment
                </button>
                <button
                  onClick={() => navigate('/services')}
                  className="w-full text-left p-3 rounded-lg bg-[#232323] hover:bg-[#2a2a2a] transition-colors text-white"
                >
                  <StarIcon size={16} className="inline mr-2" />
                  View Services
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full text-left p-3 rounded-lg bg-[#232323] hover:bg-[#2a2a2a] transition-colors text-white"
                >
                  <UserIcon size={16} className="inline mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;