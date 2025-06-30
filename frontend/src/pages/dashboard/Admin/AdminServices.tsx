import { useState } from 'react';
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
  SaveIcon
} from 'lucide-react';

// Service interface
interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  popularityRank?: number;
  staffAssigned?: string[];
  requirements?: string[];
  imageUrl?: string;
}

// Sample services data
const initialServices: Service[] = [
  {
    id: 'srv-1',
    name: 'Premium Haircut & Style',
    description: 'Professional haircut with consultation, wash, cut, and styling',
    category: 'Hair',
    price: 85,
    duration: 60,
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-20',
    popularityRank: 1,
    staffAssigned: ['staff-1', 'staff-2'],
    requirements: ['Hair consultation', 'Shampoo & conditioning'],
    imageUrl: '/api/placeholder/300/200'
  },
  {
    id: 'srv-2',
    name: 'Beard Trim & Styling',
    description: 'Professional beard trimming and styling with hot towel treatment',
    category: 'Hair',
    price: 45,
    duration: 30,
    isActive: true,
    createdAt: '2024-01-20',
    updatedAt: '2024-06-18',
    popularityRank: 3,
    staffAssigned: ['staff-1', 'staff-3'],
    requirements: ['Beard assessment'],
    imageUrl: '/api/placeholder/300/200'
  },
  {
    id: 'srv-3',
    name: 'Manicure & Nail Art',
    description: 'Complete nail care with polish and optional nail art design',
    category: 'Nails',
    price: 65,
    duration: 45,
    isActive: true,
    createdAt: '2024-02-01',
    updatedAt: '2024-06-15',
    popularityRank: 2,
    staffAssigned: ['staff-4', 'staff-5'],
    requirements: ['Nail health assessment'],
    imageUrl: '/api/placeholder/300/200'
  },
  {
    id: 'srv-4',
    name: 'Relaxation Massage',
    description: 'Full body relaxation massage with aromatherapy oils',
    category: 'Spa',
    price: 120,
    duration: 90,
    isActive: true,
    createdAt: '2024-02-10',
    updatedAt: '2024-06-10',
    popularityRank: 4,
    staffAssigned: ['staff-6'],
    requirements: ['Health questionnaire', 'Allergy check'],
    imageUrl: '/api/placeholder/300/200'
  },
  {
    id: 'srv-5',
    name: 'Hair Coloring',
    description: 'Professional hair coloring with premium products',
    category: 'Hair',
    price: 150,
    duration: 120,
    isActive: false,
    createdAt: '2024-03-01',
    updatedAt: '2024-06-01',
    popularityRank: 5,
    staffAssigned: ['staff-2'],
    requirements: ['Strand test', 'Color consultation'],
    imageUrl: '/api/placeholder/300/200'
  },
  {
    id: 'srv-6',
    name: 'Facial Treatment',
    description: 'Deep cleansing facial with moisturizing and anti-aging treatment',
    category: 'Spa',
    price: 95,
    duration: 75,
    isActive: true,
    createdAt: '2024-03-15',
    updatedAt: '2024-06-05',
    popularityRank: 6,
    staffAssigned: ['staff-6', 'staff-7'],
    requirements: ['Skin analysis'],
    imageUrl: '/api/placeholder/300/200'
  }
];

const serviceCategories = ['All', 'Hair', 'Nails', 'Spa', 'Massage'];

function AdminServices() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form state for add/edit service
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: 'Hair',
    price: 0,
    duration: 30,
    isActive: true,
    requirements: [''],
    staffAssigned: [] as string[]
  });

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
  const handleAddService = () => {
    const newService: Service = {
      id: `srv-${Date.now()}`,
      name: serviceForm.name,
      description: serviceForm.description,
      category: serviceForm.category,
      price: serviceForm.price,
      duration: serviceForm.duration,
      isActive: serviceForm.isActive,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      requirements: serviceForm.requirements.filter(req => req.trim() !== ''),
      staffAssigned: serviceForm.staffAssigned,
      imageUrl: '/api/placeholder/300/200'
    };

    setServices(prev => [...prev, newService]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditService = () => {
    if (!selectedService) return;

    setServices(prev => prev.map(service => 
      service.id === selectedService.id 
        ? {
            ...service,
            name: serviceForm.name,
            description: serviceForm.description,
            category: serviceForm.category,
            price: serviceForm.price,
            duration: serviceForm.duration,
            isActive: serviceForm.isActive,
            updatedAt: new Date().toISOString().split('T')[0],
            requirements: serviceForm.requirements.filter(req => req.trim() !== ''),
            staffAssigned: serviceForm.staffAssigned
          }
        : service
    ));
    
    setShowEditModal(false);
    setSelectedService(null);
    resetForm();
  };

  const handleDeleteService = () => {
    if (!selectedService) return;
    
    setServices(prev => prev.filter(service => service.id !== selectedService.id));
    setShowDeleteModal(false);
    setSelectedService(null);
  };

  const handleToggleStatus = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, isActive: !service.isActive, updatedAt: new Date().toISOString().split('T')[0] }
        : service
    ));
  };

  const resetForm = () => {
    setServiceForm({
      name: '',
      description: '',
      category: 'Hair',
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
      case 'Hair': return ScissorsIcon;
      case 'Nails': return SparklesIcon;
      case 'Spa': return UserIcon;
      case 'Massage': return UserIcon;
      default: return TagIcon;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hair': return 'text-blue-400 bg-blue-500/10';
      case 'Nails': return 'text-pink-400 bg-pink-500/10';
      case 'Spa': return 'text-green-400 bg-green-500/10';
      case 'Massage': return 'text-purple-400 bg-purple-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#212121] text-white p-6">
      <div className="max-w-7xl mx-auto">
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
              <h3 className="text-2xl font-bold text-white mb-1">${stats.totalRevenue}</h3>
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
                  {/* Service Image */}
                  <div className="relative h-48 bg-[#232323] overflow-hidden">
                    <img 
                      src={service.imageUrl} 
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                        <CategoryIcon className="h-3 w-3 inline mr-1" />
                        {service.category}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
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
                          <span className="font-bold">${service.price}</span>
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
                            <img
                              src={service.imageUrl}
                              alt={service.name}
                              className="w-12 h-12 rounded-lg bg-gray-600 object-cover"
                            />
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
                          <span className="text-[#F7BF24] font-bold">${service.price}</span>
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
                          <span className="text-sm text-gray-400">{new Date(service.updatedAt).toLocaleDateString()}</span>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price ($) *</label>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price ($) *</label>
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
                {/* Service Image */}
                <div className="relative h-48 bg-[#232323] rounded-lg overflow-hidden">
                  <img 
                    src={selectedService.imageUrl} 
                    alt={selectedService.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedService.category)}`}>
                      {selectedService.category}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                      <p className="text-[#F7BF24] font-bold">${selectedService.price}</p>
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
                      <p className="text-white">{new Date(selectedService.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Last Updated</p>
                      <p className="text-white">{new Date(selectedService.updatedAt).toLocaleDateString()}</p>
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