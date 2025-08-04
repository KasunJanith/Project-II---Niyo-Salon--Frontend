import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../components/CustomDatePicker.css";
import {
  ScissorsIcon,
  PencilIcon,
  GemIcon,
  SparklesIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  PhoneIcon,
  StickyNoteIcon,
  CreditCardIcon,
  StarIcon,
  XIcon,
  AlertTriangleIcon,
  InfoIcon
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { adminService, ServiceResponse } from "../services/adminService";
import { bookingService } from "../services/bookingService";
import useUserData from "../hooks/useUserData";

// Helper function to convert 12-hour time to 24-hour format
function convertTo24Hour(time12h: string) {
  const [time, modifier] = time12h.split(" ");
  let [hours] = time.split(":").map(Number);
  const minutes = parseInt(time.split(":")[1]);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }
  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  requirements?: string[];
  staffAssigned?: string[];
  isActive?: boolean;
  popularityRank?: number;
  icon: LucideIcon;
  available: boolean;
}

// Map category to icon
const getCategoryIcon = (category: string): LucideIcon => {
  switch (category.toLowerCase()) {
    case 'hair services':
      return ScissorsIcon;
    case 'barber services':
      return GemIcon;
    case 'tattoo services':
      return PencilIcon;
    default:
      return SparklesIcon;
  }
};

// Available times will be loaded dynamically with capacity information
type TimeSlot = { 
  time: string; 
  available: boolean; 
  currentBookings: number; 
  maxCapacity: number; 
};

// Alert modal types
interface AlertModal {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

const AppointmentPage = () => {
  const userData = useUserData();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [alertModal, setAlertModal] = useState<AlertModal>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Dynamically generate categories from services
  const categories = ["all", ...Array.from(new Set(services.map(service => service.category)))];

  // Helper function to show custom alerts
  const showAlert = (type: AlertModal['type'], title: string, message: string) => {
    setAlertModal({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeAlert = () => {
    setAlertModal({
      isOpen: false,
      type: 'info',
      title: '',
      message: ''
    });
  };

  // Filter services by category
  const filteredServices = selectedCategory === "all" 
    ? services 
    : services.filter(service => service.category === selectedCategory);

    // Load services from backend
  useEffect(() => {
    const loadServices = async () => {
      try {
        setServicesLoading(true);
        const servicesData = await adminService.getAllServices();
        const servicesWithIcons = servicesData
          .filter((service: ServiceResponse) => service.isActive !== false) // Only show active services
          .map((service: ServiceResponse) => ({
            ...service,
            icon: getCategoryIcon(service.category),
            available: true, // Set default availability
          }));
        setServices(servicesWithIcons);
      } catch (error) {
        console.error('Error loading services:', error);
        // Set fallback services or show error message
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, []);

  // Pre-fill customer data if user is logged in
  useEffect(() => {
    if (userData && userData.id > 0) {
      setCustomerName(userData.username || "");
      setCustomerPhone(userData.phoneNumber || "");
    }
  }, [userData]);

  // Load available times for selected date
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!selectedDate) return;
      try {
        const dateStr = selectedDate.toISOString().split("T")[0];
        
        // Generate standard time slots (9 AM to 7 PM)
        const standardTimeSlots = [
          "09:00 AM",
          "10:00 AM", 
          "11:00 AM",
          "12:00 PM",
          "01:00 PM",
          "02:00 PM",
          "03:00 PM",
          "04:00 PM",
          "05:00 PM",
          "06:00 PM",
          "07:00 PM"
        ];
        
        // Fetch existing appointments for this date to check capacity
        const appointments = await bookingService.getAppointmentsByDate(dateStr);
        
        // Calculate capacity for each time slot based on actual staff availability
        const timeSlots: TimeSlot[] = await Promise.all(
          standardTimeSlots.map(async (time) => {
            const appointmentsAtTime = appointments.filter(apt => {
              const aptTime24h = apt.time; // Backend stores in 24h format
              const timeSlot24h = convertTo24Hour(time);
              return aptTime24h === timeSlot24h;
            });
            
            const currentBookings = appointmentsAtTime.length;
            
            // Try to get actual staff capacity from backend
            // We'll use the checkTimeSlotAvailability method to determine if this slot is available
            let available = true;
            try {
              const timeSlot24h = convertTo24Hour(time);
              available = await bookingService.checkTimeSlotAvailability({
                date: dateStr,
                time: timeSlot24h
              });
            } catch (error) {
              // If we can't check availability, assume it's available for fallback
              console.warn(`Could not check availability for ${time}:`, error);
              available = true;
            }
            
            // Estimate capacity based on current bookings and availability
            // If backend says it's not available, then we've reached capacity
            const estimatedMaxCapacity = available ? Math.max(currentBookings + 1, 5) : currentBookings;
            
            return {
              time,
              available,
              currentBookings,
              maxCapacity: estimatedMaxCapacity
            };
          })
        );
        
        setAvailableTimes(timeSlots);
      } catch (error) {
        console.error('Error loading available times:', error);
        // Fallback: show all time slots as available if we can't fetch appointment data
        const fallbackTimeSlots: TimeSlot[] = [
          "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM",
          "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
        ].map(time => ({
          time,
          available: true,
          currentBookings: 0,
          maxCapacity: 5
        }));
        setAvailableTimes(fallbackTimeSlots);
      }
    };
    fetchAvailableTimes();
  }, [selectedDate]);

  // Calculate subtotal based on selected services
  const subtotal = selectedServices.reduce(
    (total, id) => total + (services.find((s) => s.id === id)?.price || 0),
    0
  );
  const advance = subtotal / 2;

  // Handler for booking
  const handleBooking = async () => {
    if (
      selectedServices.length === 0 ||
      !selectedDate ||
      !selectedTime ||
      !customerName.trim() ||
      !customerPhone.trim()
    ) {
      showAlert('warning', 'Missing Information', 'Please fill all required fields to proceed with your booking.');
      return;
    }

    // Store booking data for payment page
    const bookingData = {
      customerName,
      customerPhone,
      services: selectedServices.map((id) => services.find((s) => s.id === id)),
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTime,
      notes,
      subtotal,
      advance
    };

    // Store in localStorage to pass to payment page
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    
    // Navigate to payment page
    navigate('/payment');
  };

  // Alert Modal Component
  const AlertModalComponent = () => {
    if (!alertModal.isOpen) return null;

    const getIcon = () => {
      switch (alertModal.type) {
        case 'success':
          return (
            <div className="relative">
              {/* Animated check circle */}
              <CheckCircleIcon className="h-12 w-12 text-[#F7BF24] animate-bounce" />
              {/* Sparkle effect */}
              <div className="absolute -top-1 -right-1 animate-ping">
                <SparklesIcon className="h-4 w-4 text-yellow-300" />
              </div>
              <div className="absolute -bottom-1 -left-1 animate-pulse">
                <SparklesIcon className="h-3 w-3 text-yellow-400" />
              </div>
            </div>
          );
        case 'error':
          return <AlertTriangleIcon className="h-8 w-8 text-red-400 animate-pulse" />;
        case 'warning':
          return <AlertTriangleIcon className="h-8 w-8 text-yellow-400 animate-pulse" />;
        case 'info':
        default:
          return <InfoIcon className="h-8 w-8 text-blue-400" />;
      }
    };

    const getColors = () => {
      switch (alertModal.type) {
        case 'success':
          return {
            bg: 'bg-gradient-to-br from-[#F7BF24]/20 via-yellow-500/10 to-amber-500/20',
            border: 'border-[#F7BF24]/50',
            button: 'bg-gradient-to-r from-[#F7BF24] to-[#E5AB20] hover:from-[#E5AB20] hover:to-[#D4991C] shadow-lg shadow-[#F7BF24]/30',
            overlay: 'bg-black/70'
          };
        case 'error':
          return {
            bg: 'bg-red-500/10',
            border: 'border-red-400/30',
            button: 'bg-red-500 hover:bg-red-600',
            overlay: 'bg-black/60'
          };
        case 'warning':
          return {
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-400/30',
            button: 'bg-yellow-500 hover:bg-yellow-600',
            overlay: 'bg-black/60'
          };
        case 'info':
        default:
          return {
            bg: 'bg-blue-500/10',
            border: 'border-blue-400/30',
            button: 'bg-blue-500 hover:bg-blue-600',
            overlay: 'bg-black/60'
          };
      }
    };

    const colors = getColors();

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
        {/* Backdrop with animation */}
        <div 
          className={`absolute inset-0 ${colors.overlay} backdrop-blur-sm animate-in fade-in duration-300`}
          onClick={closeAlert}
        />
        
        {/* Modal with enhanced animations */}
        <div className={`relative bg-[#181818] border-2 ${colors.border} rounded-2xl p-8 mx-4 max-w-md w-full shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500`}>
          {/* Salon-themed decorative elements for success */}
          {alertModal.type === 'success' && (
            <>
              {/* Floating scissors animation */}
              <div className="absolute top-4 left-4 salon-float" style={{ animationDelay: '0.5s' }}>
                <ScissorsIcon className="h-5 w-5 text-[#F7BF24]/40" />
              </div>
              <div className="absolute bottom-4 right-4 salon-float" style={{ animationDelay: '1s' }}>
                <ScissorsIcon className="h-4 w-4 text-[#F7BF24]/30 rotate-45" />
              </div>
              
              {/* Sparkle particles */}
              <div className="absolute top-8 right-8 sparkle-dance" style={{ animationDelay: '0.8s' }}>
                <div className="w-2 h-2 bg-[#F7BF24] rounded-full"></div>
              </div>
              <div className="absolute bottom-8 left-8 sparkle-dance" style={{ animationDelay: '1.2s' }}>
                <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
              </div>
              <div className="absolute top-1/2 left-6 sparkle-dance" style={{ animationDelay: '1.5s' }}>
                <SparklesIcon className="h-3 w-3 text-[#F7BF24]/50" />
              </div>
              <div className="absolute top-1/3 right-6 sparkle-dance" style={{ animationDelay: '0.3s' }}>
                <SparklesIcon className="h-4 w-4 text-yellow-400/40" />
              </div>
            </>
          )}

          {/* Close button */}
          <button
            onClick={closeAlert}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 z-10"
          >
            <XIcon className="h-6 w-6" />
          </button>

          {/* Content */}
          <div className="text-center relative z-10">
            {/* Icon with enhanced styling for success */}
            <div className={`inline-flex items-center justify-center w-20 h-20 ${colors.bg} rounded-full mb-6 ${
              alertModal.type === 'success' ? 'shadow-lg shadow-[#F7BF24]/50' : ''
            }`}>
              {getIcon()}
            </div>

            {/* Title with salon styling */}
            <h3 className={`text-2xl font-bold mb-4 ${
              alertModal.type === 'success' 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#F7BF24] via-yellow-300 to-[#F7BF24]'
                : 'text-white'
            }`}>
              {alertModal.title}
            </h3>

            {/* Message with enhanced typography */}
            <p className={`text-gray-300 mb-8 leading-relaxed ${
              alertModal.type === 'success' ? 'text-lg' : 'text-base'
            }`}>
              {alertModal.message}
            </p>

            {/* Enhanced success message for salon context */}
            {alertModal.type === 'success' && (
              <div className="mb-6 p-4 bg-gradient-to-r from-[#F7BF24]/10 to-yellow-500/10 rounded-lg border border-[#F7BF24]/20">
                <div className="flex items-center justify-center gap-2 text-sm text-[#F7BF24] font-medium">
                  <ScissorsIcon className="h-4 w-4" />
                  <span>Professional salon experience awaits you!</span>
                  <ScissorsIcon className="h-4 w-4 scale-x-[-1]" />
                </div>
              </div>
            )}

            {/* Enhanced button with salon theming */}
            <button
              onClick={closeAlert}
              className={`px-8 py-4 ${colors.button} text-black font-bold rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#F7BF24]/50 focus:ring-offset-2 focus:ring-offset-[#181818] ${
                alertModal.type === 'success' 
                  ? 'text-lg hover:shadow-[#F7BF24]/50' 
                  : 'text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                {alertModal.type === 'success' ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    Perfect! ✨
                  </>
                ) : (
                  'Got it'
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#212121] text-white">
      {/* Header */}
      <div className="bg-[#181818] border-b border-gray-700 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white font-abril mb-2">Book Your Appointment</h1>
          <p className="text-gray-400 text-lg">Choose your preferred services, date, and time for the perfect salon experience</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Booking Form */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Customer Info */}
            <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <UserIcon size={24} className="text-[#F7BF24] mr-3" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    className="w-full bg-[#232323] border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-[#F7BF24] focus:outline-none"
                    type="text"
                    value={customerName}
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    className="w-full bg-[#232323] border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-[#F7BF24] focus:outline-none"
                    type="text"
                    value={customerPhone}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Select Services */}
            <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <ScissorsIcon size={24} className="text-[#F7BF24] mr-3" />
                  Select Services
                </h2>
                
                {/* Category Filter */}
                <div className="flex space-x-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-[#F7BF24] text-black'
                          : 'bg-[#232323] text-gray-300 hover:bg-[#2a2a2a] hover:text-white'
                      }`}
                    >
                      {category === "all" ? "All Services" : category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services Grid */}
              {servicesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-[#232323] rounded-xl border border-gray-700 p-6">
                      <div className="animate-pulse">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-600 rounded mb-2"></div>
                            <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-600 rounded mb-4 w-3/4"></div>
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-600 rounded w-16"></div>
                          <div className="h-4 bg-gray-600 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-12">
                  <ScissorsIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No services available</p>
                  <p className="text-gray-500 text-sm">Please check back later or contact us for assistance.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className={`relative bg-[#232323] rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-[#F7BF24]/10 ${
                      selectedServices.includes(service.id)
                        ? "border-[#F7BF24] bg-[#F7BF24]/5 shadow-lg shadow-[#F7BF24]/20"
                        : "border-gray-700 hover:border-[#F7BF24]"
                    }`}
                    onClick={() => {
                      setSelectedServices((prevSelected) =>
                        prevSelected.includes(service.id)
                          ? prevSelected.filter((id) => id !== service.id)
                          : [...prevSelected, service.id]
                      );
                    }}
                  >
                    {/* Selection indicator */}
                    {selectedServices.includes(service.id) && (
                      <div className="absolute top-4 right-4 bg-[#F7BF24] rounded-full p-1">
                        <CheckCircleIcon className="h-5 w-5 text-black" />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Service header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg transition-colors ${
                            selectedServices.includes(service.id)
                              ? "bg-[#F7BF24]/20"
                              : "bg-gray-700/50"
                          }`}>
                            <service.icon className={`h-6 w-6 transition-colors ${
                              selectedServices.includes(service.id)
                                ? "text-[#F7BF24]"
                                : "text-gray-400"
                            }`} />
                          </div>
                          <div>
                            <h3 className={`font-bold text-lg transition-colors ${
                              selectedServices.includes(service.id) ? "text-[#F7BF24]" : "text-white"
                            }`}>
                              {service.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                selectedServices.includes(service.id)
                                  ? "bg-[#F7BF24]/20 text-[#F7BF24]"
                                  : "bg-gray-600/50 text-gray-300"
                              }`}>
                                {service.category}
                              </span>
                              <div className="flex items-center gap-1">
                                <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-400">{service.popularityRank ? (5 - service.popularityRank * 0.1).toFixed(1) : "4.5"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Service description */}
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {service.description}
                      </p>

                      {/* Service details */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-300">{service.duration} min</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            service.available 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-red-500/20 text-red-400"
                          }`}>
                            {service.available ? "Available" : "Unavailable"}
                          </span>
                        </div>
                        <div className={`text-right ${
                          selectedServices.includes(service.id) ? "text-[#F7BF24]" : "text-white"
                        }`}>
                          <div className="text-2xl font-bold">Rs.{service.price}</div>
                        </div>
                      </div>

                      {/* Selection button */}
                      <button
                        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedServices.includes(service.id)
                            ? "bg-[#F7BF24] text-black hover:bg-[#E5AB20]"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                        }`}
                        type="button"
                      >
                        {selectedServices.includes(service.id) ? "Selected" : "Select Service"}
                      </button>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>

            {/* Select Date & Time */}
            <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <CalendarIcon size={24} className="text-[#F7BF24] mr-3" />
                Select Date & Time
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">Choose Date</h3>
                  <div>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date | null) => setSelectedDate(date)}
                      minDate={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)}
                      inline
                      className="w-full"
                      formatWeekDay={name => name.substr(0, 3).toUpperCase()} 
                    />
                  </div>
                </div>
                
                {/* Time Slots */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">Available Times</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {availableTimes.map((timeSlot) => (
                      <button
                        key={timeSlot.time}
                        onClick={() => setSelectedTime(timeSlot.time)}
                        disabled={!timeSlot.available}
                        className={`relative py-3 px-4 rounded-lg border-2 text-center font-medium transition-all duration-200 ${
                          selectedTime === timeSlot.time
                            ? "bg-[#F7BF24] text-black border-[#F7BF24]"
                            : !timeSlot.available
                            ? "bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed opacity-50"
                            : "bg-[#232323] text-gray-300 border-gray-600 hover:border-[#F7BF24] hover:text-white"
                        }`}
                        type="button"
                        title={
                          !timeSlot.available 
                            ? "This time slot is not available - staff capacity reached" 
                            : timeSlot.currentBookings > 0
                            ? `${timeSlot.currentBookings} booking(s) - staff availability confirmed`
                            : "Available - staff ready to serve"
                        }
                      >
                        {/* Time label always visible */}
                        <div>{timeSlot.time}</div>
                        {/* Show yellow 'X booked' only for available slots with bookings */}
                        {timeSlot.available && timeSlot.currentBookings > 0 && (
                          <div className="text-xs mt-2 text-yellow-400 font-semibold">{timeSlot.currentBookings} booked</div>
                        )}
                        {/* Overlay for full slots */}
                        {!timeSlot.available && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                            <span className="text-sm font-bold text-red-400">N/A</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Add Notes */}
            <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <StickyNoteIcon size={24} className="text-[#F7BF24] mr-3" />
                Additional Notes
              </h2>
              <textarea
                className="w-full bg-[#232323] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#F7BF24] focus:outline-none"
                rows={4}
                placeholder="Any special requests, preferences, or details we should know about?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Confirm Button */}
            <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
              <button
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                  selectedServices.length > 0 &&
                  selectedDate &&
                  selectedTime &&
                  customerName.trim() &&
                  customerPhone.trim()
                    ? "bg-[#F7BF24] text-black hover:bg-[#E5AB20] shadow-lg hover:shadow-[#F7BF24]/25"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
                disabled={
                  selectedServices.length === 0 ||
                  !selectedDate ||
                  !selectedTime ||
                  !customerName.trim() ||
                  !customerPhone.trim() ||
                  loading
                }
                onClick={handleBooking}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    Confirm & Book Appointment
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#181818] rounded-xl border border-gray-700 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <CreditCardIcon size={24} className="text-[#F7BF24] mr-3" />
                Booking Summary
              </h2>

              {/* Customer Info */}
              <div className="mb-6 p-4 bg-[#232323] rounded-lg border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="h-4 w-4 text-[#F7BF24]" />
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{customerName || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <PhoneIcon className="h-4 w-4 text-[#F7BF24]" />
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white">{customerPhone || "Not provided"}</span>
                  </div>
                </div>
              </div>

              {/* Selected Services */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Selected Services</h3>
                {selectedServices.length > 0 ? (
                  <div className="space-y-3">
                    {selectedServices.map((id) => {
                      const service = services.find((s) => s.id === id);
                      return service ? (
                        <div key={id} className="flex items-center justify-between p-3 bg-[#232323] rounded-lg border border-gray-700">
                          <div className="flex items-center gap-3">
                            <service.icon className="h-5 w-5 text-[#F7BF24]" />
                            <div>
                              <p className="text-white font-medium text-sm">{service.name}</p>
                              <p className="text-gray-400 text-xs">{service.duration} min</p>
                            </div>
                          </div>
                          <span className="text-[#F7BF24] font-bold">Rs.{service.price}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-[#232323] rounded-lg border border-gray-700 text-center">
                    <p className="text-gray-400 text-sm">No services selected</p>
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Appointment Details</h3>
                <div className="space-y-2 p-3 bg-[#232323] rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-[#F7BF24]" />
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white">
                      {selectedDate
                        ? selectedDate.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Select a date"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="h-4 w-4 text-[#F7BF24]" />
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white">{selectedTime || "Select time"}</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Payment Summary</h3>
                <div className="p-4 bg-[#232323] rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Subtotal:</span>
                    <span className="text-white">Rs.{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-semibold">Advance Payment:</span>
                      <span className="text-[#F7BF24] font-bold text-lg">Rs.{advance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy */}
              <div className="p-4 bg-[#232323] rounded-lg border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Studio Policy</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Please arrive 10 minutes prior to your appointment. Cancellations must be made at least 24 hours in advance. 
                  Late arrivals may result in a shortened service or rescheduling. No-shows will be charged 50% of the service fee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModalComponent />
    </div>
  );
};

export default AppointmentPage;
