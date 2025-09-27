// Admin service for managing services through backend API
const API_BASE_URL = 'http://localhost:8080/api'; // Adjust port as needed

export interface ServiceRequest {
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  isActive: boolean;
  requirements?: string[];
  staffAssigned?: string[];
}

export interface ServiceResponse {
  id: number; // Backend uses Long which maps to number
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  popularityRank?: number;
  staffAssigned?: string[];
  requirements?: string[];
}

class AdminService {
  // Test backend connection
  async testConnection(): Promise<boolean> {
    try {
      const url = `${API_BASE_URL}/services`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Get all services
  async getAllServices(): Promise<ServiceResponse[]> {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    return await response.json();
  }

  // Get service by ID
  async getServiceById(id: number): Promise<ServiceResponse> {
    const response = await fetch(`${API_BASE_URL}/services/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Create new service
  async createService(serviceData: ServiceRequest): Promise<ServiceResponse> {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Update existing service
  async updateService(id: number, serviceData: ServiceRequest): Promise<ServiceResponse> {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Delete service
  async deleteService(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // Toggle service status
  async toggleServiceStatus(id: number): Promise<ServiceResponse> {
    const response = await fetch(`${API_BASE_URL}/services/${id}/toggle-status`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Search services
  async searchServices(query: string): Promise<ServiceResponse[]> {
    const response = await fetch(`${API_BASE_URL}/services/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Get services by category
  async getServicesByCategory(category: string): Promise<ServiceResponse[]> {
    const response = await fetch(`${API_BASE_URL}/services/category/${encodeURIComponent(category)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Get active services only
  async getActiveServices(): Promise<ServiceResponse[]> {
    const response = await fetch(`${API_BASE_URL}/services/active`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Get all categories
  async getCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/services/categories`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Get all staff members
  async getAllStaff(): Promise<StaffResponse[]> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/admin/staff`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Get active staff count
  async getActiveStaffCount(): Promise<number> {
    const allStaff = await this.getAllStaff();
    return allStaff.filter(staff => staff.isActive).length;
  }
}

export interface StaffResponse {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const adminService = new AdminService();
