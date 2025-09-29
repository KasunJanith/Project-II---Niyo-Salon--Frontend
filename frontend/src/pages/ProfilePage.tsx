import React, { useState, useRef, useEffect } from 'react';
import { UserIcon, EditIcon, CameraIcon, SaveIcon, PhoneIcon, MailIcon, LockIcon } from 'lucide-react';
import useUserData from '../hooks/useUserData';

const ProfilePage = () => {
  const userData = useUserData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Update form data when userData changes
  useEffect(() => {
    if (userData) {
      if (userData.id !== -1) {
        setFormData({
          name: userData.username || '',
          email: '', // Add email field when available in userData
          phone: userData.phoneNumber || '',
          address: '' // Add address field when available in userData
        });
      }
      setIsLoading(false);
    }
  }, [userData]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    // Save functionality would go here
    console.log('Saving profile data:', formData);
    setIsEditing(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#F7BF24] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state if user is not authenticated
  if (!userData || userData.id === -1) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <UserIcon size={64} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please log in to view your profile</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-[#F7BF24] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#F7BF24]/80 transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#F7BF24] mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-[#181818] rounded-xl border border-gray-700 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#F7BF24]/20 to-transparent p-8 border-b border-gray-700">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-[#F7BF24]/20 border-2 border-[#F7BF24] flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon size={64} className="text-[#F7BF24]" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-[#F7BF24] text-black p-3 rounded-full hover:bg-[#F7BF24]/80 transition-colors duration-200"
                >
                  <CameraIcon size={20} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {userData?.username || 'User'}
                </h2>
                <p className="text-gray-400 mb-2">
                  Role: {userData?.role || 'Customer'}
                </p>
                <p className="text-gray-400 mb-4">
                  ID: #{userData?.id || '000000'}
                </p>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="bg-[#F7BF24] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#F7BF24]/80 transition-colors duration-200 flex items-center gap-2 mx-auto md:mx-0"
                >
                  {isEditing ? (
                    <>
                      <SaveIcon size={18} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <EditIcon size={18} />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-semibold text-[#F7BF24] mb-6 flex items-center gap-2">
                  <UserIcon size={24} />
                  Personal Information
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#F7BF24] focus:outline-none transition-colors duration-200"
                        placeholder="Enter your username"
                      />
                    ) : (
                      <p className="text-white bg-[#2a2a2a] px-4 py-3 rounded-lg">
                        {userData?.username || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <PhoneIcon size={16} />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#F7BF24] focus:outline-none transition-colors duration-200"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="text-white bg-[#2a2a2a] px-4 py-3 rounded-lg">
                        {userData?.phoneNumber || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <MailIcon size={16} />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#F7BF24] focus:outline-none transition-colors duration-200"
                        placeholder="Enter your email address"
                      />
                    ) : (
                      <p className="text-white bg-[#2a2a2a] px-4 py-3 rounded-lg">
                        {formData.email || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#F7BF24] focus:outline-none transition-colors duration-200"
                        placeholder="Enter your address"
                      />
                    ) : (
                      <p className="text-white bg-[#2a2a2a] px-4 py-3 rounded-lg">
                        {formData.address || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div>
                <h3 className="text-xl font-semibold text-[#F7BF24] mb-6 flex items-center gap-2">
                  <LockIcon size={24} />
                  Security
                </h3>
                <div className="bg-[#2a2a2a] p-6 rounded-lg border border-gray-600">
                  <h4 className="text-lg font-medium text-white mb-4">Change Password</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-[#181818] border border-gray-600 rounded-lg text-white focus:border-[#F7BF24] focus:outline-none transition-colors duration-200"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-[#181818] border border-gray-600 rounded-lg text-white focus:border-[#F7BF24] focus:outline-none transition-colors duration-200"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-[#181818] border border-gray-600 rounded-lg text-white focus:border-[#F7BF24] focus:outline-none transition-colors duration-200"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button className="w-full bg-[#F7BF24] text-black py-3 rounded-lg font-medium hover:bg-[#F7BF24]/80 transition-colors duration-200">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Need help with your account?</p>
          <button className="text-[#F7BF24] hover:text-[#F7BF24]/80 font-medium transition-colors duration-200">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;