import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { UserIcon, MailIcon, LockIcon, PhoneIcon } from 'lucide-react';
import axios from 'axios';

const AddStaffPage = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
    const response = await axios.post(
        'http://localhost:8080/api/admin/add-staff',
        {
          name,
          phoneNumber,
          password,
          role: 'staff',
        },
        {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + localStorage.getItem('token')
        },
        }
    );

    if (response.status === 200 || response.status === 201) {
        setSuccess('Staff member added successfully!');
        setTimeout(() => navigate('/dashboard/admin'), 1200);
    } else {
        setError('Failed to add staff member.');
    }
    } 
    catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
    } else {
        setError('Network error.');
    }
    }

  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-1 max-w-md mx-auto my-12 px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Add New Staff Member</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm text-center">{success}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <PhoneIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="tel"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <LockIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="password"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Create a password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-purple-700 text-white py-2 px-4 rounded-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 font-medium"
              >
                Add Staff Member
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default AddStaffPage;
