import { useState, useEffect, useCallback } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
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
  AlertCircleIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useUserData from '../../hooks/useUserData';
import { bookingService } from '../../services/bookingService';
import { useAlert } from '../../hooks/useAlert';
import AlertBox from '../../components/ui/AlertBox';

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



const CustomerDashboard = () => {
  const navigate = useNavigate();
  const userData = useUserData();
  const { alert, showWarning, showError, showSuccess, hideAlert } = useAlert();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states for cancel and reschedule
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
    reason: ''
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Reload appointments data
  const loadCustomerData = useCallback(async () => {
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

      const completed = customerAppointments.filter(apt => apt.status === 'COMPLETED');

      setUpcomingAppointments(upcoming);
      setCompletedAppointments(completed);



    } catch (error) {
      console.error('Error loading customer data:', error);
      showError('Error', 'Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userData, showError]);

  // Load customer appointments and data
  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  const performCancellation = useCallback(async (appointment: Appointment) => {
    try {
      await bookingService.cancelAppointment(appointment.id);
      showSuccess('Success', 'Your appointment has been cancelled successfully.');
      await loadCustomerData(); // Reload data
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      showError('Error', 'Failed to cancel appointment. Please try again or contact support.');
    }
  }, [showSuccess, showError, loadCustomerData]);

  // Cancel appointment function
  const handleCancelAppointment = useCallback(async (appointment: Appointment) => {
    showWarning(
      'Cancel Appointment', 
      `Are you sure you want to cancel your appointment?\n\nService: ${appointment.services}\nDate: ${formatDate(appointment.date)}\nTime: ${formatTime(appointment.time)}\n\nThis action cannot be undone.`,
    );

    // Automatically proceed with cancellation after showing warning
    setTimeout(() => {
      performCancellation(appointment);
    }, 3000);
  }, [showWarning, performCancellation]);

  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24Hour = useCallback((time12h: string) => {
    const [time, modifier] = time12h.split(" ");
    let [hours] = time.split(":").map(Number);
    const minutes = parseInt(time.split(":")[1]);

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }, []);

  // Load available time slots for selected date
  const loadAvailableTimeSlots = useCallback(async (selectedDate: string) => {
    setLoadingTimeSlots(true);
    try {
      // Generate standard time slots (9 AM to 7 PM)
      const standardTimeSlots = [
        "09:00 AM",
        "10:00 AM", 
        "11:00 AM",
        "12:00 PM",
        "01:00 PM",
        "02:00 PM",
        "03:00 PM",
        "04:00 PM",
        "05:00 PM",
        "06:00 PM",
        "07:00 PM"
      ];

      // Filter available time slots
      const availableSlots: string[] = [];
      
      for (const timeSlot of standardTimeSlots) {
        try {
          const timeSlot24h = convertTo24Hour(timeSlot);
          const isAvailable = await bookingService.checkTimeSlotAvailability({
            date: selectedDate,
            time: timeSlot24h
          });
          
          if (isAvailable) {
            availableSlots.push(timeSlot);
          }
        } catch (error) {
          console.warn(`Could not check availability for ${timeSlot}:`, error);
          // If we can't check availability, assume it's available for fallback
          availableSlots.push(timeSlot);
        }
      }

      setAvailableTimeSlots(availableSlots);
    } catch (error) {
      console.error('Error loading available times:', error);
      // Fallback: show all time slots if we can't fetch data
      setAvailableTimeSlots([
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM",
        "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
      ]);
    } finally {
      setLoadingTimeSlots(false);
    }
  }, [convertTo24Hour]);

  // Reschedule functions
  const handleReschedule = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleData({
      date: appointment.date,
      time: appointment.time,
      reason: ''
    });
    setShowRescheduleModal(true);
    // Load available time slots for the current date
    loadAvailableTimeSlots(appointment.date);
  }, [loadAvailableTimeSlots]);

  const handleRescheduleSubmit = useCallback(async () => {
    if (!selectedAppointment || !rescheduleData.date || !rescheduleData.time) {
      showWarning('Invalid Data', 'Please select both date and time for rescheduling.');
      return;
    }

    try {
      // Convert 12-hour format to 24-hour format for API
      const time24h = convertTo24Hour(rescheduleData.time);
      
      // Update the existing appointment with new date and time (same approach as AppointmentPage)
      // This will update only the date, time, and notes, then reset status to PENDING
      await bookingService.rescheduleAppointment(
        selectedAppointment.id, 
        rescheduleData.date, 
        time24h + ':00', // Convert HH:MM to HH:MM:SS format
        rescheduleData.reason || 'Rescheduled by customer'
      );
      
      showSuccess(
        'Appointment Rescheduled', 
        'Your appointment has been successfully rescheduled! The status has been reset to pending for confirmation.'
      );
      
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      setRescheduleData({ date: '', time: '', reason: '' });
      setAvailableTimeSlots([]);
      
      // Reload the appointments to reflect the change
      await loadCustomerData();
      
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('403')) {
        showError('Authentication Error', 'You are not authorized to reschedule this appointment. Please log in again.');
      } else {
        showError('Reschedule Failed', 'Failed to reschedule appointment. Please try again or contact support.');
      }
    }
  }, [selectedAppointment, rescheduleData, showWarning, showSuccess, showError, loadCustomerData, convertTo24Hour]);

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
      <AlertBox
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={hideAlert}
        autoClose={true}
        autoCloseDelay={5000}
      />
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
              onClick={() => navigate('/appointments')}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Upcoming Appointments</p>
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
                <p className="text-gray-400 text-sm">Completed Visits</p>
                <p className="text-2xl font-bold text-green-400">{completedAppointments.length}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <CheckCircleIcon size={24} className="text-green-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
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
                        <button 
                          onClick={() => handleReschedule(appointment)}
                          className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                          Reschedule
                        </button>
                        <button 
                          onClick={() => handleCancelAppointment(appointment)}
                          className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                        >
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
                  onClick={() => navigate('/appointments')}
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

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] rounded-xl p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-[#F7BF24]" />
                Reschedule Appointment
              </h2>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedAppointment(null);
                  setRescheduleData({ date: '', time: '', reason: '' });
                  setAvailableTimeSlots([]);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Current Appointment Info */}
              <div className="bg-[#232323] rounded-lg p-4 border border-gray-600">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Current Appointment</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-white">
                    <span className="text-gray-400">Service:</span> {selectedAppointment.services}
                  </p>
                  <p className="text-white">
                    <span className="text-gray-400">Date:</span> {formatDate(selectedAppointment.date)}
                  </p>
                  <p className="text-white">
                    <span className="text-gray-400">Time:</span> {formatTime(selectedAppointment.time)}
                  </p>
                </div>
              </div>

              {/* New Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setRescheduleData(prev => ({ 
                      ...prev, 
                      date: newDate, 
                      time: '' // Reset time when date changes
                    }));
                    if (newDate) {
                      loadAvailableTimeSlots(newDate);
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 bg-[#232323] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24] focus:border-[#F7BF24]"
                />
              </div>

              {/* New Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Time
                  {loadingTimeSlots && <span className="text-xs text-[#F7BF24] ml-2">(Loading...)</span>}
                </label>
                {loadingTimeSlots ? (
                  <div className="w-full px-3 py-2 bg-[#232323] border border-gray-600 rounded-lg text-gray-400 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F7BF24] mr-2"></div>
                    Loading available times...
                  </div>
                ) : availableTimeSlots.length > 0 ? (
                  <select
                    value={rescheduleData.time}
                    onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#232323] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24] focus:border-[#F7BF24]"
                  >
                    <option value="">Select a time</option>
                    {availableTimeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                ) : rescheduleData.date ? (
                  <div className="w-full px-3 py-2 bg-[#232323] border border-gray-600 rounded-lg text-gray-400">
                    No available time slots for this date
                  </div>
                ) : (
                  <div className="w-full px-3 py-2 bg-[#232323] border border-gray-600 rounded-lg text-gray-400">
                    Please select a date first
                  </div>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for Rescheduling (Optional)
                </label>
                <textarea
                  rows={3}
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Please let us know why you need to reschedule..."
                  className="w-full px-3 py-2 bg-[#232323] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F7BF24] focus:border-[#F7BF24]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedAppointment(null);
                  setRescheduleData({ date: '', time: '', reason: '' });
                  setAvailableTimeSlots([]);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-[#232323] rounded-lg transition-colors border border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                disabled={!rescheduleData.date || !rescheduleData.time}
                className="bg-[#F7BF24] hover:bg-[#E5AB20] text-black px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;