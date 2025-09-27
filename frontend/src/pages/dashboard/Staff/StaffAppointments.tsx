import { useState, useEffect, useCallback } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  DollarSignIcon,
  AlertCircleIcon,
  FilterIcon,
  RefreshCwIcon,
  EyeIcon,
  UserIcon,
  MailIcon,
  GridIcon,
  ListIcon,
  AlertTriangleIcon,
  XIcon
} from 'lucide-react';
import useUserData from '../../../hooks/useUserData';
import { useAlert } from '../../../hooks/useAlert';
import { formatTimeForDisplay, calculateEndTime } from '../../../services/appointmentService';
import AlertBox from '../../../components/ui/AlertBox';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import PromptDialog from '../../../components/ui/PromptDialog';

// Backend appointment DTO interface following API standards
interface BackendAppointmentDTO {
  id: number;
  customerName: string;
  customerPhone: string;
  services: string;
  date: string; // ISO 8601 date format (YYYY-MM-DD)
  time: string; // ISO 8601 time format (HH:MM:SS)
  notes?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  staffId?: number;
}

// Staff member interface
interface StaffMember {
  id: number;
  name: string;
  role: string;
  isActive: boolean;
  phoneNumber?: string;
  email?: string;
}

// Enhanced appointment interface for staff view
interface StaffAppointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  serviceCategory: string;
  serviceDuration: string;
  servicePrice?: number;
  staffName: string;
  staffId?: string;
  date: string;
  time: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes?: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

// Conflict data interface
interface ConflictData {
  appointmentId: string;
  appointment: StaffAppointment;
  conflictingAppointment: StaffAppointment;
  time: string;
  date: string;
}

// Unassign data interface
interface UnassignData {
  appointmentId: string;
  appointment: StaffAppointment;
  appointmentDate: Date;
  today: Date;
  isPastOrToday: boolean;
}

// Constants removed - using string literals directly

const API_ENDPOINTS = {
  APPOINTMENTS: "/api/appointments",
  STAFF: "/api/admin/staff"
} as const;

type FilterType = 'assigned' | 'today' | 'upcoming' | 'pending' | 'completed' | 'unassigned';
type ViewMode = 'list' | 'calendar';

const StaffAppointments = () => {
  const [allAppointments, setAllAppointments] = useState<StaffAppointment[]>([]);
  const [assignedAppointments, setAssignedAppointments] = useState<StaffAppointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<StaffAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAppointment, setUpdatingAppointment] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('assigned');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAppointment, setSelectedAppointment] = useState<StaffAppointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [assigningAppointment, setAssigningAppointment] = useState<string | null>(null);
  const [unassigningAppointment, setUnassigningAppointment] = useState<string | null>(null);
  
  // Dialog states
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelAppointmentId, setCancelAppointmentId] = useState<string | null>(null);
  const [showConflictConfirm, setShowConflictConfirm] = useState(false);
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
  const [unassignData, setUnassignData] = useState<UnassignData | null>(null);
  
  const user = useUserData();
  const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();

  // Get current staff member data from backend
  const getCurrentStaff = useCallback(async (): Promise<StaffMember | null> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080${API_ENDPOINTS.STAFF}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const staffData: StaffMember[] = await response.json();
        console.log('Staff data loaded:', staffData);
        console.log('Current user:', user);
        
        // Find current staff member by username, phone, or ID
        const foundStaff = staffData.find(staff => 
          staff.name.toLowerCase().includes(user.username?.toLowerCase() || '') ||
          staff.id === user.id ||
          staff.phoneNumber === user.username || // Match by phone number
          staff.phoneNumber === user.phoneNumber
        );
        
        console.log('Found current staff:', foundStaff);
        setCurrentStaff(foundStaff || null);
        return foundStaff || null;
      }
      return null;
    } catch (error) {
      console.error('Error loading staff data:', error);
      return null;
    }
  }, [user]);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current staff member first
      const staff = await getCurrentStaff();
      
      if (!staff) {
        setError('Staff member not found. Please contact administrator.');
        setLoading(false);
        return;
      }

      // Load all appointments from backend
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080${API_ENDPOINTS.APPOINTMENTS}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const appointmentData: (BackendAppointmentDTO & { staffId?: number })[] = 
          await response.json();
        
        console.log('All appointments loaded:', appointmentData);
        console.log('Current staff ID:', staff.id);

        // Map all appointments to UI format
        const allMappedAppointments: StaffAppointment[] = appointmentData.map(appointment => {
          const assignedStaff = appointment.staffId ? 
            `Staff ${appointment.staffId}` : 'Unassigned'; // You can enhance this with actual staff names
          
          return {
            id: appointment.id.toString(),
            customerName: appointment.customerName,
            customerEmail: `${appointment.customerName.toLowerCase().replace(" ", ".")}@email.com`,
            customerPhone: appointment.customerPhone,
            service: appointment.services,
            serviceCategory: "General",
            serviceDuration: "60 min",
            servicePrice: 50,
            staffName: appointment.staffId === staff.id ? staff.name : assignedStaff,
            staffId: appointment.staffId?.toString(),
            date: appointment.date,
            time: appointment.time.substring(0, 5),
            endTime: calculateEndTime(appointment.time.substring(0, 5), 60),
            status: appointment.status,
            notes: appointment.notes || "",
            priority: "medium",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });

        // Separate assigned and all appointments
        const assigned = allMappedAppointments.filter(appointment => {
          console.log(`Checking appointment ${appointment.id}: staffId=${appointment.staffId}, currentStaff.id=${staff.id}`);
          return appointment.staffId === staff.id.toString();
        });

        console.log('Filtered assigned appointments:', assigned);
        
        // Sort appointments appropriately
        const sortedAll = [...allMappedAppointments].sort((a, b) => {
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare === 0) {
            return b.time.localeCompare(a.time);
          }
          return dateCompare;
        });

        const sortedAssigned = [...assigned].sort((a, b) => {
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare === 0) {
            return b.time.localeCompare(a.time);
          }
          return dateCompare;
        });
        
        setAllAppointments(sortedAll);
        setAssignedAppointments(sortedAssigned);
      } else {
        throw new Error(`Failed to load appointments: ${response.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error('Error loading appointments:', errorMessage);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getCurrentStaff]);

  // Filter appointments based on selected filter
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    const sourceAppointments = selectedFilter === 'assigned' ? assignedAppointments : allAppointments;
    let filtered: StaffAppointment[] = [];
    
    switch (selectedFilter) {
      case 'assigned':
        filtered = assignedAppointments;
        break;
      case 'today':
        filtered = sourceAppointments.filter(apt => apt.date === today);
        // Sort today's appointments by time (earliest first)
        filtered.sort((a, b) => a.time.localeCompare(b.time));
        break;
      case 'upcoming':
        filtered = sourceAppointments.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate > now && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED';
        });
        // Sort upcoming by date then time
        filtered.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare === 0) {
            return a.time.localeCompare(b.time);
          }
          return dateCompare;
        });
        break;
      case 'completed':
        filtered = sourceAppointments.filter(apt => apt.status === 'COMPLETED');
        // Sort completed by date (newest first)
        filtered.sort((a, b) => {
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare === 0) {
            return b.time.localeCompare(a.time);
          }
          return dateCompare;
        });
        break;
      case 'pending':
        filtered = sourceAppointments.filter(apt => apt.status === 'PENDING');
        filtered.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare === 0) {
            return a.time.localeCompare(b.time);
          }
          return dateCompare;
        });
        break;
      case 'unassigned':
        filtered = allAppointments.filter(apt => !apt.staffId || apt.staffName === 'Unassigned');
        // Sort unassigned by date (earliest first)
        filtered.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare === 0) {
            return a.time.localeCompare(b.time);
          }
          return dateCompare;
        });
        break;
      default:
        filtered = sourceAppointments;
        // Sort all by date and time (newest first)
        filtered.sort((a, b) => {
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare === 0) {
            return b.time.localeCompare(a.time);
          }
          return dateCompare;
        });
    }
    
    setFilteredAppointments(filtered);
  }, [allAppointments, assignedAppointments, selectedFilter]);

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [loadAppointments]);

  const updateAppointmentStatus = async (
    appointmentId: string, 
    newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED', 
    reason?: string
  ) => {
    try {
      setUpdatingAppointment(appointmentId);
      
      // Find the appointment to validate
      const appointment = filteredAppointments.find(apt => apt.id === appointmentId);
      if (!appointment) {
        showError('Appointment Error', 'Appointment not found in the current list.');
        return;
      }

      // Business logic validation
      const today = new Date().toISOString().split('T')[0];
      const appointmentDate = appointment.date;
      const now = new Date();
      const appointmentDateTime = new Date(`${appointmentDate}T${appointment.time}:00`);

      // Validation rules
      if (newStatus === 'COMPLETED') {
        // Cannot complete future appointments
        if (appointmentDate > today) {
          showWarning(
            'Cannot Complete Future Appointment',
            `You can only complete appointments on or before today.\n\nAppointment Date: ${new Date(appointmentDate).toLocaleDateString()}\nToday: ${new Date(today).toLocaleDateString()}`
          );
          return;
        }
        
        // Cannot complete appointments that haven't started yet (if same day)
        if (appointmentDate === today && appointmentDateTime > now) {
          showWarning(
            'Appointment Not Started',
            `You cannot complete appointments that haven't started yet.\n\nAppointment Time: ${formatTimeForDisplay(appointment.time)}\nCurrent Time: ${now.toLocaleTimeString()}`
          );
          return;
        }

        // Only assigned staff can complete appointments
        if (!currentStaff || appointment.staffId !== currentStaff.id.toString()) {
          showError('Not Authorized', 'You can only complete appointments assigned to you.');
          return;
        }
      }

      if (newStatus === 'CONFIRMED') {
        // Only assigned staff can confirm appointments
        if (!currentStaff || appointment.staffId !== currentStaff.id.toString()) {
          showError('Not Authorized', 'You can only confirm appointments assigned to you.');
          return;
        }
      }

      // Update status via backend API
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/status?status=${newStatus}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Update local state for both all and assigned appointments
        const updateFunction = (apt: StaffAppointment) =>
          apt.id === appointmentId
            ? {
                ...apt,
                status: newStatus,
                notes: reason && newStatus === 'CANCELLED' 
                  ? `${apt.notes ? apt.notes + ' | ' : ''}Cancelled by staff: ${reason}`
                  : apt.notes,
                updatedAt: new Date().toISOString()
              }
            : apt;

        setAllAppointments(prev => prev.map(updateFunction));
        setAssignedAppointments(prev => prev.map(updateFunction));
        
        const actions = {
          'CONFIRMED': 'confirmed',
          'CANCELLED': 'cancelled', 
          'COMPLETED': 'completed'
        };
        
        showSuccess(
          'Appointment Updated!',
          `Appointment ${actions[newStatus]} successfully for ${appointment.customerName}.`
        );
      } else {
        throw new Error(`Failed to update appointment: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      showError('Update Failed', 'Failed to update appointment status. Please try again.');
    } finally {
      setUpdatingAppointment(null);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setCancelAppointmentId(appointmentId);
    setShowCancelPrompt(true);
  };

  const confirmCancelAppointment = async (reason: string) => {
    if (cancelAppointmentId && reason) {
      await updateAppointmentStatus(cancelAppointmentId, 'CANCELLED', reason);
    }
    setShowCancelPrompt(false);
    setCancelAppointmentId(null);
  };

  // Self-assignment function for staff to assign themselves to unassigned appointments
  const handleSelfAssignment = async (appointmentId: string) => {
    if (!currentStaff) {
      showError('Staff Information Error', 'Staff information not available. Please refresh the page.');
      return;
    }

    const appointment = allAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
      showError('Appointment Error', 'Appointment not found in the current list.');
      return;
    }

    if (appointment.staffId && appointment.staffName !== 'Unassigned') {
      showWarning('Already Assigned', 'This appointment is already assigned to another staff member.');
      return;
    }

    // Check for scheduling conflicts
    const conflictingAppointment = assignedAppointments.find(apt => 
      apt.date === appointment.date && 
      apt.time === appointment.time &&
      apt.status !== 'CANCELLED'
    );

    if (conflictingAppointment) {
      setConflictData({
        appointmentId,
        appointment,
        conflictingAppointment,
        time: formatTimeForDisplay(appointment.time),
        date: new Date(appointment.date).toLocaleDateString()
      });
      setShowConflictConfirm(true);
      return;
    }

    // Proceed with assignment if no conflicts
    await proceedWithAssignment(appointmentId);
  };

  const proceedWithAssignment = async (appointmentId: string) => {
    if (!currentStaff) {
      showError('Staff Information Error', 'Staff information not available. Please refresh the page.');
      return;
    }

    const appointment = allAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
      showError('Appointment Error', 'Appointment not found in the current list.');
      return;
    }

    try {
      setAssigningAppointment(appointmentId);
      
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/assign-staff`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ staffId: currentStaff.id }),
        }
      );

      if (response.ok) {
        // Reload appointments to get fresh data
        await loadAppointments();
        showSuccess(
          'Assignment Successful!',
          `Successfully assigned yourself to ${appointment.customerName}'s appointment.`
        );
      } else {
        throw new Error(`Failed to assign appointment: ${response.status}`);
      }
    } catch (error) {
      console.error('Error assigning appointment:', error);
      showError('Assignment Failed', 'Failed to assign appointment. Please try again.');
    } finally {
      setAssigningAppointment(null);
    }
  };

  const handleSelfUnassignment = async (appointmentId: string) => {
    if (!currentStaff) {
      showError('Staff Information Error', 'Staff information not available. Please refresh the page.');
      return;
    }

    const appointment = assignedAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
      showError('Appointment Error', 'Appointment not found in your assigned appointments.');
      return;
    }

    if (appointment.staffId !== currentStaff.id.toString()) {
      showError('Not Authorized', 'You can only unassign yourself from appointments assigned to you.');
      return;
    }

    // Check if appointment is already completed
    if (appointment.status === 'COMPLETED') {
      showWarning('Cannot Unassign', 'Cannot unassign from completed appointments.');
      return;
    }

    // Check if appointment is today or in the past
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    setUnassignData({
      appointmentId,
      appointment,
      appointmentDate,
      today,
      isPastOrToday: appointmentDate <= today
    });
    setShowUnassignConfirm(true);
  };

  const proceedWithUnassignment = async (appointmentId: string) => {
    const appointment = assignedAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
      showError('Appointment Error', 'Appointment not found in your assigned appointments.');
      return;
    }

    try {
      setUnassigningAppointment(appointmentId);
      
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/unassign-staff`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Reload appointments to get fresh data
        await loadAppointments();
        showSuccess(
          'Unassignment Successful!',
          `Successfully unassigned yourself from ${appointment.customerName}'s appointment.`
        );
      } else {
        throw new Error(`Failed to unassign appointment: ${response.status}`);
      }
    } catch (error) {
      console.error('Error unassigning appointment:', error);
      showError('Unassignment Failed', 'Failed to unassign appointment. Please try again.');
    } finally {
      setUnassigningAppointment(null);
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

  const getFilterOptions = () => {
    const today = new Date().toISOString().split('T')[0];
    const sourceAppointments = selectedFilter === 'assigned' ? assignedAppointments : allAppointments;
    
    return [
      { 
        key: 'assigned' as FilterType, 
        label: 'My Assignments', 
        count: assignedAppointments.length,
        description: 'Appointments assigned to me'
      },
      { 
        key: 'today' as FilterType, 
        label: 'Today', 
        count: sourceAppointments.filter(apt => apt.date === today).length,
        description: 'Today\'s appointments'
      },
      { 
        key: 'upcoming' as FilterType, 
        label: 'Upcoming', 
        count: sourceAppointments.filter(apt => 
          new Date(apt.date) > new Date() && 
          apt.status !== 'COMPLETED' && 
          apt.status !== 'CANCELLED'
        ).length,
        description: 'Future appointments'
      },
      { 
        key: 'pending' as FilterType, 
        label: 'Pending', 
        count: sourceAppointments.filter(apt => apt.status === 'PENDING').length,
        description: 'Awaiting confirmation'
      },
      { 
        key: 'completed' as FilterType, 
        label: 'Completed', 
        count: sourceAppointments.filter(apt => apt.status === 'COMPLETED').length,
        description: 'Finished appointments'
      },
      { 
        key: 'unassigned' as FilterType, 
        label: 'Unassigned', 
        count: allAppointments.filter(apt => !apt.staffId || apt.staffName === 'Unassigned').length,
        description: 'Available for assignment'
      }
    ];
  };

  const handleViewAppointment = (appointment: StaffAppointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const isAppointmentActionable = (appointment: StaffAppointment, action: string) => {
    if (!currentStaff) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const isAssigned = appointment.staffId === currentStaff.id.toString();
    
    switch (action) {
      case 'confirm':
        return isAssigned && appointment.status === 'PENDING';
      case 'complete':
        return isAssigned && 
               appointment.date <= today && 
               (appointment.status === 'CONFIRMED' || appointment.status === 'PENDING');
      case 'cancel':
        return isAssigned && 
               appointment.status !== 'COMPLETED' && 
               appointment.status !== 'CANCELLED';
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Appointments</h1>
          <p className="text-gray-400 mt-1">
            {currentStaff ? `Welcome, ${currentStaff.name}` : 'Manage your appointments and schedule'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex bg-[#181818] rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm ${
                viewMode === "list"
                  ? "bg-[#F7BF24] text-black font-medium"
                  : "text-gray-400 hover:text-[#F7BF24] hover:bg-[#232323]"
              }`}
            >
              <ListIcon className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm ${
                viewMode === "calendar"
                  ? "bg-[#F7BF24] text-black font-medium"
                  : "text-gray-400 hover:text-[#F7BF24] hover:bg-[#232323]"
              }`}
            >
              <GridIcon className="h-4 w-4" />
              Calendar
            </button>
          </div>
          
          <button
            onClick={loadAppointments}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-[#F7BF24] text-black rounded-lg hover:bg-[#F7BF24]/80 transition-colors disabled:opacity-50"
          >
            <RefreshCwIcon size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircleIcon size={20} className="text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">My Assignments</p>
              <p className="text-2xl font-bold text-white">{assignedAppointments.length}</p>
              <p className="text-xs text-gray-500">Total assigned to me</p>
            </div>
            <UserIcon className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Today's Work</p>
              <p className="text-2xl font-bold text-white">
                {assignedAppointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length}
              </p>
              <p className="text-xs text-gray-500">Appointments today</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-white">
                {assignedAppointments.filter(apt => apt.status === 'PENDING').length}
              </p>
              <p className="text-xs text-gray-500">Need confirmation</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-white">
                {assignedAppointments.filter(apt => apt.status === 'COMPLETED').length}
              </p>
              <p className="text-xs text-gray-500">Finished services</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FilterIcon size={20} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Filter Appointments</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {getFilterOptions().map((option) => (
            <button
              key={option.key}
              onClick={() => setSelectedFilter(option.key)}
              className={`p-4 rounded-lg font-medium transition-colors text-center ${
                selectedFilter === option.key
                  ? 'bg-[#F7BF24] text-black'
                  : 'bg-[#232323] text-gray-300 hover:bg-[#2a2a2a] border border-gray-600'
              }`}
            >
              <div className="font-semibold text-lg">{option.count}</div>
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs opacity-75 mt-1">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-[#181818] rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {selectedFilter === 'assigned' ? 'My Assigned Appointments' :
             selectedFilter === 'today' ? 'Today\'s Appointments' :
             selectedFilter === 'upcoming' ? 'Upcoming Appointments' :
             selectedFilter === 'pending' ? 'Pending Appointments' :
             selectedFilter === 'completed' ? 'Completed Appointments' :
             selectedFilter === 'unassigned' ? 'Unassigned Appointments' :
             'Appointments'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {filteredAppointments.length} appointment(s) found
            {selectedFilter === 'assigned' && ' • Only showing appointments assigned to you'}
            {selectedFilter === 'unassigned' && ' • Appointments available for self-assignment'}
          </p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7BF24]"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No appointments found</p>
              <p className="text-gray-500 text-sm">
                {selectedFilter === 'assigned' ? 'No appointments have been assigned to you yet' :
                 selectedFilter === 'today' ? 'No appointments scheduled for today' :
                 selectedFilter === 'upcoming' ? 'No upcoming appointments' :
                 selectedFilter === 'pending' ? 'No pending appointments' :
                 selectedFilter === 'completed' ? 'No completed appointments' :
                 selectedFilter === 'unassigned' ? 'No unassigned appointments available' :
                 'No appointments available'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => {
                const isAssigned = currentStaff && appointment.staffId === currentStaff.id.toString();
                const isToday = appointment.date === new Date().toISOString().split('T')[0];
                const isFuture = appointment.date > new Date().toISOString().split('T')[0];
                
                return (
                  <div 
                    key={appointment.id} 
                    className={`rounded-lg p-6 border transition-all duration-200 hover:shadow-lg ${
                      isAssigned 
                        ? 'bg-[#232323] border-[#F7BF24]/30 hover:border-[#F7BF24]/50' 
                        : 'bg-[#1a1a1a] border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-black font-bold ${
                          isAssigned ? 'bg-[#F7BF24]' : 'bg-gray-600'
                        }`}>
                          {appointment.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-lg">{appointment.customerName}</h4>
                          <p className="text-gray-300">{appointment.service}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1 text-sm text-gray-400">
                              <PhoneIcon size={14} />
                              <span>{appointment.customerPhone}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-400">
                              <MailIcon size={14} />
                              <span>{appointment.customerEmail}</span>
                            </div>
                            {appointment.servicePrice && (
                              <div className="flex items-center space-x-1 text-sm text-gray-400">
                                <DollarSignIcon size={14} />
                                <span>${appointment.servicePrice}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1 text-sm text-gray-400">
                              <ClockIcon size={14} />
                              <span>{appointment.serviceDuration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <CalendarIcon size={16} className="text-gray-400" />
                          <span className={`font-medium ${
                            isToday ? 'text-[#F7BF24]' : 
                            isFuture ? 'text-blue-400' : 
                            'text-gray-300'
                          }`}>
                            {new Date(appointment.date).toLocaleDateString()}
                            {isToday && ' (Today)'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <ClockIcon size={16} className="text-gray-400" />
                          <span className="text-white font-medium">
                            {formatTimeForDisplay(appointment.time)} - {formatTimeForDisplay(appointment.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusDisplay(appointment.status)}
                          </div>
                          {isAssigned && (
                            <div className="px-2 py-1 bg-[#F7BF24]/20 text-[#F7BF24] rounded-full text-xs font-medium">
                              Assigned to you
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Staff: {appointment.staffName}
                        </div>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mb-4 p-3 bg-[#2a2a2a] rounded text-sm text-gray-300">
                        <strong>Notes:</strong> {appointment.notes}
                      </div>
                    )}
                    
                    {/* Validation Warnings */}
                    {isFuture && appointment.status === 'COMPLETED' && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangleIcon size={16} className="text-red-400" />
                          <p className="text-red-400 text-sm">
                            ⚠️ This appointment is marked as completed but scheduled for a future date
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleViewAppointment(appointment)}
                        className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                      >
                        <EyeIcon size={16} />
                        <span>View Details</span>
                      </button>
                      
                      {isAppointmentActionable(appointment, 'confirm') && (
                        <button 
                          onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                          disabled={updatingAppointment === appointment.id}
                          className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          <CheckCircleIcon size={16} />
                          <span>Confirm</span>
                        </button>
                      )}
                      
                      {isAppointmentActionable(appointment, 'complete') && (
                        <button 
                          onClick={() => updateAppointmentStatus(appointment.id, 'COMPLETED')}
                          disabled={updatingAppointment === appointment.id}
                          className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          <CheckCircleIcon size={16} />
                          <span>Mark Complete</span>
                        </button>
                      )}
                      
                      {isAppointmentActionable(appointment, 'cancel') && (
                        <button 
                          onClick={() => handleCancelAppointment(appointment.id)}
                          disabled={updatingAppointment === appointment.id}
                          className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          <XCircleIcon size={16} />
                          <span>Cancel</span>
                        </button>
                      )}
                      
                      {/* Self-Assignment Button for Unassigned Appointments */}
                      {!isAssigned && (!appointment.staffId || appointment.staffName === 'Unassigned') && (
                        <button 
                          onClick={() => handleSelfAssignment(appointment.id)}
                          disabled={assigningAppointment === appointment.id}
                          className="bg-[#F7BF24] hover:bg-[#F7BF24]/80 text-black px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium"
                        >
                          <UserIcon size={16} />
                          <span>{assigningAppointment === appointment.id ? 'Assigning...' : 'Assign to Me'}</span>
                        </button>
                      )}
                      
                      {/* Self-Unassignment Button for Assigned Appointments */}
                      {isAssigned && appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                        <button 
                          onClick={() => handleSelfUnassignment(appointment.id)}
                          disabled={unassigningAppointment === appointment.id}
                          className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          <XIcon size={16} />
                          <span>{unassigningAppointment === appointment.id ? 'Unassigning...' : 'Unassign from Me'}</span>
                        </button>
                      )}
                      
                      {!isAssigned && appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                        <div className="px-4 py-2 bg-gray-600/20 text-gray-400 rounded-lg text-sm flex items-center space-x-2">
                          <AlertTriangleIcon size={16} />
                          <span>Not assigned to you</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
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
              <div className="bg-[#232323] rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#F7BF24] flex items-center justify-center text-black font-semibold text-lg">
                      {selectedAppointment.customerName.charAt(0).toUpperCase()}
                    </div>
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
              <div className="bg-[#232323] rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">Service Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Service</p>
                    <p className="text-white font-medium">{selectedAppointment.service}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="text-white">{selectedAppointment.serviceDuration}</p>
                  </div>
                  {selectedAppointment.servicePrice && (
                    <div>
                      <p className="text-sm text-gray-400">Price</p>
                      <p className="text-white">${selectedAppointment.servicePrice}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Info */}
              <div className="bg-[#232323] rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">Appointment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="text-white">{new Date(selectedAppointment.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Time</p>
                    <p className="text-white">
                      {formatTimeForDisplay(selectedAppointment.time)} - {formatTimeForDisplay(selectedAppointment.endTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Staff Member</p>
                    <p className="text-white">{selectedAppointment.staffName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                      {getStatusDisplay(selectedAppointment.status)}
                    </span>
                  </div>
                </div>
                {selectedAppointment.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400">Notes</p>
                    <div className="text-white mt-1">{selectedAppointment.notes}</div>
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
            </div>
          </div>
        </div>
      )}
      
      {/* Cancellation Prompt Dialog */}
      <PromptDialog
        isOpen={showCancelPrompt}
        title="Cancel Appointment"
        message="Please provide a reason for cancelling this appointment:"
        placeholder="Enter cancellation reason..."
        confirmText="Cancel Appointment"
        onConfirm={confirmCancelAppointment}
        onCancel={() => {
          setShowCancelPrompt(false);
          setCancelAppointmentId(null);
        }}
      />

      {/* Conflict Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConflictConfirm}
        title="Scheduling Conflict"
        message={
          conflictData ? 
          `⚠️ You already have an appointment at ${conflictData.time} on ${conflictData.date}.\n\nExisting: ${conflictData.conflictingAppointment.customerName} - ${conflictData.conflictingAppointment.service}\nNew: ${conflictData.appointment.customerName} - ${conflictData.appointment.service}\n\nDo you want to assign yourself to this appointment anyway?` 
          : ''
        }
        type="warning"
        confirmText="Assign Anyway"
        onConfirm={() => {
          setShowConflictConfirm(false);
          if (conflictData) {
            proceedWithAssignment(conflictData.appointmentId);
          }
          setConflictData(null);
        }}
        onCancel={() => {
          setShowConflictConfirm(false);
          setConflictData(null);
        }}
      />

      {/* Unassignment Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showUnassignConfirm}
        title={unassignData?.isPastOrToday ? "Unassign from Past/Today Appointment" : "Unassign from Appointment"}
        message={
          unassignData ? 
          (unassignData.isPastOrToday ? 
            `⚠️ This appointment is scheduled for ${unassignData.appointmentDate.toLocaleDateString()} (today or past).\n\nCustomer: ${unassignData.appointment.customerName}\nService: ${unassignData.appointment.service}\nTime: ${formatTimeForDisplay(unassignData.appointment.time)}\n\nAre you sure you want to unassign yourself? This may leave the customer without service.` :
            `Are you sure you want to unassign yourself from this appointment?\n\nCustomer: ${unassignData.appointment.customerName}\nService: ${unassignData.appointment.service}\nDate: ${unassignData.appointmentDate.toLocaleDateString()}\nTime: ${formatTimeForDisplay(unassignData.appointment.time)}\n\nThe appointment will become available for other staff to pick up.`
          ) : ''
        }
        type={unassignData?.isPastOrToday ? "danger" : "warning"}
        confirmText="Yes, Unassign"
        onConfirm={() => {
          setShowUnassignConfirm(false);
          if (unassignData) {
            proceedWithUnassignment(unassignData.appointmentId);
          }
          setUnassignData(null);
        }}
        onCancel={() => {
          setShowUnassignConfirm(false);
          setUnassignData(null);
        }}
      />

      {/* Alert Box */}
      <AlertBox
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={hideAlert}
        autoClose={true}
        autoCloseDelay={3000}
      />
    </div>
  );
};

export default StaffAppointments;
