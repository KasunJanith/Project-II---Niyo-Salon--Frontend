// Booking service for appointment management through backend API
const API_BASE_URL = 'http://localhost:8080/api'; // Adjust port as needed

export interface AppointmentRequest {
  customerName: string;
  customerPhone: string;
  services: string; // Comma-separated service names
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // Time string (HH:MM)
  notes?: string;
  userId?: number;
}

export interface AppointmentResponse {
  id: number;
  customerName: string;
  customerPhone: string;
  services: string;
  date: string;
  time: string;
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export interface TimeSlotAvailabilityRequest {
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // Time string (HH:MM)
}

class BookingService {
  // Create new appointment
  async bookAppointment(appointmentData: AppointmentRequest): Promise<AppointmentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  }

  // Get all appointments
  async getAllAppointments(): Promise<AppointmentResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  // Get appointment by ID
  async getAppointmentById(id: number): Promise<AppointmentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  }

  // Get appointments by date
  async getAppointmentsByDate(date: string): Promise<AppointmentResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/date/${date}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      throw error;
    }
  }

  // Get appointments by customer phone
  async getAppointmentsByCustomerPhone(customerPhone: string): Promise<AppointmentResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/customer/${encodeURIComponent(customerPhone)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments by customer phone:', error);
      throw error;
    }
  }

  // Check time slot availability
  async checkTimeSlotAvailability(request: TimeSlotAvailabilityRequest): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      throw error;
    }
  }

  // Get available time slots for a date
  async getAvailableTimeSlots(date: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/available-slots/${date}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      throw error;
    }
  }

  // Update appointment status
  async updateAppointmentStatus(id: number, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'): Promise<AppointmentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}/status?status=${status}`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  // Cancel appointment
  async cancelAppointment(id: number): Promise<AppointmentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }

  // Delete appointment
  async deleteAppointment(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  // Get appointments by date range
  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<AppointmentResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/date-range?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments by date range:', error);
      throw error;
    }
  }
}

export const bookingService = new BookingService();
