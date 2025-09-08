import { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon,
  XIcon,
  SearchIcon
} from 'lucide-react';
import useUserData from '../../../hooks/useUserData';
import { useAlert } from '../../../hooks/useAlert';
import { adminService, ServiceResponse } from '../../../services/adminService';
import AlertBox from '../../../components/ui/AlertBox';

interface StaffService extends ServiceResponse {
  isAssigned: boolean;
  isStaffAvailable: boolean; // Staff-specific availability toggle
}

const StaffServices = () => {
  const [allServices, setAllServices] = useState<ServiceResponse[]>([]);
  const [staffServices, setStaffServices] = useState<StaffService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const user = useUserData();
  const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();

  const loadAllServices = async () => {
    try {
      const services = await adminService.getAllServices();
      setAllServices(services.filter(service => service.isActive)); // Only show active services
    } catch (err) {
      console.error('Error loading all services:', err);
    }
  };

  const loadStaffServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Ensure we have a valid user ID before making the API call
      if (!user.id || user.id === 0) {
        console.log('Waiting for user data to load...');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/staff/${user.id}/services`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const staffServiceData = await response.json();
        setStaffServices(staffServiceData);
      } else if (response.status === 404) {
        // No services assigned yet - start with empty array
        setStaffServices([]);
      } else {
        throw new Error(`Failed to load services: ${response.status}`);
      }
    } catch (err) {
      setError('Failed to load services from server');
      console.error('Error loading services:', err);
      // Don't fallback to mock data - show the error
      setStaffServices([]);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    // Only load services when we have a valid user ID
    if (user.id && user.id !== 0) {
      loadAllServices();
      loadStaffServices();
    }
  }, [user.id, loadStaffServices]);

  // Refresh data function
  const refreshData = async () => {
    await Promise.all([
      loadAllServices(),
      loadStaffServices()
    ]);
  };

  const toggleServiceAvailability = async (serviceId: number) => {
    try {
      if (!user.id || user.id === 0) {
        showWarning('User Error', 'User not properly loaded. Please refresh the page.');
        return;
      }

      const service = staffServices.find(s => s.id === serviceId);
      if (!service) return;

      const token = localStorage.getItem('token');
      if (!token) {
        showWarning('Authentication Required', 'Please login to continue.');
        return;
      }

      // Update backend first
      const response = await fetch(`http://localhost:8080/api/staff/${user.id}/services/${serviceId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          isAvailable: !service.isStaffAvailable
        })
      });

      if (response.ok) {
        // Only update local state if backend update was successful
        const updatedServices = staffServices.map(s => 
          s.id === serviceId 
            ? { ...s, isStaffAvailable: !s.isStaffAvailable }
            : s
        );
        setStaffServices(updatedServices);
        showSuccess(
          'Success!', 
          `Service availability has been ${!service.isStaffAvailable ? 'enabled' : 'disabled'} successfully!`
        );
      } else {
        // Handle empty response body for error cases
        let errorMessage = 'Failed to update service availability';
        try {
          const responseText = await response.text();
          if (responseText) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } else {
            errorMessage = `Server error (${response.status}): ${response.statusText}`;
          }
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating service availability:', error);
      showError(
        'Update Failed', 
        `Failed to update service availability: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const addServiceToStaff = async (serviceId: number) => {
    try {
      if (!user.id || user.id === 0) {
        showWarning('User Error', 'User not properly loaded. Please refresh the page.');
        return;
      }

      const serviceToAdd = allServices.find(s => s.id === serviceId);
      if (!serviceToAdd) {
        showError('Service Error', 'Service not found in the available services list.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        showWarning('Authentication Required', 'Please login to continue.');
        return;
      }

      console.log('Adding service to staff:', { serviceId, staffId: user.id });

      // Add to backend first
      const response = await fetch(`http://localhost:8080/api/staff/${user.id}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          serviceId: serviceId,
          isAvailable: true
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        // Only update local state if backend operation was successful
        const newStaffService: StaffService = {
          ...serviceToAdd,
          isAssigned: true,
          isStaffAvailable: true
        };
        
        setStaffServices(prev => [...prev, newStaffService]);
        showSuccess('Service Added!', `${serviceToAdd.name} has been successfully added to your service list.`);
      } else {
        // Handle empty response body for error cases
        let errorMessage = 'Failed to add service';
        try {
          const responseText = await response.text();
          if (responseText) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } else {
            errorMessage = `Server error (${response.status}): ${response.statusText}`;
          }
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding service:', error);
      showError(
        'Failed to Add Service', 
        `Could not add service: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const removeServiceFromStaff = async (serviceId: number) => {
    try {
      if (!user.id || user.id === 0) {
        showWarning('User Error', 'User not properly loaded. Please refresh the page.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        showWarning('Authentication Required', 'Please login to continue.');
        return;
      }

      // Find the service name for the success message
      const serviceToRemove = staffServices.find(s => s.id === serviceId);
      const serviceName = serviceToRemove?.name || 'Service';

      // Remove from backend first
      const response = await fetch(`http://localhost:8080/api/staff/${user.id}/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Only update local state if backend operation was successful
        setStaffServices(prev => prev.filter(s => s.id !== serviceId));
        showSuccess('Service Removed!', `${serviceName} has been successfully removed from your service list.`);
      } else {
        // Handle empty response body for error cases
        let errorMessage = 'Failed to remove service';
        try {
          const responseText = await response.text();
          if (responseText) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } else {
            errorMessage = `Server error (${response.status}): ${response.statusText}`;
          }
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error removing service:', error);
      showError(
        'Failed to Remove Service', 
        `Could not remove service: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  // Get unique categories from all services
  const categories = ['all', ...Array.from(new Set(allServices.map(service => service.category)))];

  // Filter available services to add (not already assigned)
  const availableServicesToAdd = allServices.filter(service => 
    !staffServices.some(staffService => staffService.id === service.id) &&
    (selectedCategory === 'all' || service.category === selectedCategory) &&
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter staff services by category
  const filteredStaffServices = selectedCategory === 'all' 
    ? staffServices 
    : staffServices.filter(service => service.category === selectedCategory);

  // Calculate statistics
  const totalServices = staffServices.length;
  const availableServices = staffServices.filter(s => s.isStaffAvailable).length;
  const totalRevenue = staffServices.reduce((sum, service) => sum + service.price, 0);
  const avgDuration = totalServices > 0 ? staffServices.reduce((sum, service) => sum + service.duration, 0) / totalServices : 0;

  return (
    <div className="min-h-screen bg-[#212121] text-white">
      {/* Header */}
      <div className="bg-[#181818] border-b border-gray-700 px-6 py-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">My Services</h1>
            <p className="text-gray-400">Manage your service availability and specializations</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
              title="Refresh data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="flex items-center gap-2 bg-[#F7BF24] hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
            >
              <PlusIcon className="w-5 h-5" />
              Add Service
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-white">{totalServices}</p>
                <p className="text-gray-400">Total Services</p>
              </div>
            </div>
          </div>

          <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500/20">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-white">{availableServices}</p>
                <p className="text-gray-400">Available Now</p>
              </div>
            </div>
          </div>

          <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-[#F7BF24]/20">
                <svg className="w-6 h-6 text-[#F7BF24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-white">Rs. {totalRevenue.toFixed(0)}</p>
                <p className="text-gray-400">Total Value</p>
              </div>
            </div>
          </div>

          <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-white">{Math.round(avgDuration)}</p>
                <p className="text-gray-400">Avg Duration (min)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#F7BF24] text-black'
                      : 'bg-[#232323] text-gray-300 hover:bg-[#2a2a2a] border border-gray-600'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-[#232323] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#F7BF24] focus:border-[#F7BF24] focus:outline-none"
                />
              </div>
              <div className="text-gray-400 whitespace-nowrap">
                {filteredStaffServices.length} service(s)
              </div>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7BF24]"></div>
              <p className="mt-2 text-gray-400">Loading services...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-400 text-lg font-medium">{error}</p>
              <button
                onClick={refreshData}
                className="mt-4 bg-[#F7BF24] text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredStaffServices.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400">No services assigned for this category</p>
              <p className="text-sm text-gray-500 mt-2">Click "Add Service" to select services you can provide</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredStaffServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-[#181818] p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full border border-blue-500/30">
                          {service.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 mb-4">{service.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span>Rs. {service.price}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{service.duration} minutes</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => removeServiceFromStaff(service.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Remove service"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {service.isStaffAvailable ? 'Available' : 'Unavailable'}
                        </p>
                        <p className="text-xs text-gray-500">Toggle availability</p>
                      </div>
                      
                      <button
                        onClick={() => toggleServiceAvailability(service.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#F7BF24] focus:ring-offset-2 focus:ring-offset-[#181818] ${
                          service.isStaffAvailable ? 'bg-[#F7BF24]' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            service.isStaffAvailable ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#181818] rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Service</h2>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="p-2 text-gray-400 hover:text-white rounded-lg"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            {availableServicesToAdd.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">All available services are already assigned to you.</p>
                <button
                  onClick={() => setShowAddServiceModal(false)}
                  className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {availableServicesToAdd.map((service) => (
                  <div
                    key={service.id}
                    className="border border-gray-700 rounded-lg p-4 hover:bg-[#212121] transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                            {service.category}
                          </span>
                        </div>
                        <p className="text-gray-400 mb-2">{service.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Rs. {service.price}</span>
                          <span>{service.duration} min</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          addServiceToStaff(service.id);
                          setShowAddServiceModal(false);
                        }}
                        className="bg-[#F7BF24] text-black px-4 py-2 rounded-lg hover:bg-[#F7BF24]/90 transition-colors font-medium"
                      >
                        Add Service
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
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

export default StaffServices;
