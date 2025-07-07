// Admin service for managing services through backend API
const API_BASE_URL = 'http://localhost:8080/api'; // Adjust port as needed

// Add debugging function
const debugRequest = (url: string, options?: RequestInit) => {
  console.log(`Making request to: ${url}`);
  console.log('Request options:', options);
};

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
      debugRequest(url, { method: 'HEAD' });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('Connection test response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  // Get all services
  async getAllServices(): Promise<ServiceResponse[]> {
    try {
      const url = `${API_BASE_URL}/services`;
      debugRequest(url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  // Get service by ID
  async getServiceById(id: number): Promise<ServiceResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  }

  // Create new service
  async createService(serviceData: ServiceRequest): Promise<ServiceResponse> {
    try {
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
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  // Update existing service
  async updateService(id: number, serviceData: ServiceRequest): Promise<ServiceResponse> {
    try {
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
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  // Delete service
  async deleteService(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  // Toggle service status
  async toggleServiceStatus(id: number): Promise<ServiceResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}/toggle-status`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error toggling service status:', error);
      throw error;
    }
  }

  // Search services
  async searchServices(query: string): Promise<ServiceResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  }

  // Get services by category
  async getServicesByCategory(category: string): Promise<ServiceResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/category/${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching services by category:', error);
      throw error;
    }
  }

  // Get active services only
  async getActiveServices(): Promise<ServiceResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/active`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching active services:', error);
      throw error;
    }
  }

  // Get all categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
