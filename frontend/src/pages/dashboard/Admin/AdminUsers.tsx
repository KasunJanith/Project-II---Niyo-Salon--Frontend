import { 
  UserIcon, 
  SearchIcon, 
  FilterIcon, 
  PlusIcon, 
  EditIcon, 
  EyeIcon, 
  MoreVerticalIcon,
  SortAscIcon,
  SortDescIcon,
  UsersIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  Trash2Icon,
  StarIcon,
  XIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ApiUser {
  id: number;
  username: string;
  phoneNumber: string;
  role: string;
  email?: string;
  createdAt?: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  registrationDate: string;
  lastVisit: string;
  totalAppointments: number;
  totalSpent: number;
  avatar: string;
  address: string;
  dateOfBirth: string;
  preferences: string[];
  notes: string;
  averageRating: number;
  lastFeedback: string;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Customer data from API
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  
  // Form data for add/edit modals
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Load customers from backend
  const loadCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const usersFromApi = await response.json();
        // Filter only customer users and map to Customer interface
        const customerUsers = usersFromApi.filter((user: ApiUser) => user.role === 'customer');
        const mappedCustomers = customerUsers.map((apiUser: ApiUser) => ({
          id: apiUser.id,
          name: apiUser.username,
          email: apiUser.email || `${apiUser.username.toLowerCase().replace(' ', '.')}@email.com`,
          phone: apiUser.phoneNumber,
          status: 'active', // Assuming all users are active
          registrationDate: apiUser.createdAt ? new Date(apiUser.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          lastVisit: new Date().toISOString().split('T')[0], // Default to today
          totalAppointments: Math.floor(Math.random() * 20) + 1, // Random for demo
          totalSpent: Math.floor(Math.random() * 1000) + 100, // Random for demo
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(apiUser.username)}&background=F7BF24&color=000`,
          address: 'Address not provided',
          dateOfBirth: '1990-01-01', // Default
          preferences: ['Hair Cut', 'Styling'], // Default
          notes: 'Customer profile from backend',
          averageRating: 4.5, // Default
          lastFeedback: 'Great service!'
        }));
        setCustomersData(mappedCustomers);
      } else {
        console.error('Failed to load customers:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Add new customer
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/register-customer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          phoneNumber: formData.phone,
          role: 'customer'
        })
      });

      if (response.ok) {
        // Reload customers list to include the new customer
        await loadCustomers();
        setShowAddModal(false);
        setFormData({ name: '', email: '', phone: '', address: '' });
      } else {
        console.error('Failed to add customer:', response.status, response.statusText);
        alert('Failed to add customer. Please try again.');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Error adding customer. Please try again.');
    }
  };

  // Update customer
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/users/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          phoneNumber: formData.phone
        })
      });

      if (response.ok) {
        // Reload customers list to reflect changes
        await loadCustomers();
        setShowEditModal(false);
        setSelectedCustomer(null);
        setFormData({ name: '', email: '', phone: '', address: '' });
      } else {
        console.error('Failed to update customer:', response.status, response.statusText);
        alert('Failed to update customer. Please try again.');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Error updating customer. Please try again.');
    }
  };

  // Delete customer
  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/users/${selectedCustomer.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Reload customers list to reflect deletion
        await loadCustomers();
        setShowDeleteModal(false);
        setSelectedCustomer(null);
      } else {
        console.error('Failed to delete customer:', response.status, response.statusText);
        alert('Failed to delete customer. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer. Please try again.');
    }
  };

  // Handle bulk status changes
  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const promises = selectedCustomers.map(customerId =>
        fetch(`http://localhost:8080/api/admin/users/${customerId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        })
      );

      const results = await Promise.all(promises);
      const allSuccessful = results.every(response => response.ok);

      if (allSuccessful) {
        // Reload customers list to reflect status changes
        await loadCustomers();
        setSelectedCustomers([]);
      } else {
        console.error('Some status updates failed');
        alert('Some status updates failed. Please try again.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  // Filter and sort customers
  const filteredAndSortedCustomers = customersData
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.phone.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof typeof a]?.toString().toLowerCase() || '';
      const bValue = b[sortField as keyof typeof b]?.toString().toLowerCase() || '';
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredAndSortedCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === paginatedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(paginatedCustomers.map(customer => customer.id));
    }
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    });
    setShowEditModal(true);
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
      : 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-[#212121] text-white">
      {/* Header */}
      <div className="bg-[#181818] border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard/admin')}
              className="p-2 hover:bg-[#232323] rounded-lg transition-colors"
            >
              <ArrowLeftIcon size={20} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white font-abril">Customer Management</h1>
              <p className="text-gray-400 mt-1">Manage customer profiles and interactions</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                setFormData({ name: '', email: '', phone: '', address: '' });
                setShowAddModal(true);
              }}
              className="bg-[#F7BF24] hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center"
            >
              <PlusIcon size={18} className="mr-2" />
              Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Customers</p>
                <p className="text-2xl font-bold text-white">{customersData.length}</p>
              </div>
              <UsersIcon size={24} className="text-[#F7BF24]" />
            </div>
          </div>
          <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Customers</p>
                <p className="text-2xl font-bold text-white">
                  {customersData.filter(c => c.status === 'active').length}
                </p>
              </div>
              <CheckCircleIcon size={24} className="text-green-400" />
            </div>
          </div>
          <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">New This Month</p>
                <p className="text-2xl font-bold text-white">
                  {customersData.filter(c => new Date(c.registrationDate) >= new Date('2025-06-01')).length}
                </p>
              </div>
              <UserIcon size={24} className="text-purple-400" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-[#181818] rounded-xl border border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#232323] border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-[#F7BF24] focus:outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FilterIcon size={16} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="registrationDate">Sort by Registration Date</option>
                <option value="lastVisit">Sort by Last Visit</option>
                <option value="totalAppointments">Sort by Appointments</option>
              </select>
            </div>
          </div>

          {/* Selected Customers Actions */}
          {selectedCustomers.length > 0 && (
            <div className="mt-4 p-4 bg-[#232323] rounded-lg border border-[#F7BF24]/30">
              <div className="flex items-center justify-between">
                <span className="text-white">
                  {selectedCustomers.length} customer{selectedCustomers.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleBulkStatusChange('active')}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                  >
                    Activate
                  </button>
                  <button 
                    onClick={() => handleBulkStatusChange('inactive')}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30 hover:bg-red-500/30 transition-colors"
                  >
                    Deactivate
                  </button>
                  <button className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded border border-gray-500/30 hover:bg-gray-500/30 transition-colors">
                    Export
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customers Table */}
        <div className="bg-[#181818] rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.length === paginatedCustomers.length && paginatedCustomers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-600 bg-[#232323] text-[#F7BF24] focus:ring-[#F7BF24]"
                    />
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center space-x-1 text-gray-300 hover:text-white"
                    >
                      <span>Customer</span>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <SortAscIcon size={16} /> : <SortDescIcon size={16} />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 text-gray-300">Contact</th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 text-gray-300 hover:text-white"
                    >
                      <span>Status</span>
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <SortAscIcon size={16} /> : <SortDescIcon size={16} />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('totalAppointments')}
                      className="flex items-center space-x-1 text-gray-300 hover:text-white"
                    >
                      <span>Appointments</span>
                      {sortField === 'totalAppointments' && (
                        sortDirection === 'asc' ? <SortAscIcon size={16} /> : <SortDescIcon size={16} />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 text-gray-300">Last Visit</th>
                  <th className="text-left p-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-700/50 hover:bg-[#232323] transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => handleSelectCustomer(customer.id)}
                        className="rounded border-gray-600 bg-[#232323] text-[#F7BF24] focus:ring-[#F7BF24]"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-white">{customer.name}</p>
                          <p className="text-sm text-gray-400">
                            Customer since {new Date(customer.registrationDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <MailIcon size={14} className="text-gray-400" />
                          <span className="text-gray-300">{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <PhoneIcon size={14} className="text-gray-400" />
                          <span className="text-gray-300">{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {customer.status === 'active' ? (
                          <CheckCircleIcon size={16} className="text-green-400" />
                        ) : (
                          <XCircleIcon size={16} className="text-red-400" />
                        )}
                        <span className={`px-2 py-1 rounded border text-xs font-medium capitalize ${getStatusBadgeColor(customer.status)}`}>
                          {customer.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <p className="font-semibold text-white">{customer.totalAppointments}</p>
                        <div className="flex items-center justify-center space-x-1 mt-1">
                          <StarIcon size={12} className="text-yellow-400" />
                          <span className="text-xs text-gray-400">{customer.averageRating}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <CalendarIcon size={14} className="text-gray-400" />
                        <span>{new Date(customer.lastVisit).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/dashboard/customers/${customer.id}`)}
                          className="p-2 hover:bg-[#2a2a2a] rounded transition-colors"
                          title="View Profile"
                        >
                          <EyeIcon size={16} className="text-gray-400 hover:text-white" />
                        </button>
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="p-2 hover:bg-[#2a2a2a] rounded transition-colors"
                          title="Edit Customer"
                        >
                          <EditIcon size={16} className="text-gray-400 hover:text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer)}
                          className="p-2 hover:bg-[#2a2a2a] rounded transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2Icon size={16} className="text-red-400 hover:text-red-300" />
                        </button>
                        <button
                          className="p-2 hover:bg-[#2a2a2a] rounded transition-colors"
                          title="More Actions"
                        >
                          <MoreVerticalIcon size={16} className="text-gray-400 hover:text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredAndSortedCustomers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No customers found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {filteredAndSortedCustomers.length > 0 && (
            <div className="p-4 border-t border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedCustomers.length)} of {filteredAndSortedCustomers.length} customers
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-[#232323] border border-gray-600 rounded text-gray-300 hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded font-medium ${
                          currentPage === page
                            ? 'bg-[#F7BF24] text-black'
                            : 'bg-[#232323] border border-gray-600 text-gray-300 hover:bg-[#2a2a2a]'
                        } transition-colors`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-[#232323] border border-gray-600 rounded text-gray-300 hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#181818] border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Add New Customer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-[#232323] rounded-lg transition-colors"
              >
                <XIcon size={20} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                  rows={3}
                  placeholder="Enter customer address"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: '', email: '', phone: '', address: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-[#232323] border border-gray-600 rounded-lg text-gray-300 hover:bg-[#2a2a2a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#F7BF24] hover:bg-yellow-400 text-black rounded-lg font-semibold transition-colors"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#181818] border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Edit Customer</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-[#232323] rounded-lg transition-colors"
              >
                <XIcon size={20} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleUpdateCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={selectedCustomer?.status || 'active'}
                  onChange={(e) => {
                    if (selectedCustomer) {
                      setSelectedCustomer({ ...selectedCustomer, status: e.target.value });
                    }
                  }}
                  className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCustomer(null);
                    setFormData({ name: '', email: '', phone: '', address: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-[#232323] border border-gray-600 rounded-lg text-gray-300 hover:bg-[#2a2a2a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#F7BF24] hover:bg-yellow-400 text-black rounded-lg font-semibold transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Customer Modal */}
      {showDeleteModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#181818] border border-gray-700 rounded-xl p-6 w-full max-w-sm mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                <Trash2Icon size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Delete Customer</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-white">{selectedCustomer.name}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-[#232323] border border-gray-600 rounded-lg text-gray-300 hover:bg-[#2a2a2a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;