// Service for handling appointment and service API calls
// const API_BASE_URL = 'http://localhost:8080/api'; // Adjust port as needed (currently using mock data)

export interface AppointmentBooking {
  id?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  customerId?: string;
  service: string;
  serviceId?: string;
  serviceCategory?: string;
  serviceDuration?: string;
  servicePrice?: number;
  staffName?: string;
  staffId?: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format (24-hour)
  endTime?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  bookedBy: 'customer' | 'admin' | 'staff'; // Track who created the appointment
  bookedByUserId?: string; // ID of the user who created the appointment
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number; // in minutes
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Backend API interfaces
export interface AppointmentRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  appointmentDateTime: string; // ISO 8601 format
  notes?: string;
}

export interface AppointmentResponse {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: Service;
  appointmentDateTime: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  isAvailable: boolean;
  email?: string;
  phone?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive?: boolean;
}

// Service data
export const services: Service[] = [
  { id: '1', name: 'Haircut', category: 'Hair', price: 50, duration: 60, description: 'Professional haircut and styling', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Tattoo', category: 'Tattoo', price: 120, duration: 180, description: 'Custom tattoo design and application', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'Piercing', category: 'Piercing', price: 40, duration: 30, description: 'Professional body piercing', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', name: 'Spa', category: 'Spa', price: 80, duration: 90, description: 'Relaxing spa treatment', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '5', name: 'Premium Haircut & Styling', category: 'Hair', price: 85, duration: 90, description: 'Premium cut with advanced styling', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '6', name: 'Hair Coloring & Highlights', category: 'Hair', price: 125, duration: 150, description: 'Professional hair coloring service', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '7', name: 'Beard Styling & Trim', category: 'Hair', price: 35, duration: 45, description: 'Beard trimming and styling', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '8', name: 'Full Spa Package', category: 'Spa', price: 150, duration: 120, description: 'Complete spa relaxation package', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '9', name: 'Manicure & Pedicure', category: 'Nails', price: 65, duration: 75, description: 'Hand and foot care service', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
];

// Staff data
export const staffMembers: StaffMember[] = [
  { id: 'staff-1', name: 'Jamie Rodriguez', role: 'Senior Hair Stylist', specialties: ['Hair', 'Styling'], isAvailable: true },
  { id: 'staff-2', name: 'Alex Kim', role: 'Master Barber', specialties: ['Hair', 'Beard'], isAvailable: true },
  { id: 'staff-3', name: 'Jordan Smith', role: 'Hair Colorist', specialties: ['Hair', 'Coloring'], isAvailable: true },
  { id: 'staff-4', name: 'Taylor Morgan', role: 'Spa Specialist', specialties: ['Spa', 'Massage'], isAvailable: true },
  { id: 'staff-5', name: 'Riley Parker', role: 'Nail Technician', specialties: ['Nails', 'Manicure'], isAvailable: true }
];

// Mock customers data
export const customers: Customer[] = [
  { id: 'cust-1', name: 'Sarah Johnson', email: 'sarah.johnson@email.com', phone: '+1 (555) 123-4567', isActive: true },
  { id: 'cust-2', name: 'Michael Chen', email: 'michael.chen@email.com', phone: '+1 (555) 234-5678', isActive: true },
  { id: 'cust-3', name: 'Jessica Williams', email: 'jessica.williams@email.com', phone: '+1 (555) 345-6789', isActive: true },
  { id: 'cust-4', name: 'David Brown', email: 'david.brown@email.com', phone: '+1 (555) 456-7890', isActive: true },
  { id: 'cust-5', name: 'Emma Davis', email: 'emma.davis@email.com', phone: '+1 (555) 567-8901', isActive: true },
  { id: 'cust-6', name: 'James Wilson', email: 'james.wilson@email.com', phone: '+1 (555) 678-9012', isActive: true },
  { id: 'cust-7', name: 'Olivia Martinez', email: 'olivia.martinez@email.com', phone: '+1 (555) 789-0123', isActive: true },
  { id: 'cust-8', name: 'Noah Anderson', email: 'noah.anderson@email.com', phone: '+1 (555) 890-1234', isActive: true }
];

// Available time slots
export const availableTimeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00"
];

// Utility functions
export const generateAppointmentId = (): string => {
  return 'apt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

export const formatTimeForDisplay = (time24: string): string => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(" ");
  let [hours] = time.split(":").map(Number);
  const [, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }
  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
};

export const getServiceById = (serviceId: string): Service | undefined => {
  return services.find(service => service.id === serviceId);
};

export const getServiceByName = (serviceName: string): Service | undefined => {
  return services.find(service => service.name === serviceName);
};

export const getStaffById = (staffId: string): StaffMember | undefined => {
  return staffMembers.find(staff => staff.id === staffId);
};

export const getCustomerById = (customerId: string): Customer | undefined => {
  return customers.find(customer => customer.id === customerId);
};

export const getAvailableStaffForService = (serviceCategory: string): StaffMember[] => {
  return staffMembers.filter(staff => 
    staff.isAvailable && staff.specialties.includes(serviceCategory)
  );
};

// Mock appointment storage (in real app, this would be API calls)
class AppointmentStorage {
  private static KEY = 'salon_appointments';

  static getAll(): AppointmentBooking[] {
    const stored = localStorage.getItem(this.KEY);
    if (!stored) {
      // Initialize with some sample data
      const sampleData = this.getSampleData();
      this.save(sampleData);
      return sampleData;
    }
    return JSON.parse(stored);
  }

  static getSampleData(): AppointmentBooking[] {
    return [
      {
        id: 'apt-1',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.johnson@email.com',
        customerPhone: '+1 (555) 123-4567',
        customerId: 'cust-1',
        service: 'Premium Haircut & Styling',
        serviceCategory: 'Hair',
        serviceDuration: '90 min',
        servicePrice: 85,
        staffName: 'Jamie Rodriguez',
        staffId: 'staff-1',
        date: '2025-06-27',
        time: '10:00',
        endTime: '11:30',
        status: 'CONFIRMED',
        notes: 'Customer prefers layers',
        priority: 'medium',
        bookedBy: 'customer',
        bookedByUserId: 'cust-1',
        createdAt: '2025-06-26T10:00:00Z',
        updatedAt: '2025-06-26T10:00:00Z'
      },
      {
        id: 'apt-2',
        customerName: 'Michael Chen',
        customerEmail: 'michael.chen@email.com',
        customerPhone: '+1 (555) 234-5678',
        customerId: 'cust-2',
        service: 'Beard Styling & Trim',
        serviceCategory: 'Hair',
        serviceDuration: '45 min',
        servicePrice: 35,
        staffName: 'Alex Kim',
        staffId: 'staff-2',
        date: '2025-06-27',
        time: '11:30',
        endTime: '12:15',
        status: 'CONFIRMED',
        notes: 'Regular customer',
        priority: 'low',
        bookedBy: 'admin',
        bookedByUserId: 'admin-1',
        createdAt: '2025-06-26T11:00:00Z',
        updatedAt: '2025-06-27T09:00:00Z'
      },
      {
        id: 'apt-3',
        customerName: 'Jessica Williams',
        customerEmail: 'jessica.williams@email.com',
        customerPhone: '+1 (555) 345-6789',
        customerId: 'cust-3',
        service: 'Hair Coloring & Highlights',
        serviceCategory: 'Hair',
        serviceDuration: '150 min',
        servicePrice: 125,
        staffName: 'Jordan Smith',
        staffId: 'staff-3',
        date: '2025-06-27',
        time: '14:00',
        endTime: '16:30',
        status: 'PENDING',
        notes: 'First time customer - booked online',
        priority: 'high',
        bookedBy: 'customer',
        bookedByUserId: 'cust-3',
        createdAt: '2025-06-26T14:30:00Z',
        updatedAt: '2025-06-26T14:30:00Z'
      },
      {
        id: 'apt-4',
        customerName: 'Robert Garcia',
        customerEmail: 'robert.garcia@email.com',
        customerPhone: '+1 (555) 456-7890',
        customerId: 'cust-4',
        service: 'Full Spa Package',
        serviceCategory: 'Spa',
        serviceDuration: '120 min',
        servicePrice: 150,
        staffName: 'Taylor Morgan',
        staffId: 'staff-4',
        date: '2025-06-28',
        time: '15:30',
        endTime: '17:30',
        status: 'CONFIRMED',
        notes: 'Anniversary special - staff booked for customer',
        priority: 'high',
        bookedBy: 'staff',
        bookedByUserId: 'staff-4',
        createdAt: '2025-06-25T16:00:00Z',
        updatedAt: '2025-06-26T12:00:00Z'
      },
      {
        id: 'apt-5',
        customerName: 'Emily Davis',
        customerEmail: 'emily.davis@email.com',
        customerPhone: '+1 (555) 567-8901',
        customerId: 'cust-5',
        service: 'Manicure & Pedicure',
        serviceCategory: 'Nails',
        serviceDuration: '75 min',
        servicePrice: 65,
        staffName: 'Riley Parker',
        staffId: 'staff-5',
        date: '2025-06-29',
        time: '09:00',
        endTime: '10:15',
        status: 'CONFIRMED',
        notes: 'Customer self-booked online',
        priority: 'medium',
        bookedBy: 'customer',
        bookedByUserId: 'cust-5',
        createdAt: '2025-06-27T08:00:00Z',
        updatedAt: '2025-06-27T08:00:00Z'
      }
    ];
  }

  static save(appointments: AppointmentBooking[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(appointments));
  }

  static add(appointment: AppointmentBooking): AppointmentBooking {
    const appointments = this.getAll();
    const newAppointment = {
      ...appointment,
      id: generateAppointmentId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: appointment.status || 'PENDING'
    };
    appointments.push(newAppointment);
    this.save(appointments);
    return newAppointment;
  }

  static update(id: string, updates: Partial<AppointmentBooking>): AppointmentBooking | null {
    const appointments = this.getAll();
    const index = appointments.findIndex(apt => apt.id === id);
    if (index === -1) return null;

    appointments[index] = {
      ...appointments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save(appointments);
    return appointments[index];
  }

  static delete(id: string): boolean {
    const appointments = this.getAll();
    const index = appointments.findIndex(apt => apt.id === id);
    if (index === -1) return false;

    appointments.splice(index, 1);
    this.save(appointments);
    return true;
  }
}

// Main appointment service functions
export const appointmentService = {
  // Book appointment (customer self-booking)
  bookAppointment: async (appointmentData: Omit<AppointmentBooking, 'id' | 'bookedBy' | 'bookedByUserId'>): Promise<AppointmentBooking> => {
    // In real app, this would be an API call
    const appointment = AppointmentStorage.add({
      ...appointmentData,
      bookedBy: 'customer',
      bookedByUserId: appointmentData.customerId || 'unknown'
    });
    return appointment;
  },

  // Create appointment (admin/staff booking for customer)
  createAppointment: async (appointmentData: Omit<AppointmentBooking, 'id'>, createdByUserId: string): Promise<AppointmentBooking> => {
    // In real app, this would be an API call
    const appointment = AppointmentStorage.add({
      ...appointmentData,
      bookedByUserId: createdByUserId
    });
    return appointment;
  },

  // Get all appointments
  getAllAppointments: async (): Promise<AppointmentBooking[]> => {
    // In real app, this would be an API call
    return AppointmentStorage.getAll();
  },

  // Update appointment
  updateAppointment: async (id: string, updates: Partial<AppointmentBooking>): Promise<AppointmentBooking | null> => {
    // In real app, this would be an API call
    return AppointmentStorage.update(id, updates);
  },

  // Cancel appointment
  cancelAppointment: async (id: string, reason?: string): Promise<boolean> => {
    // In real app, this would be an API call
    const updated = AppointmentStorage.update(id, { 
      status: 'CANCELLED', 
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
    });
    return updated !== null;
  },

  // Get appointments for a specific date
  getAppointmentsByDate: async (date: string): Promise<AppointmentBooking[]> => {
    const allAppointments = await appointmentService.getAllAppointments();
    return allAppointments.filter(apt => apt.date === date);
  },

  // Get appointments for a specific customer
  getAppointmentsByCustomer: async (customerId: string): Promise<AppointmentBooking[]> => {
    const allAppointments = await appointmentService.getAllAppointments();
    return allAppointments.filter(apt => apt.customerId === customerId);
  },

  // Check if time slot is available
  isTimeSlotAvailable: async (date: string, time: string, staffId?: string): Promise<boolean> => {
    const dayAppointments = await appointmentService.getAppointmentsByDate(date);
    
    if (staffId) {
      // Check specific staff availability
      return !dayAppointments.some(apt => 
        apt.staffId === staffId && 
        apt.time === time && 
        apt.status !== 'CANCELLED'
      );
    } else {
      // Check general availability (any staff can handle)
      return dayAppointments.filter(apt => 
        apt.time === time && 
        apt.status !== 'CANCELLED'
      ).length < staffMembers.length;
    }
  }
};

export default appointmentService;
