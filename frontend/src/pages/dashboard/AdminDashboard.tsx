import { UserIcon, CalendarIcon, DollarSignIcon, TrendingUpIcon, UsersIcon, ScissorsIcon, PencilIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const AdminDashboard = () => {
  const navigate = useNavigate();
  // Mock data for dashboard stats
  const stats = [{
    title: 'Total Users',
    value: 248,
    change: '+12%',
    icon: UsersIcon,
    positive: true
  }, {
    title: 'Appointments',
    value: 86,
    change: '+5%',
    icon: CalendarIcon,
    positive: true
  }, {
    title: 'Revenue',
    value: '$8,245',
    change: '+18%',
    icon: DollarSignIcon,
    positive: true
  }, {
    title: 'Growth',
    value: '24%',
    change: '-2%',
    icon: TrendingUpIcon,
    positive: false
  }];
  // Mock data for staff
  const staff = [{
    id: 1,
    name: 'Jamie Rodriguez',
    role: 'Senior Hair Stylist',
    appointments: 24,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
  }, {
    id: 2,
    name: 'Alex Kim',
    role: 'Barber',
    appointments: 18,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
  }, {
    id: 3,
    name: 'Taylor Morgan',
    role: 'Tattoo Artist',
    appointments: 15,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
  }, {
    id: 4,
    name: 'Jordan Smith',
    role: 'Hair Colorist',
    appointments: 20,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
  }];
  // Mock data for recent appointments
  const recentAppointments = [{
    id: 1,
    client: 'Sarah Johnson',
    service: 'Haircut & Styling',
    staff: 'Jamie Rodriguez',
    date: 'June 15, 2023',
    time: '10:00 AM',
    status: 'completed',
    amount: '$45'
  }, {
    id: 2,
    client: 'Michael Chen',
    service: 'Beard Trim',
    staff: 'Alex Kim',
    date: 'June 15, 2023',
    time: '11:00 AM',
    status: 'completed',
    amount: '$25'
  }, {
    id: 3,
    client: 'Jessica Williams',
    service: 'Hair Coloring',
    staff: 'Jordan Smith',
    date: 'June 15, 2023',
    time: '12:00 PM',
    status: 'in-progress',
    amount: '$120'
  }, {
    id: 4,
    client: 'Robert Garcia',
    service: 'Custom Tattoo',
    staff: 'Taylor Morgan',
    date: 'June 15, 2023',
    time: '2:30 PM',
    status: 'upcoming',
    amount: '$200'
  }];
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-3">
          <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 font-medium">
            Export Report
          </button>
          <button
            className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 font-medium"
            onClick={() => navigate('/dashboard/add-staff')}
          >
            Add New Staff
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <stat.icon size={24} className="text-purple-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-purple-700">
                  {stat.value}
                </p>
              </div>
            </div>
            <div className={`text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change} from last month
            </div>
          </div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Appointments
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date/Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAppointments.map(appointment => <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.client}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {appointment.service}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {appointment.staff}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {appointment.date}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : appointment.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {appointment.status === 'completed' ? 'Completed' : appointment.status === 'in-progress' ? 'In Progress' : 'Upcoming'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {appointment.amount}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-right">
            <button className="text-sm text-purple-700 hover:text-purple-900 font-medium">
              View All Appointments
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Staff Performance
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {staff.map(person => <div key={person.id} className="flex items-start">
                  <img src={person.imageUrl} alt={person.name} className="h-10 w-10 rounded-full object-cover mr-4" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {person.name}
                        </h3>
                        <p className="text-sm text-gray-600">{person.role}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {person.appointments} appts
                      </div>
                    </div>
                    <div className="mt-2 flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{
                      width: `${person.rating / 5 * 100}%`
                    }}></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {person.rating}/5
                      </span>
                    </div>
                  </div>
                </div>)}
            </div>
            <div className="mt-6 text-center">
              <button className="text-sm text-purple-700 hover:text-purple-900 font-medium">
                View All Staff
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Service Analytics
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <ScissorsIcon size={16} className="text-purple-700 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Haircuts
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{
                  width: '45%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <PencilIcon size={16} className="text-purple-700 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Tattoos
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{
                  width: '30%'
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <UserIcon size={16} className="text-purple-700 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Beard Trim
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{
                  width: '25%'
                }}></div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button className="text-sm text-purple-700 hover:text-purple-900 font-medium">
                View Detailed Analytics
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center">
                <UserIcon size={24} className="text-purple-700 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Add User
                </span>
              </button>
              <button
                className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center"
                onClick={() => navigate('/dashboard/add-staff')}
              >
                <UserIcon size={24} className="text-purple-700 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Add Staff
                </span>
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center">
                <CalendarIcon size={24} className="text-purple-700 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Schedule
                </span>
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center">
                <ScissorsIcon size={24} className="text-purple-700 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Services
                </span>
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center">
                <DollarSignIcon size={24} className="text-purple-700 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Payments
                </span>
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center">
                <PencilIcon size={24} className="text-purple-700 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Gallery
                </span>
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center">
                <TrendingUpIcon size={24} className="text-purple-700 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Reports
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default AdminDashboard;