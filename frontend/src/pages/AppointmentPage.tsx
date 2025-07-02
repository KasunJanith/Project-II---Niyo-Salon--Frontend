import { useState, useEffect } from "react";
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
  StarIcon
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { adminService, ServiceResponse } from "../services/adminService";
import { bookingService, AppointmentRequest } from "../services/bookingService";

// Helper function to convert 12-hour time to 24-hour format
function convertTo24Hour(time12h: string) {
  const [time, modifier] = time12h.split(" ");
  let [hours] = time.split(":").map(Number);
  const [, minutes] = time.split(":").map(Number);

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

const availableTimes = [
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
  "07:00 PM",
];

const AppointmentPage = () => {
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

  // Dynamically generate categories from services
  const categories = ["all", ...Array.from(new Set(services.map(service => service.category)))];

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

  // Fetch logged-in user info on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8080/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Unauthorized");
          return res.json();
        })
        .then((user) => {
          setCustomerName(user.username || "");
          setCustomerPhone(user.phoneNumber || "");
        })
        .catch(() => {
          setCustomerName("");
          setCustomerPhone("");
        });
    }
  }, []);

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
      alert("Please fill all required fields.");
      return;
    }

    const appointmentData: AppointmentRequest = {
      customerName,
      customerPhone,
      services: selectedServices
        .map((id) => services.find((s) => s.id === id)?.name)
        .filter(Boolean)
        .join(","),
      date: selectedDate.toISOString().split("T")[0], // "YYYY-MM-DD"
      time: convertTo24Hour(selectedTime), // convert to 24-hour format
      notes,
    };

    setLoading(true);
    try {
      await bookingService.bookAppointment(appointmentData);
      alert("Appointment booked successfully!");
      // Reset form
      setSelectedServices([]);
      setSelectedDate(new Date());
      setSelectedTime("");
      setNotes("");
    } catch (error) {
      console.error('Booking failed:', error);
      alert("Booking failed: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
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
                  <div className="bg-[#232323] rounded-lg p-4 border border-gray-700">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date | null) => setSelectedDate(date)}
                      minDate={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)}
                      inline
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Time Slots */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">Available Times</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 px-4 rounded-lg border-2 text-center font-medium transition-all duration-200 ${
                          selectedTime === time
                            ? "bg-[#F7BF24] text-black border-[#F7BF24]"
                            : "bg-[#232323] text-gray-300 border-gray-600 hover:border-[#F7BF24] hover:text-white"
                        }`}
                        type="button"
                      >
                        {time}
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
            <div className="bg-[#181818] rounded-xl border border-gray-700 p-6 sticky top-8">
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
    </div>
  );
};

export default AppointmentPage;
