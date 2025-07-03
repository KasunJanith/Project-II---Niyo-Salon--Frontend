import { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  PlusIcon, 
  SearchIcon, 
  EyeIcon, 
  EditIcon, 
  XIcon,
  CheckIcon,
  ClockIcon,
  XCircleIcon,
  BellIcon,
  Users2Icon,
  PhoneIcon,
  MailIcon,
  GridIcon,
  ListIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreVerticalIcon
} from 'lucide-react';
import {
  services,
  staffMembers,
  customers,
  availableTimeSlots,
  formatTimeForDisplay,
  calculateEndTime,
  type AppointmentBooking
} from '../../../services/appointmentService';

// Use the shared appointment interface but extend it for admin view
interface Appointment extends AppointmentBooking {
  avatar: string;
}

// Backend appointment DTO interface
interface BackendAppointmentDTO {
  id: number;
  customerName: string;
  customerPhone: string;
  services: string;
  date: string; // LocalDate as string (YYYY-MM-DD)
  time: string; // LocalTime as string (HH:MM:SS)
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showStaffChangeModal, setShowStaffChangeModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newStaffId, setNewStaffId] = useState('');

  // Form states for add appointment modal
  const [newAppointment, setNewAppointment] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerId: '',
    service: '',
    staffId: '',
    date: '',
    time: '',
    notes: ''
  });

  // Load appointments from backend API
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/appointments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const appointmentData = await response.json();
        // Map backend AppointmentDTO to frontend Appointment interface
        const adminAppointments = appointmentData.map((appointment: BackendAppointmentDTO) => ({
          id: appointment.id.toString(),
          customerName: appointment.customerName,
          customerEmail: `${appointment.customerName.toLowerCase().replace(' ', '.')}@email.com`, // Generate email since backend doesn't have it
          customerPhone: appointment.customerPhone,
          customerId: appointment.id.toString(),
          service: appointment.services, // This contains comma-separated services
          serviceCategory: 'General', // Default category
          serviceDuration: '60 min', // Default duration
          servicePrice: 50, // Default price - you might want to calculate this based on services
          staffName: 'Unassigned', // Backend doesn't have staff assignment yet
          staffId: undefined,
          date: appointment.date, // Backend sends LocalDate as string (YYYY-MM-DD)
          time: appointment.time.substring(0, 5), // Backend sends LocalTime, convert to HH:MM
          endTime: calculateEndTime(appointment.time.substring(0, 5), 60), // Calculate end time
          status: appointment.status.toLowerCase() as 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled',
          notes: appointment.notes || '',
          priority: 'medium' as const,
          bookedBy: 'customer' as const,
          bookedByUserId: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatar: '/api/placeholder/40/40'
        }));
        setAppointments(adminAppointments);
      } else {
        console.error('Failed to load appointments:', response.status, response.statusText);
        if (response.status === 403) {
          console.error('Backend security is blocking access. Please check backend security configuration.');
          alert('Unable to access appointments. Please ensure the backend is running and properly configured.');
        }
        setAppointments([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
      alert('Unable to connect to backend. Please check if the backend server is running on http://localhost:8080');
      setAppointments([]); // Set empty array on error
    }
  };

  // Handle creating new appointment
  const handleCreateAppointment = async () => {
    if (!newAppointment.customerName || !newAppointment.service || 
        !newAppointment.date || !newAppointment.time) {
      alert('Please fill all required fields.');
      return;
    }

    try {
      // Prepare data for backend API
      const appointmentData = {
        customerName: newAppointment.customerName,
        customerPhone: newAppointment.customerPhone || '000-000-0000', // Default if not provided
        services: newAppointment.service, // Single service for now
        date: newAppointment.date, // Already in YYYY-MM-DD format
        time: newAppointment.time + ':00', // Convert HH:MM to HH:MM:SS for backend
        notes: newAppointment.notes || null,
        userId: null // No staff assignment for now
      };

      const response = await fetch('http://localhost:8080/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        // Reset form
        setNewAppointment({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          customerId: '',
          service: '',
          staffId: '',
          date: '',
          time: '',
          notes: ''
        });
        
        setShowAddModal(false);
        
        // Reload appointments to show the new one
        await loadAppointments();
        
        alert('Appointment created successfully!');
      } else {
        const errorText = await response.text();
        console.error('Failed to create appointment:', errorText);
        alert('Failed to create appointment. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  // Available staff members (use imported data)
  const availableStaff = staffMembers;

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (appointment.staffName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesService = filterService === 'all' || appointment.serviceCategory === filterService;
    const matchesStaff = filterStaff === 'all' || appointment.staffId === filterStaff;
    
    return matchesSearch && matchesStatus && matchesService && matchesStaff;
  });

  // Get appointments for selected date
  const selectedDateAppointments = filteredAppointments.filter(
    appointment => appointment.date === selectedDate.toISOString().split('T')[0]
  );

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getAppointmentsForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return filteredAppointments.filter(apt => apt.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'in-progress': return 'bg-blue-500';
      case 'completed': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      case 'rescheduled': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'in-progress': return 'text-blue-400';
      case 'completed': return 'text-purple-400';
      case 'cancelled': return 'text-red-400';
      case 'rescheduled': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      // Convert frontend status to backend status format
      const backendStatus = newStatus.toUpperCase() as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
      
      const response = await fetch(`http://localhost:8080/api/appointments/${appointmentId}/status?status=${backendStatus}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setAppointments(prev => prev.map(apt => 
          apt.id === appointmentId ? { 
            ...apt, 
            status: newStatus as Appointment['status'] 
          } : apt
        ));
      } else {
        console.error('Failed to update appointment status:', response.status);
        alert('Failed to update appointment status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleStaffChange = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNewStaffId(appointment.staffId || '');
    setShowStaffChangeModal(true);
  };

  const handleStaffUpdate = () => {
    if (selectedAppointment && newStaffId) {
      const newStaff = availableStaff.find(staff => staff.id === newStaffId);
      if (newStaff) {
        setAppointments(prev => prev.map(apt => 
          apt.id === selectedAppointment.id 
            ? { 
                ...apt, 
                staffId: newStaffId, 
                staffName: newStaff.name,
                notes: apt.notes ? `${apt.notes} | Staff changed to ${newStaff.name}` : `Staff changed to ${newStaff.name}`
              }
            : apt
        ));
        setShowStaffChangeModal(false);
        setSelectedAppointment(null);
        setNewStaffId('');
        
        // Show success notification (in a real app, this would be a toast notification)
        alert(`Staff successfully changed to ${newStaff.name}`);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-[#212121] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Appointments Management</h1>
              <p className="text-gray-400">Manage all salon appointments and schedules</p>
            </div>
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex bg-[#181818] rounded-lg p-1 border border-gray-700">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                    viewMode === 'calendar' ? 'bg-[#F7BF24] text-black font-medium' : 'text-gray-400 hover:text-[#F7BF24] hover:bg-[#232323]'
                  }`}
                >
                  <GridIcon className="h-4 w-4" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-[#F7BF24] text-black font-medium' : 'text-gray-400 hover:text-[#F7BF24] hover:bg-[#232323]'
                  }`}
                >
                  <ListIcon className="h-4 w-4" />
                  List
                </button>
              </div>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#F7BF24] hover:bg-[#E5AB20] text-black px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 font-medium shadow-lg hover:shadow-[#F7BF24]/25"
              >
                <PlusIcon className="h-5 w-5" />
                Add Appointment
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#181818] rounded-xl p-6 border border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F7BF24] focus:border-[#F7BF24] transition-all duration-200"
                  />
                </div>

                {/* Filters */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24] transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>

                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="px-4 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24] transition-all duration-200"
                >
                  <option value="all">All Services</option>
                  <option value="Hair">Hair</option>
                  <option value="Nails">Nails</option>
                  <option value="Spa">Spa</option>
                  <option value="Massage">Massage</option>
                </select>

                <select
                  value={filterStaff}
                  onChange={(e) => setFilterStaff(e.target.value)}
                  className="px-4 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24] transition-all duration-200"
                >
                  <option value="all">All Staff</option>
                  <option value="staff-1">Jamie Rodriguez</option>
                  <option value="staff-2">Alex Kim</option>
                  <option value="staff-3">Jordan Smith</option>
                  <option value="staff-4">Taylor Morgan</option>
                  <option value="staff-5">Riley Parker</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Today's Appointments</p>
                <p className="text-2xl font-bold text-white">{selectedDateAppointments.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Confirmed</p>
                <p className="text-2xl font-bold text-white">{appointments.filter(a => a.status === 'confirmed').length}</p>
              </div>
              <CheckIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-white">{appointments.filter(a => a.status === 'pending').length}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${appointments.reduce((acc, apt) => acc + (apt.servicePrice || 0), 0)}</p>
              </div>
              <Users2Icon className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'calendar' ? (
          /* Calendar View */
          <div className="bg-[#181818] rounded-xl border border-gray-700 overflow-hidden">
            {/* Calendar Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 bg-[#232323] hover:bg-[#2a2a2a] rounded-lg transition-colors"
                  >
                    <ChevronLeftIcon className="h-5 w-5 text-gray-300" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="px-4 py-2 bg-[#F7BF24] hover:bg-[#E5AB20] text-black font-medium rounded-lg transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 bg-[#232323] hover:bg-[#2a2a2a] rounded-lg transition-colors"
                  >
                    <ChevronRightIcon className="h-5 w-5 text-gray-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-24"></div>;
                  }

                  const dayAppointments = getAppointmentsForDate(day);
                  const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
                  const isSelected = selectedDate.toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

                  return (
                    <div
                      key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`}
                      onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                      className={`h-24 p-2 border border-gray-700 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#232323] hover:border-[#F7BF24] ${
                        isToday ? 'bg-[#F7BF24]/10 border-[#F7BF24]' : ''
                      } ${isSelected ? 'bg-[#F7BF24]/20 border-[#F7BF24] ring-1 ring-[#F7BF24]' : ''}`}
                    >
                      <div className="flex flex-col h-full">
                        <span className={`text-sm font-medium ${isToday ? 'text-[#F7BF24]' : 'text-white'}`}>
                          {day}
                        </span>
                        <div className="flex-1 overflow-hidden mt-1">
                          {dayAppointments.slice(0, 2).map(apt => (
                            <div
                              key={apt.id}
                              className={`text-xs p-1 mb-1 rounded truncate ${getStatusColor(apt.status || 'pending')} text-white`}
                            >
                              {apt.time} - {apt.customerName}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{dayAppointments.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Appointments */}
            {selectedDateAppointments.length > 0 && (
              <div className="border-t border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Appointments for {selectedDate.toLocaleDateString()}
                </h3>
                <div className="space-y-3">
                  {selectedDateAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className={`flex items-center justify-between p-4 bg-[#232323] rounded-lg border-l-4 ${getPriorityColor(appointment.priority || 'medium')} hover:bg-[#2a2a2a] transition-colors`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={appointment.avatar}
                          alt={appointment.customerName}
                          className="w-10 h-10 rounded-full bg-gray-600"
                        />
                        <div>
                          <h4 className="font-medium text-white">{appointment.customerName}</h4>
                          <p className="text-sm text-gray-400">{appointment.service}</p>
                          <p className="text-xs text-gray-500">{appointment.time} - {appointment.endTime} • {appointment.staffName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusTextColor(appointment.status || 'pending')} bg-[#181818]`}>
                          {appointment.status || 'pending'}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleViewAppointment(appointment)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReschedule(appointment)}
                            className="p-2 text-[#F7BF24] hover:text-yellow-300 hover:bg-[#F7BF24]/10 rounded-lg transition-colors"
                            title="Reschedule"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStaffChange(appointment)}
                            className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                            title="Change Staff"
                          >
                            <Users2Icon className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-500/10 rounded-lg transition-colors">
                            <MoreVerticalIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <div className="bg-[#181818] rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#232323]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Staff</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-[#232323] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={appointment.avatar}
                            alt={appointment.customerName}
                            className="w-10 h-10 rounded-full bg-gray-600"
                          />
                          <div>
                            <p className="font-medium text-white">{appointment.customerName}</p>
                            <p className="text-sm text-gray-400">{appointment.customerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{appointment.service}</p>
                          <p className="text-sm text-gray-400">{appointment.serviceDuration}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white">{appointment.staffName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white">{new Date(appointment.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-400">{appointment.time} - {appointment.endTime}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={appointment.status || 'pending'}
                          onChange={(e) => handleStatusChange(appointment.id || '', e.target.value)}
                          className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 ${getStatusTextColor(appointment.status || 'pending')} bg-gray-800`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="rescheduled">Rescheduled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">${appointment.servicePrice}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewAppointment(appointment)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReschedule(appointment)}
                            className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors"
                            title="Reschedule"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStaffChange(appointment)}
                            className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                            title="Change Staff"
                          >
                            <Users2Icon className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Send Notification"
                          >
                            <BellIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment.id || '', 'cancelled')}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointment Detail Modal */}
        {showDetailModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Appointment Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedAppointment.avatar}
                        alt={selectedAppointment.customerName}
                        className="w-12 h-12 rounded-full bg-gray-600"
                      />
                      <div>
                        <p className="font-medium text-white">{selectedAppointment.customerName}</p>
                        <p className="text-sm text-gray-400">Customer</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MailIcon className="h-4 w-4 text-gray-500" />
                        {selectedAppointment.customerEmail}
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <PhoneIcon className="h-4 w-4 text-gray-500" />
                        {selectedAppointment.customerPhone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Info */}
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Service Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Service</p>
                      <p className="text-white font-medium">{selectedAppointment.service}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Category</p>
                      <p className="text-white">{selectedAppointment.serviceCategory}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Duration</p>
                      <p className="text-white">{selectedAppointment.serviceDuration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Price</p>
                      <p className="text-white font-medium">${selectedAppointment.servicePrice}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment Info */}
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Appointment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p className="text-white">{new Date(selectedAppointment.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Time</p>
                      <p className="text-white">{selectedAppointment.time} - {selectedAppointment.endTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Staff Member</p>
                      <p className="text-white">{selectedAppointment.staffName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusTextColor(selectedAppointment.status || 'pending')} bg-gray-800`}>
                        {selectedAppointment.status || 'pending'}
                      </span>
                    </div>
                  </div>
                  {selectedAppointment.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400">Notes</p>
                      <p className="text-white">{selectedAppointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleStaffChange(selectedAppointment);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Change Staff
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleReschedule(selectedAppointment);
                  }}
                  className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white px-6 py-2 rounded-lg transition-all duration-200"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Appointment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add New Appointment</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Selection or Manual Entry */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Existing Customer or Add New</label>
                  <select 
                    value={newAppointment.customerId}
                    onChange={(e) => {
                      const selectedCustomer = customers.find(c => c.id === e.target.value);
                      if (selectedCustomer) {
                        setNewAppointment(prev => ({
                          ...prev,
                          customerId: selectedCustomer.id,
                          customerName: selectedCustomer.name,
                          customerEmail: selectedCustomer.email,
                          customerPhone: selectedCustomer.phone
                        }));
                      } else {
                        setNewAppointment(prev => ({
                          ...prev,
                          customerId: '',
                          customerName: '',
                          customerEmail: '',
                          customerPhone: ''
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Add New Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={newAppointment.customerName}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Customer Email</label>
                  <input
                    type="email"
                    value={newAppointment.customerEmail}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="customer@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Customer Phone</label>
                  <input
                    type="tel"
                    value={newAppointment.customerPhone}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Service *</label>
                  <select 
                    value={newAppointment.service}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, service: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Service</option>
                    {services.map(service => (
                      <option key={service.id} value={service.name}>
                        {service.name} - ${service.price} ({service.duration} min)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Staff Member (Optional)</label>
                  <select 
                    value={newAppointment.staffId}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, staffId: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">No staff assigned</option>
                    {availableStaff.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} - {staff.role}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Staff assignment can be done later</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time *</label>
                  <select
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Time</option>
                    {availableTimeSlots.map(time => (
                      <option key={time} value={time}>
                        {formatTimeForDisplay(time)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
                  <textarea
                    rows={3}
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Any special requirements or notes..."
                  />
                </div>

                {/* Service Preview */}
                {newAppointment.service && (
                  <div className="md:col-span-2 bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Appointment Preview</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Service:</span>
                        <span className="text-white ml-2">{newAppointment.service}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Staff:</span>
                        <span className="text-white ml-2">
                          {availableStaff.find(s => s.id === newAppointment.staffId)?.name || 'Not selected'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Price:</span>
                        <span className="text-white ml-2">
                          ${services.find(s => s.name === newAppointment.service)?.price || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white ml-2">
                          {services.find(s => s.name === newAppointment.service)?.duration || 60} min
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewAppointment({
                      customerName: '',
                      customerEmail: '',
                      customerPhone: '',
                      customerId: '',
                      service: '',
                      staffId: '',
                      date: '',
                      time: '',
                      notes: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateAppointment}
                  disabled={!newAppointment.customerName || !newAppointment.service || !newAppointment.date || !newAppointment.time}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Appointment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Reschedule Appointment</h2>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Customer: {selectedAppointment.customerName}</p>
                  <p className="text-sm text-gray-400 mb-4">Service: {selectedAppointment.service}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Date</label>
                  <input
                    type="date"
                    defaultValue={selectedAppointment.date}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Time</label>
                  <input
                    type="time"
                    defaultValue={selectedAppointment.time}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reason for Rescheduling</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Optional reason for rescheduling..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleStatusChange(selectedAppointment.id || '', 'rescheduled');
                    setShowRescheduleModal(false);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg transition-all duration-200"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Staff Change Modal */}
        {showStaffChangeModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Change Staff Member</h2>
                <button
                  onClick={() => {
                    setShowStaffChangeModal(false);
                    setSelectedAppointment(null);
                    setNewStaffId('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Assignment */}
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Current Assignment</h3>
                  <div className="flex items-center gap-3">
                    <Users2Icon className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-white">{selectedAppointment.staffName}</p>
                      <p className="text-sm text-gray-400">
                        {availableStaff.find(s => s.id === selectedAppointment.staffId)?.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div>
                  <p className="text-sm text-gray-400 mb-1">Appointment Details:</p>
                  <p className="text-white font-medium">{selectedAppointment.customerName}</p>
                  <p className="text-sm text-gray-400">{selectedAppointment.service}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                  </p>
                </div>

                {/* New Staff Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select New Staff Member
                  </label>
                  <select
                    value={newStaffId}
                    onChange={(e) => setNewStaffId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {availableStaff.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} - {staff.role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Staff Specialties */}
                {newStaffId && (
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Staff Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableStaff.find(s => s.id === newStaffId)?.specialties.map(specialty => (
                        <span
                          key={specialty}
                          className="px-2 py-1 text-xs bg-purple-600/20 text-purple-300 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reason for Change */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for Staff Change (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Optional reason for changing staff member..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowStaffChangeModal(false);
                    setSelectedAppointment(null);
                    setNewStaffId('');
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStaffUpdate}
                  disabled={!newStaffId || newStaffId === selectedAppointment.staffId}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Change Staff
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAppointments;