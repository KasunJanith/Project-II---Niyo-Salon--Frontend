import { 
  SearchIcon, 
  FilterIcon, 
  PlusIcon, 
  EditIcon, 
  EyeIcon, 
  MoreVerticalIcon,
  SortAscIcon,
  SortDescIcon,
  MailIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  Trash2Icon,
  XIcon,
  BriefcaseIcon,
  Users2Icon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ApiStaff {
  id: number;
  name: string;
  email?: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

interface Staff {
  id: number;
  name: string;
  email?: string;
  phone: string;
  role: string;
  status: string;
  hireDate: string;
  lastActive: string;
  avatar?: string;
  address?: string;
  specialties?: string[];
  experience?: string;
}

const AdminStaff = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaffMember, setSelectedStaffMember] = useState<Staff | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 8;

  // Staff data from API
  const [staffData, setStaffData] = useState<Staff[]>([]);

  // Load staff from backend
  const loadStaff = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/staff', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const staffFromApi = await response.json();
        // Map API response to our Staff interface
        const mappedStaff = staffFromApi.map((apiStaff: ApiStaff) => ({
          id: apiStaff.id,
          name: apiStaff.name,
          email: apiStaff.email,
          phone: apiStaff.phoneNumber,
          role: apiStaff.role || 'staff',
          status: apiStaff.isActive ? 'active' : 'inactive',
          hireDate: apiStaff.createdAt ? new Date(apiStaff.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          lastActive: new Date().toISOString().split('T')[0],
          specialties: [],
          experience: '0 years'
        }));
        setStaffData(mappedStaff);
      } else {
        console.error('Failed to load staff:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  // Load staff on component mount
  useEffect(() => {
    loadStaff();
  }, []);

  // Filter and sort staff
  const filteredAndSortedStaff = staffData
    .filter(staff => {
      const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (staff.email && staff.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          staff.phone.includes(searchTerm) ||
                          staff.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || staff.role.toLowerCase().includes(roleFilter.toLowerCase());
      const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
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
  const totalPages = Math.ceil(filteredAndSortedStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStaff = filteredAndSortedStaff.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectStaff = (staffId: number) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStaff.length === paginatedStaff.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(paginatedStaff.map(staff => staff.id));
    }
  };

  const handleDeleteStaff = (staff: Staff) => {
    setSelectedStaffMember(staff);
    setShowDeleteModal(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaffMember(staff);
    setShowEditModal(true);
  };

  const handleAddStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as string
    };

    try {
      const response = await fetch('http://localhost:8080/api/admin/add-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const newStaff = await response.json();
        console.log('Staff added successfully:', newStaff);
        
        // Add to local state instead of reloading
        const mappedNewStaff: Staff = {
          id: newStaff.id,
          name: newStaff.name,
          email: newStaff.email,
          phone: newStaff.phoneNumber,
          role: newStaff.role || 'staff',
          status: newStaff.isActive ? 'active' : 'inactive',
          hireDate: newStaff.createdAt ? new Date(newStaff.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          lastActive: new Date().toISOString().split('T')[0],
          specialties: [],
          experience: '0 years'
        };
        
        setStaffData(prev => [...prev, mappedNewStaff]);
        alert('Staff member added successfully!');
        setShowAddModal(false);
        // Reset form
        (e.target as HTMLFormElement).reset();
      } else {
        const error = await response.text();
        console.error('Error adding staff:', error);
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
      : 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getRoleBadgeColor = (role: string) => {
    const roleColors: { [key: string]: string } = {
      'senior hair stylist': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'master barber': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'hair colorist': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'spa specialist': 'bg-green-500/20 text-green-400 border-green-500/30',
      'nail technician': 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return roleColors[role.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
              <h1 className="text-2xl font-bold text-white font-abril">Staff Management</h1>
              <p className="text-gray-400 mt-1">Manage staff profiles, roles, and availability</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#F7BF24] hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center"
            >
              <PlusIcon size={18} className="mr-2" />
              Add Staff Member
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
                <p className="text-gray-400 text-sm">Total Staff</p>
                <p className="text-2xl font-bold text-white">{staffData.length}</p>
              </div>
              <Users2Icon size={24} className="text-[#F7BF24]" />
            </div>
          </div>
          <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Staff</p>
                <p className="text-2xl font-bold text-white">
                  {staffData.filter(s => s.status === 'active').length}
                </p>
              </div>
              <CheckCircleIcon size={24} className="text-green-400" />
            </div>
          </div>
          <div className="bg-[#181818] p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Specialties</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(staffData.flatMap(s => s.specialties || [])).size}
                </p>
              </div>
              <BriefcaseIcon size={24} className="text-blue-400" />
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
                placeholder="Search staff by name, role, or email..."
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
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="stylist">Stylists</option>
                  <option value="barber">Barbers</option>
                  <option value="colorist">Colorists</option>
                  <option value="spa">Spa</option>
                  <option value="nail">Nail Tech</option>
                </select>
              </div>
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
          </div>

          {/* Selected Staff Actions */}
          {selectedStaff.length > 0 && (
            <div className="mt-4 p-4 bg-[#232323] rounded-lg border border-[#F7BF24]/30">
              <div className="flex items-center justify-between">
                <span className="text-white">
                  {selectedStaff.length} staff member{selectedStaff.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                    Set Schedule
                  </button>
                  <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded border border-green-500/30 hover:bg-green-500/30 transition-colors">
                    Activate
                  </button>
                  <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30 hover:bg-red-500/30 transition-colors">
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Staff Table */}
        <div className="bg-[#181818] rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedStaff.length === paginatedStaff.length && paginatedStaff.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-600 bg-[#232323] text-[#F7BF24] focus:ring-[#F7BF24]"
                    />
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center space-x-1 text-gray-300 hover:text-white"
                    >
                      <span>Staff Member</span>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <SortAscIcon size={16} /> : <SortDescIcon size={16} />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('role')}
                      className="flex items-center space-x-1 text-gray-300 hover:text-white"
                    >
                      <span>Role</span>
                      {sortField === 'role' && (
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
                  <th className="text-left p-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStaff.map((staff) => (
                  <tr key={staff.id} className="border-b border-gray-700/50 hover:bg-[#232323] transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedStaff.includes(staff.id)}
                        onChange={() => handleSelectStaff(staff.id)}
                        className="rounded border-gray-600 bg-[#232323] text-[#F7BF24] focus:ring-[#F7BF24]"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-white">{staff.name}</p>
                          <p className="text-sm text-gray-400">{staff.experience} experience</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className={`px-2 py-1 rounded border text-xs font-medium ${getRoleBadgeColor(staff.role)}`}>
                          {staff.role}
                        </span>
                        <p className="text-sm text-gray-400">{staff.experience} experience</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <MailIcon size={14} className="text-gray-400" />
                          <span className="text-gray-300">{staff.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <PhoneIcon size={14} className="text-gray-400" />
                          <span className="text-gray-300">{staff.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {staff.status === 'active' ? (
                          <CheckCircleIcon size={16} className="text-green-400" />
                        ) : (
                          <XCircleIcon size={16} className="text-red-400" />
                        )}
                        <span className={`px-2 py-1 rounded border text-xs font-medium capitalize ${getStatusBadgeColor(staff.status)}`}>
                          {staff.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/dashboard/staff/${staff.id}`)}
                          className="p-2 hover:bg-[#2a2a2a] rounded transition-colors"
                          title="View Profile"
                        >
                          <EyeIcon size={16} className="text-gray-400 hover:text-white" />
                        </button>
                        <button
                          onClick={() => handleEditStaff(staff)}
                          className="p-2 hover:bg-[#2a2a2a] rounded transition-colors"
                          title="Edit Staff"
                        >
                          <EditIcon size={16} className="text-gray-400 hover:text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff)}
                          className="p-2 hover:bg-[#2a2a2a] rounded transition-colors"
                          title="Delete Staff"
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
          {filteredAndSortedStaff.length === 0 && (
            <div className="text-center py-12">
              <Users2Icon size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No staff members found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {filteredAndSortedStaff.length > 0 && (
            <div className="p-4 border-t border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedStaff.length)} of {filteredAndSortedStaff.length} staff members
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

        {/* Add Staff Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#181818] border border-gray-700 rounded-xl p-6 w-full max-w-lg mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add New Staff Member</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-[#232323] rounded-lg transition-colors"
                >
                  <XIcon size={20} className="text-gray-400" />
                </button>
              </div>
              
              <form className="space-y-4" onSubmit={handleAddStaff}>
                {/* Full Name - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                    placeholder="Enter staff member's full name"
                  />
                </div>

                {/* Phone Number - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    required
                    className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                    placeholder="Enter phone number (e.g., +1234567890)"
                  />
                </div>

                {/* Password - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                    placeholder="Create a secure password"
                  />
                </div>

                {/* Role - Pre-filled as Staff */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value="staff"
                    readOnly
                    className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Role is automatically set to staff</p>
                </div>

                {/* Note about required fields */}
                <div className="bg-[#232323] border border-[#F7BF24]/30 rounded-lg p-3">
                  <p className="text-sm text-gray-400">
                    <span className="text-red-400">*</span> Required fields. Role is automatically set to staff. Additional details can be added later through the staff profile.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-[#232323] border border-gray-600 rounded-lg text-gray-300 hover:bg-[#2a2a2a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-[#F7BF24] hover:bg-yellow-400 text-black rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Staff Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Staff Modal */}
        {showEditModal && selectedStaffMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#181818] border border-gray-700 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Edit Staff Member</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-[#232323] rounded-lg transition-colors"
                >
                  <XIcon size={20} className="text-gray-400" />
                </button>
              </div>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue={selectedStaffMember.name}
                      className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={selectedStaffMember.email}
                      className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue={selectedStaffMember.phone}
                      className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      defaultValue={selectedStaffMember.status}
                      className="w-full bg-[#232323] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-[#F7BF24] focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
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

        {/* Delete Staff Modal */}
        {showDeleteModal && selectedStaffMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#181818] border border-gray-700 rounded-xl p-6 w-full max-w-sm mx-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                  <Trash2Icon size={24} className="text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Delete Staff Member</h3>
                <p className="text-gray-400 mb-6">
                  Are you sure you want to delete <span className="font-semibold text-white">{selectedStaffMember.name}</span>? 
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
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedStaffMember(null);
                    }}
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
    </div>
  );
}

export default AdminStaff;