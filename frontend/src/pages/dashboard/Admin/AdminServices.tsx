import { useState, useEffect } from 'react';
import { 
  PlusIcon,
  SearchIcon,
  EditIcon,
  Trash2Icon,
  EyeIcon,
  XIcon,
  CheckIcon,
  ClockIcon,
  DollarSignIcon,
  TagIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  ScissorsIcon,
  SparklesIcon,
  UserIcon,
  FilterIcon,
  MoreVerticalIcon,
  SaveIcon,
  AlertCircleIcon,
  LoaderIcon
} from 'lucide-react';
import { adminService, ServiceRequest, ServiceResponse } from '../../../services/adminService';

// Service interface extending the API response
interface Service extends ServiceResponse {
  popularityRank?: number;
  staffAssigned?: string[];
  requirements?: string[];
}

const serviceCategories = ['All', 'Hair Services', 'Barber Services', 'Tattoo Services'];

function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for add/edit service
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: 'Hair Services',
    price: 0,
    duration: 30,
    isActive: true,
    requirements: [''],
    staffAssigned: [] as string[]
  });

  // Load services on component mount
  useEffect(() => {
    // Add connection test before loading services
    const testAndLoadServices = async () => {
      console.log('Testing backend connection...');
      const isConnected = await adminService.testConnection();
      console.log('Backend connection test result:', isConnected);
      
      if (!isConnected) {
        setError('Cannot connect to backend server. Please ensure the backend is running on http://localhost:8080');
        return;
      }
      
      loadServices();
    };

    testAndLoadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const servicesData = await adminService.getAllServices();
      setServices(servicesData);
    } catch (err) {
      setError('Failed to load services. Please try again.');
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || service.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && service.isActive) ||
                         (filterStatus === 'inactive' && !service.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Statistics
  const stats = {
    total: services.length,
    active: services.filter(s => s.isActive).length,
    inactive: services.filter(s => !s.isActive).length,
    totalRevenue: services.filter(s => s.isActive).reduce((acc, s) => acc + s.price, 0)
  };

  // Handle service actions
  const handleAddService = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const serviceRequest: ServiceRequest = {
        name: serviceForm.name,
        description: serviceForm.description,
        category: serviceForm.category,
        price: serviceForm.price,
        duration: serviceForm.duration,
        isActive: serviceForm.isActive
      };

      const newService = await adminService.createService(serviceRequest);
      setServices(prev => [...prev, newService]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setError('Failed to add service. Please try again.');
      console.error('Error adding service:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditService = async () => {
    if (!selectedService) return;

    try {
      setLoading(true);
      setError(null);
      
      const serviceRequest: ServiceRequest = {
        name: serviceForm.name,
        description: serviceForm.description,
        category: serviceForm.category,
        price: serviceForm.price,
        duration: serviceForm.duration,
        isActive: serviceForm.isActive
      };

      const updatedService = await adminService.updateService(selectedService.id, serviceRequest);
      setServices(prev => prev.map(service => 
        service.id === selectedService.id ? updatedService : service
      ));
      
      setShowEditModal(false);
      setSelectedService(null);
      resetForm();
    } catch (err) {
      setError('Failed to update service. Please try again.');
      console.error('Error updating service:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await adminService.deleteService(selectedService.id);
      setServices(prev => prev.filter(service => service.id !== selectedService.id));
      setShowDeleteModal(false);
      setSelectedService(null);
    } catch (err) {
      setError('Failed to delete service. Please try again.');
      console.error('Error deleting service:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    try {
      setError(null);
      
      const serviceRequest: ServiceRequest = {
        name: service.name,
        description: service.description,
        category: service.category,
        price: service.price,
        duration: service.duration,
        isActive: !service.isActive
      };

      const updatedService = await adminService.updateService(serviceId, serviceRequest);
      setServices(prev => prev.map(s => 
        s.id === serviceId ? updatedService : s
      ));
    } catch (err) {
      setError('Failed to update service status. Please try again.');
      console.error('Error toggling service status:', err);
    }
  };

  const resetForm = () => {
    setServiceForm({
      name: '',
      description: '',
      category: 'Hair Services',
      price: 0,
      duration: 30,
      isActive: true,
      requirements: [''],
      staffAssigned: [] as string[]
    });
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      duration: service.duration,
      isActive: service.isActive,
      requirements: service.requirements || [''],
      staffAssigned: service.staffAssigned || []
    });
    setShowEditModal(true);
  };

  const openDetailModal = (service: Service) => {
    setSelectedService(service);
    setShowDetailModal(true);
  };

  const openDeleteModal = (service: Service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hair Services': return ScissorsIcon;
      case 'Barber Services': return SparklesIcon;
      case 'Tattoo Services': return UserIcon;
      default: return TagIcon;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hair Services': return 'text-blue-400 bg-blue-500/10';
      case 'Barber Services': return 'text-green-400 bg-green-500/10';
      case 'Tattoo Services': return 'text-purple-400 bg-purple-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#212121] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#181818] p-6 rounded-xl border border-gray-700 flex items-center gap-3">
              <LoaderIcon className="h-5 w-5 text-[#F7BF24] animate-spin" />
              <span className="text-white">Processing...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Services Management</h1>
              <p className="text-gray-400">Manage salon services, pricing, and availability</p>
            </div>
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex bg-[#181818] rounded-lg p-1 border border-gray-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-[#F7BF24] text-black font-medium' : 'text-gray-400 hover:text-[#F7BF24] hover:bg-[#232323]'
                  }`}
                >
                  <TagIcon className="h-4 w-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-[#F7BF24] text-black font-medium' : 'text-gray-400 hover:text-[#F7BF24] hover:bg-[#232323]'
                  }`}
                >
                  <FilterIcon className="h-4 w-4" />
                  List
                </button>
              </div>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#F7BF24] hover:bg-[#E5AB20] text-black px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 font-medium shadow-lg hover:shadow-[#F7BF24]/25"
              >
                <PlusIcon className="h-5 w-5" />
                Add Service
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-[#181818] p-6 rounded-xl border border-gray-700 hover:border-[#F7BF24] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <TagIcon className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.total}</h3>
              <p className="text-gray-400 font-medium">Total Services</p>
            </div>
            <div className="bg-[#181818] p-6 rounded-xl border border-gray-700 hover:border-[#F7BF24] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckIcon className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.active}</h3>
              <p className="text-gray-400 font-medium">Active Services</p>
            </div>
            <div className="bg-[#181818] p-6 rounded-xl border border-gray-700 hover:border-[#F7BF24] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <XIcon className="h-6 w-6 text-red-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.inactive}</h3>
              <p className="text-gray-400 font-medium">Inactive Services</p>
            </div>
            <div className="bg-[#181818] p-6 rounded-xl border border-gray-700 hover:border-[#F7BF24] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-[#F7BF24]/10">
                  <DollarSignIcon className="h-6 w-6 text-[#F7BF24]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Rs.{stats.totalRevenue}</h3>
              <p className="text-gray-400 font-medium">Total Value</p>
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
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F7BF24] focus:border-[#F7BF24] transition-all duration-200"
                  />
                </div>

                {/* Filters */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24] transition-all duration-200"
                >
                  {serviceCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24] transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Services Content */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const CategoryIcon = getCategoryIcon(service.category);
              return (
                <div key={service.id} className="bg-[#181818] rounded-xl border border-gray-700 hover:border-[#F7BF24] transition-all duration-300 overflow-hidden group">
                  {/* Service Header */}
                  <div className="relative p-6 bg-[#232323]/50 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg transition-colors ${getCategoryColor(service.category)}`}>
                          <CategoryIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                            {service.category}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleStatus(service.id)}
                        className={`p-2 rounded-full transition-colors ${
                          service.isActive 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                        title={service.isActive ? 'Deactivate Service' : 'Activate Service'}
                      >
                        {service.isActive ? (
                          <ToggleRightIcon className="h-4 w-4" />
                        ) : (
                          <ToggleLeftIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Service Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-[#F7BF24] transition-colors">
                        {service.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        service.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-[#F7BF24]">
                          <DollarSignIcon className="h-4 w-4" />
                          <span className="font-bold">Rs.{service.price}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <ClockIcon className="h-4 w-4" />
                          <span className="text-sm">{service.duration}min</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDetailModal(service)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(service)}
                          className="p-2 text-[#F7BF24] hover:text-yellow-300 hover:bg-[#F7BF24]/10 rounded-lg transition-colors"
                          title="Edit Service"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(service)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Service"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-500/10 rounded-lg transition-colors">
                        <MoreVerticalIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-[#181818] rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#232323]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Updated</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredServices.map((service) => {
                    const CategoryIcon = getCategoryIcon(service.category);
                    return (
                      <tr key={service.id} className="hover:bg-[#232323] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(service.category)}`}>
                              <CategoryIcon className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{service.name}</p>
                              <p className="text-sm text-gray-400 line-clamp-1">{service.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                            <CategoryIcon className="h-3 w-3" />
                            {service.category}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[#F7BF24] font-bold">Rs.{service.price}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-300">{service.duration} min</span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(service.id)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              service.isActive 
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                          >
                            {service.isActive ? (
                              <>
                                <ToggleRightIcon className="h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <ToggleLeftIcon className="h-3 w-3" />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-400">
                            {service.updatedAt ? new Date(service.updatedAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDetailModal(service)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(service)}
                              className="p-2 text-[#F7BF24] hover:text-yellow-300 hover:bg-[#F7BF24]/10 rounded-lg transition-colors"
                              title="Edit Service"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(service)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete Service"
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Service Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#181818] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add New Service</h2>
                <button
                  onClick={() => {setShowAddModal(false); resetForm();}}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Service Name *</label>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24]"
                    placeholder="Enter service name"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    rows={3}
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24]"
                    placeholder="Enter service description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                  <select 
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24]"
                    required
                  >
                    {serviceCategories.filter(cat => cat !== 'All').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (Rs.) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24]"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes) *</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                    className="w-full px-3 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setServiceForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        serviceForm.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {serviceForm.isActive ? (
                        <>
                          <ToggleRightIcon className="h-4 w-4" />
                          Active
                        </>
                      ) : (
                        <>
                          <ToggleLeftIcon className="h-4 w-4" />
                          Inactive
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Requirements (Optional)</label>
                  {serviceForm.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => {
                          const newReqs = [...serviceForm.requirements];
                          newReqs[index] = e.target.value;
                          setServiceForm(prev => ({ ...prev, requirements: newReqs }));
                        }}
                        className="flex-1 px-3 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24]"
                        placeholder="Enter requirement"
                      />
                      {serviceForm.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newReqs = serviceForm.requirements.filter((_, i) => i !== index);
                            setServiceForm(prev => ({ ...prev, requirements: newReqs }));
                          }}
                          className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setServiceForm(prev => ({ ...prev, requirements: [...prev.requirements, ''] }))}
                    className="text-[#F7BF24] hover:text-yellow-300 text-sm font-medium"
                  >
                    + Add Requirement
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {setShowAddModal(false); resetForm();}}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddService}
                  disabled={!serviceForm.name || !serviceForm.description || !serviceForm.category}
                  className="bg-[#F7BF24] hover:bg-[#E5AB20] text-black px-6 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <SaveIcon className="h-4 w-4" />
                  Add Service
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Service Modal */}
        {showEditModal && selectedService && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#181818] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Edit Service</h2>
                <button
                  onClick={() => {setShowEditModal(false); setSelectedService(null); resetForm();}}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Service Name *</label>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24]"
                    placeholder="Enter service name"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    rows={3}
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24]"
                    placeholder="Enter service description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                  <select 
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24]"
                    required
                  >
                    {serviceCategories.filter(cat => cat !== 'All').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (Rs.) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24]"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes) *</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                    className="w-full px-3 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setServiceForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        serviceForm.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {serviceForm.isActive ? (
                        <>
                          <ToggleRightIcon className="h-4 w-4" />
                          Active
                        </>
                      ) : (
                        <>
                          <ToggleLeftIcon className="h-4 w-4" />
                          Inactive
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Requirements (Optional)</label>
                  {serviceForm.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => {
                          const newReqs = [...serviceForm.requirements];
                          newReqs[index] = e.target.value;
                          setServiceForm(prev => ({ ...prev, requirements: newReqs }));
                        }}
                        className="flex-1 px-3 py-2 bg-[#232323] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7BF24]"
                        placeholder="Enter requirement"
                      />
                      {serviceForm.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newReqs = serviceForm.requirements.filter((_, i) => i !== index);
                            setServiceForm(prev => ({ ...prev, requirements: newReqs }));
                          }}
                          className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setServiceForm(prev => ({ ...prev, requirements: [...prev.requirements, ''] }))}
                    className="text-[#F7BF24] hover:text-yellow-300 text-sm font-medium"
                  >
                    + Add Requirement
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {setShowEditModal(false); setSelectedService(null); resetForm();}}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEditService}
                  disabled={!serviceForm.name || !serviceForm.description || !serviceForm.category}
                  className="bg-[#F7BF24] hover:bg-[#E5AB20] text-black px-6 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <SaveIcon className="h-4 w-4" />
                  Update Service
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Detail Modal */}
        {showDetailModal && selectedService && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#181818] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Service Details</h2>
                <button
                  onClick={() => {setShowDetailModal(false); setSelectedService(null);}}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Service Header */}
                <div className="relative p-6 bg-[#232323] rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-lg ${getCategoryColor(selectedService.category)}`}>
                        {(() => {
                          const CategoryIcon = getCategoryIcon(selectedService.category);
                          return <CategoryIcon className="h-8 w-8" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{selectedService.name}</h3>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedService.category)}`}>
                          {selectedService.category}
                        </div>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      selectedService.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedService.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Service Info */}
                <div className="bg-[#232323] rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Service Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Service Name</p>
                      <p className="text-white font-medium">{selectedService.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Category</p>
                      <p className="text-white">{selectedService.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Price</p>
                      <p className="text-[#F7BF24] font-bold">Rs.{selectedService.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Duration</p>
                      <p className="text-white">{selectedService.duration} minutes</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-400">Description</p>
                      <p className="text-white">{selectedService.description}</p>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                {selectedService.requirements && selectedService.requirements.length > 0 && (
                  <div className="bg-[#232323] rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Requirements</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedService.requirements.map((req, index) => (
                        <li key={index} className="text-gray-300">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metadata */}
                <div className="bg-[#232323] rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Metadata</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Created</p>
                      <p className="text-white">
                        {selectedService.createdAt ? new Date(selectedService.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Last Updated</p>
                      <p className="text-white">
                        {selectedService.updatedAt ? new Date(selectedService.updatedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    {selectedService.popularityRank && (
                      <div>
                        <p className="text-sm text-gray-400">Popularity Rank</p>
                        <p className="text-white">#{selectedService.popularityRank}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {setShowDetailModal(false); setSelectedService(null);}}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(selectedService);
                  }}
                  className="bg-[#F7BF24] hover:bg-[#E5AB20] text-black px-6 py-2 rounded-lg transition-all duration-200 font-medium"
                >
                  Edit Service
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedService && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#181818] rounded-xl p-6 w-full max-w-md border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Delete Service</h2>
                <button
                  onClick={() => {setShowDeleteModal(false); setSelectedService(null);}}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  Are you sure you want to delete <span className="font-medium text-white">"{selectedService.name}"</span>?
                </p>
                <p className="text-sm text-red-400">
                  This action cannot be undone. All associated data will be permanently removed.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {setShowDeleteModal(false); setSelectedService(null);}}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteService}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2"
                >
                  <Trash2Icon className="h-4 w-4" />
                  Delete Service
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminServices;