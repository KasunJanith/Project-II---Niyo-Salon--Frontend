import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../components/CustomDatePicker.css";
import {
  ScissorsIcon,
  PencilIcon,
  GemIcon,
  SpaceIcon,
  CalendarIcon,
  ClockIcon,
} from "lucide-react";

// Helper function to convert 12-hour time to 24-hour format
function convertTo24Hour(time12h: string) {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

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

const services = [
  { id: 1, name: "Haircut", icon: ScissorsIcon, price: 50 },
  { id: 2, name: "Tattoo", icon: PencilIcon, price: 120 },
  { id: 3, name: "Piercing", icon: GemIcon, price: 40 },
  { id: 4, name: "Spa", icon: SpaceIcon, price: 80 },
];

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
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch logged-in user info on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", {
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

    const appointmentData = {
      customerName,
      customerPhone,
      services: selectedServices
        .map((id) => services.find((s) => s.id === id)?.name)
        .join(","),
      date: selectedDate.toISOString().split("T")[0], // "YYYY-MM-DD"
      time: convertTo24Hour(selectedTime), // <-- convert here!
      notes,
    };

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/appointments/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        alert("Appointment booked successfully!");
        // Optionally reset form
        setSelectedServices([]);
        setSelectedDate(new Date());
        setSelectedTime("");
        setNotes("");
      } else {
        const error = await response.text();
        alert("Booking failed: " + error);
      }
    } catch (err) {
      alert("Network error: " + err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-8">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        {/* Left: Booking Form */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
          <p className="mb-8 text-gray-400">
            Choose your desired service, date, and time slot.
          </p>

          {/* Customer Info (read-only, auto-filled) */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Your Name</label>
              <input
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
                type="text"
                value={customerName}
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Phone Number</label>
              <input
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
                type="text"
                value={customerPhone}
                readOnly
                disabled
              />
            </div>
          </div>

          {/* Select Services */}
          <div>
            <h2 className="font-semibold mb-4 text-lg text-gray-200">
              Select Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <button
                  key={s.id}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 
                    ${
                      selectedServices.includes(s.id)
                        ? "border-yellow-400 bg-yellow-900/20 text-yellow-300"
                        : "border-gray-700 bg-gray-900 hover:border-yellow-400"
                    }`}
                  onClick={() => {
                    setSelectedServices((prevSelected) =>
                      prevSelected.includes(s.id)
                        ? prevSelected.filter((id) => id !== s.id)
                        : [...prevSelected, s.id]
                    );
                  }}
                  type="button"
                >
                  <s.icon size={40} className="text-yellow-400" />
                  <h3 className="text-xl font-bold">{s.name}</h3>
                  <p className="text-lg text-gray-400">${s.price}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Select Date & Time */}
          <div className="flex flex-col md:flex-row gap-8 mb-6 mt-8">
            {/* Calendar */}
            <div>
              <h2 className="font-semibold mb-2">Select Date & Time</h2>
              <div className="rounded-lg p-4">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => setSelectedDate(date)}
                  minDate={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)}
                  inline
                />
              </div>
            </div>
            {/* Time Slots */}
            <div className="flex-1">
              <h2 className="font-semibold mb-4 text-lg text-gray-200">
                Available Times
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {availableTimes.map((t) => (
                  <button
                    key={t}
                    className={`px-4 py-2 rounded-lg border text-center 
                    ${
                      selectedTime === t
                        ? "bg-yellow-400 text-gray-900 border-yellow-400"
                        : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
                    }`}
                    onClick={() => setSelectedTime(t)}
                    type="button"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add Notes */}
          <div className="mb-6">
            <label className="block mb-1 font-semibold">Add Notes</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
              rows={3}
              placeholder="Any special requests or details?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Payment Preview */}
          <div className="mb-8">
            <h2 className="font-semibold mb-2">Payment Preview</h2>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Services</span>
                <span>
                  {selectedServices
                    .map((id) => services.find((s) => s.id === id)?.name)
                    .join(", ") || "-"}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-4 text-lg font-bold">
                <span>Advance</span>
                <span className="text-yellow-400">${advance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            className={`w-full py-3 rounded-md font-semibold text-lg transition-all ${
              selectedServices.length > 0 &&
              selectedDate &&
              selectedTime &&
              customerName.trim() &&
              customerPhone.trim()
                ? "bg-yellow-400 text-black hover:bg-yellow-500"
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
            {loading ? "Booking..." : "Confirm & Book Appointment"}
          </button>
        </div>

        {/* Right: Booking Summary */}
        <div className="w-full md:w-96">
          <div className="bg-[#181511] rounded-xl p-6 shadow-lg sticky top-20">
            <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
            <div className="flex items-center mb-2 text-yellow-400">
              <span>
                <b>Name:</b> {customerName || "-"}
              </span>
            </div>
            <div className="flex items-center mb-4 text-yellow-400">
              <span>
                <b>Phone:</b> {customerPhone || "-"}
              </span>
            </div>
            <div className="flex flex-col mb-4">
              <span className="text-[#F7BF24] mb-1">Selected Services:</span>
              {selectedServices.length > 0 ? (
                selectedServices.map((id) => {
                  const service = services.find((s) => s.id === id);
                  return (
                    <span key={id} className="text-yellow-300">
                      {service?.name} - ${service?.price}
                    </span>
                  );
                })
              ) : (
                <span className="text-gray-600">No services selected</span>
              )}
            </div>
            <div className="flex items-center mb-2 text-yellow-400">
              <CalendarIcon size={18} className="mr-2" />
              <span>
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Select a date"}
              </span>
            </div>
            <div className="flex items-center mb-2 text-yellow-400">
              <ClockIcon size={18} className="mr-2" />
              <span>{selectedTime || "Select time"}</span>
            </div>
            <div className="mb-4 text-xs text-gray-400">
              <b>Studio Policy</b>
              <br />
              Please arrive 10 minutes prior to your appointment. Cancellations
              must be made at least 24 hours in advance. Late arrivals may
              result in a shortened service or rescheduling. No-shows will be
              charged 50% of the service fee. We appreciate your understanding.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;
