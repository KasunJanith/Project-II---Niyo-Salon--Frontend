import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCardIcon,
  LockIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  X,
  CheckCircleIcon,
  InfoIcon,
  EyeIcon,
  EyeOffIcon,
  WifiIcon
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import useUserData from '../hooks/useUserData';

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
}

interface PaymentData {
  customerName: string;
  customerPhone: string;
  services: Service[];
  date: string;
  time: string;
  subtotal: number;
  advance: number;
  notes?: string;
}

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  saveCard: boolean;
}

// Alert modal types
interface AlertModal {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const userData = useUserData();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCvv, setShowCvv] = useState(false);
  const [alertModal, setAlertModal] = useState<AlertModal>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Sri Lanka'
    },
    saveCard: false
  });

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

  useEffect(() => {
    // Get booking data from localStorage (set by AppointmentPage)
    const storedBooking = localStorage.getItem('pendingBooking');
    if (storedBooking) {
      try {
        const bookingData = JSON.parse(storedBooking);
        setPaymentData(bookingData);
      } catch (error) {
        console.error('Error parsing booking data:', error);
        navigate('/appointments');
      }
    } else {
      // Redirect back if no booking data
      navigate('/appointments');
    }
  }, [navigate]);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Enhanced form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Card number validation
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.cardNumber = 'Card number must be between 13-19 digits';
    } else if (!/^\d+$/.test(cardNumber)) {
      newErrors.cardNumber = 'Card number must contain only digits';
    } else if (!isValidCardNumber(cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Expiry date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Invalid expiry date format (MM/YY)';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (parseInt(year) < currentYear || 
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }

    // Cardholder name validation
    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Cardholder name is required';
    } else if (formData.cardHolderName.trim().length < 2) {
      newErrors.cardHolderName = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.cardHolderName.trim())) {
      newErrors.cardHolderName = 'Name contains invalid characters';
    }

    // Billing address validation
    if (!formData.billingAddress.street.trim()) {
      newErrors.billingStreet = 'Street address is required';
    }
    if (!formData.billingAddress.city.trim()) {
      newErrors.billingCity = 'City is required';
    }
    if (!formData.billingAddress.state.trim()) {
      newErrors.billingState = 'State/Province is required';
    }
    if (!formData.billingAddress.zipCode.trim()) {
      newErrors.billingZipCode = 'ZIP/Postal code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.billingAddress.zipCode.trim())) {
      newErrors.billingZipCode = 'Invalid ZIP code format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Luhn algorithm for card validation
  const isValidCardNumber = (cardNumber: string): boolean => {
    let sum = 0;
    let shouldDouble = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  };

  // Enhanced input change handler
  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (field === 'cardHolderName') {
      formattedValue = value.replace(/[^a-zA-Z\s.'-]/g, '');
    } else if (field === 'billingZipCode') {
      formattedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    if (field.startsWith('billing')) {
      const addressField = field.replace('billing', '');
      // Convert to proper camelCase for state mapping
      const stateField = addressField.charAt(0).toLowerCase() + addressField.slice(1);
      
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [stateField]: formattedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Simulate payment processing
  const processPayment = async () => {
    if (!validateForm() || !paymentData) return;

    setIsProcessing(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Payment successful, now book the appointment
      const appointmentData = {
        customerName: paymentData.customerName,
        customerPhone: paymentData.customerPhone,
        services: paymentData.services.map(service => service?.name).join(","),
        date: paymentData.date,
        time: convertTo24Hour(paymentData.time),
        notes: paymentData.notes || "",
        userId: userData?.id || undefined, // Add the customer's user ID
      };

      // Book the appointment (initially with PENDING status)
      const bookedAppointment = await bookingService.bookAppointment(appointmentData);
      
      // Update appointment status to CONFIRMED after successful payment
      // This ensures the appointment status reflects the payment completion
      try {
        await bookingService.updateAppointmentStatus(bookedAppointment.id, 'CONFIRMED');
      } catch (statusError) {
        console.warn('Appointment was booked but status update failed:', statusError);
        // Continue with success flow even if status update fails
      }
      
      // Clear pending booking data
      localStorage.removeItem('pendingBooking');
      
      // Show success alert
      showAlert('success', 'Payment Successful!', 'Your appointment has been confirmed and payment processed successfully. You will receive a confirmation SMS shortly.');
      
      // Redirect to dashboard after showing alert
      setTimeout(() => {
        navigate('/dashboard/customer');
      }, 3000);
        
    } catch (error) {
      showAlert('error', 'Payment Failed', `We couldn't process your booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get card type and logo
  const getCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return { type: 'Visa', color: 'text-blue-600' };
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return { type: 'Mastercard', color: 'text-red-500' };
    if (cleanNumber.startsWith('3')) return { type: 'American Express', color: 'text-green-600' };
    return { type: 'Credit Card', color: 'text-gray-400' };
  };

  // Card Logo Component
  const CardLogo = ({ cardType }: { cardType: string }) => {
    switch (cardType) {
      case 'Visa':
        return (
          <div className="flex items-center gap-1 text-blue-600 font-bold text-xs bg-white border border-blue-200 px-2 py-1 rounded shadow-sm">
            <div className="w-3 h-2 bg-blue-600 rounded-sm flex items-center justify-center">
              <div className="w-2 h-1 bg-white rounded-sm"></div>
            </div>
            <span>VISA</span>
          </div>
        );
      case 'Mastercard':
        return (
          <div className="flex items-center gap-1 text-red-600 font-bold text-xs bg-white border border-red-200 px-2 py-1 rounded shadow-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full -ml-1"></div>
            </div>
            <span>MC</span>
          </div>
        );
      case 'American Express':
        return (
          <div className="flex items-center gap-1 text-green-700 font-bold text-xs bg-white border border-green-200 px-2 py-1 rounded shadow-sm">
            <div className="w-3 h-2 bg-green-600 rounded-sm relative">
              <div className="absolute inset-0 bg-white opacity-20 rounded-sm"></div>
            </div>
            <span>AMEX</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-gray-500 font-medium text-xs bg-gray-100 border border-gray-300 px-2 py-1 rounded">
            <CreditCardIcon className="h-3 w-3" />
            <span>CARD</span>
          </div>
        );
    }
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F7BF24] mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#212121] text-white">
      {/* Header */}
      <div className="bg-[#181818] border-b border-gray-700 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/appointments')}
            className="p-2 hover:bg-[#232323] rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Secure Payment</h1>
            <p className="text-gray-400">Complete your appointment booking</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-green-400">
            <ShieldCheckIcon className="h-5 w-5" />
            <span className="text-sm">SSL Secured</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Payment Form */}
            <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <CreditCardIcon size={24} className="text-[#F7BF24] mr-3" />
                Payment Information
              </h2>

                {errors.general && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                    <AlertTriangleIcon className="h-5 w-5 text-red-400" />
                    <span className="text-red-400">{errors.general}</span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Card Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        autoComplete="cc-number"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        placeholder="XXXX XXXX XXXX XXXX"
                        maxLength={19}
                        className={`w-full bg-[#232323] border rounded-lg px-4 py-3 text-white focus:outline-none pr-20 transition-all duration-200 ${
                          errors.cardNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-[#F7BF24] focus:ring-2 focus:ring-[#F7BF24]/20'
                        }`}
                      />
                      {formData.cardNumber && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-in slide-in-from-right-2 duration-300">
                          <CardLogo cardType={getCardType(formData.cardNumber).type} />
                        </div>
                      )}
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        
                      </div>
                    </div>
                    {errors.cardNumber && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <AlertTriangleIcon size={14} />
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Expiry Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expiry Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        autoComplete="cc-exp"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full bg-[#232323] border rounded-lg px-4 py-3 text-white focus:outline-none ${
                          errors.expiryDate ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-[#F7BF24] focus:ring-2 focus:ring-[#F7BF24]/20'
                        }`}
                      />
                      {errors.expiryDate && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <AlertTriangleIcon size={14} />
                          {errors.expiryDate}
                        </p>
                      )}
                    </div>

                    {/* CVV */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        CVV <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showCvv ? 'text' : 'password'}
                          name="cvv"
                          autoComplete="cc-csc"
                          value={formData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value)}
                          placeholder="XXX"
                          maxLength={4}
                          className={`w-full bg-[#232323] border rounded-lg px-4 py-3 pr-12 text-white focus:outline-none ${
                            errors.cvv ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-[#F7BF24] focus:ring-2 focus:ring-[#F7BF24]/20'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCvv(!showCvv)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showCvv ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                        </button>
                      </div>
                      {errors.cvv && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <AlertTriangleIcon size={14} />
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cardholder Name <span className="text-red-400">*</span>
                    </label>
                    <input  
                      type="text"
                      value={formData.cardHolderName}
                      onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                      placeholder="Ex: John Doe"
                      className={`w-full bg-[#232323] border rounded-lg px-4 py-3 text-white focus:outline-none ${
                        errors.cardHolderName ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-[#F7BF24] focus:ring-2 focus:ring-[#F7BF24]/20'
                      }`}
                    />
                    {errors.cardHolderName && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <AlertTriangleIcon size={14} />
                        {errors.cardHolderName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

            {/* Billing Address */}
            <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                  <InfoIcon size={20} className="text-[#F7BF24] mr-3" />
                  Billing Address
                </h3>

                <div className="space-y-4">
                  {/* Street Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Street Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="billingStreet"
                      autoComplete="street-address"
                      value={formData.billingAddress.street}
                      onChange={(e) => handleInputChange('billingStreet', e.target.value)}
                      placeholder="123 Main Street"
                      className={`w-full bg-[#232323] border rounded-lg px-4 py-3 text-white focus:outline-none ${
                        errors.billingStreet ? 'border-red-500' : 'border-gray-600 focus:border-[#F7BF24] focus:ring-2 focus:ring-[#F7BF24]/20'
                      }`}
                    />
                    {errors.billingStreet && (
                      <p className="text-red-400 text-sm mt-1">{errors.billingStreet}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        City <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="billingCity"
                        autoComplete="address-level2"
                        value={formData.billingAddress.city}
                        onChange={(e) => handleInputChange('billingCity', e.target.value)}
                        placeholder="Colombo"
                        className={`w-full bg-[#232323] border rounded-lg px-4 py-3 text-white focus:outline-none ${
                          errors.billingCity ? 'border-red-500' : 'border-gray-600 focus:border-[#F7BF24] focus:ring-2 focus:ring-[#F7BF24]/20'
                        }`}
                      />
                      {errors.billingCity && (
                        <p className="text-red-400 text-sm mt-1">{errors.billingCity}</p>
                      )}
                    </div>

                    {/* State/Province */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Province <span className="text-red-400">*</span>
                      </label>
                      <select
                        name="billingState"
                        autoComplete="address-level1"
                        value={formData.billingAddress.state}
                        onChange={(e) => handleInputChange('billingState', e.target.value)}
                        className={`w-full bg-[#232323] border rounded-lg px-4 py-3 text-white focus:outline-none ${
                          errors.billingState ? 'border-red-500' : 'border-gray-600 focus:border-[#F7BF24] focus:ring-2 focus:ring-[#F7BF24]/20'
                        }`}
                      >
                        <option value="">Select Province</option>
                        <option value="Western">Western</option>
                        <option value="Central">Central</option>
                        <option value="Southern">Southern</option>
                        <option value="Northern">Northern</option>
                        <option value="Eastern">Eastern</option>
                        <option value="North Western">North Western</option>
                        <option value="North Central">North Central</option>
                        <option value="Uva">Uva</option>
                        <option value="Sabaragamuwa">Sabaragamuwa</option>
                      </select>
                      {errors.billingState && (
                        <p className="text-red-400 text-sm mt-1">{errors.billingState}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* ZIP Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        ZIP Code <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        autoComplete="postal-code"
                        value={formData.billingAddress.zipCode}
                        onChange={(e) => handleInputChange('billingZipCode', e.target.value)}
                        placeholder="10230"
                        className={`w-full bg-[#232323] border rounded-lg px-4 py-3 text-white focus:outline-none ${
                          errors.billingZipCode ? 'border-red-500' : 'border-gray-600 focus:border-[#F7BF24] focus:ring-2 focus:ring-[#F7BF24]/20'
                        }`}
                      />
                      {errors.billingZipCode && (
                        <p className="text-red-400 text-sm mt-1">{errors.billingZipCode}</p>
                      )}
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Country <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.billingAddress.country}
                        onChange={(e) => handleInputChange('billingCountry', e.target.value)}
                        placeholder="Sri Lanka"
                        className="w-full bg-[#232323] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F7BF24] focus:ring-2 focus:ring-[#F7BF24]/20"
                      />
                    </div>
                  </div>

                  {/* Save Card Option */}
                  <div className="flex items-center gap-3 pt-4">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={formData.saveCard}
                      onChange={(e) => setFormData(prev => ({ ...prev, saveCard: e.target.checked }))}
                      className="w-4 h-4 text-[#F7BF24] bg-[#232323] border-gray-600 rounded focus:ring-[#F7BF24] focus:ring-2"
                    />
                    <label htmlFor="saveCard" className="text-sm text-gray-300">
                      Save this card for future payments
                    </label>
                  </div>
                </div>
              </div>

            {/* Security Features */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20 p-6">
              <div className="flex items-center gap-4 mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-green-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Secure Payment</h3>
                  <p className="text-green-300 text-sm">256-bit SSL encryption</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <WifiIcon size={16} className="text-green-400" />
                  <span>Encrypted connection</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <LockIcon size={16} className="text-green-400" />
                  <span>PCI DSS compliant</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <ShieldCheckIcon size={16} className="text-green-400" />
                  <span>Fraud protection</span>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={processPayment}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                isProcessing
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#F7BF24] to-[#E5AB20] text-black hover:from-[#E5AB20] hover:to-[#D49A1C] shadow-lg hover:shadow-[#F7BF24]/25 transform hover:scale-[1.02]'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <LockIcon className="h-5 w-5" />
                  Pay Rs. {paymentData.advance.toFixed(2)}
                </>
              )}
            </button>

            <p className="text-center text-gray-400 text-sm">
              By completing this payment, you agree to our terms and conditions.
            </p>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#181818] rounded-xl border border-gray-700 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              {/* Appointment Details */}
              <div className="mb-6 p-4 bg-[#232323] rounded-lg">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Appointment Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="h-4 w-4 text-[#F7BF24]" />
                    <span className="text-gray-400">Customer:</span>
                    <span className="text-white">{paymentData.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <PhoneIcon className="h-4 w-4 text-[#F7BF24]" />
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white">{paymentData.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-[#F7BF24]" />
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white">{paymentData.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="h-4 w-4 text-[#F7BF24]" />
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white">{paymentData.time}</span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Selected Services</h3>
                <div className="space-y-3">
                  {paymentData.services.map((service, index) => (
                    service && (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#232323] rounded-lg border border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 text-[#F7BF24]">
                            <CreditCardIcon className="h-full w-full" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{service.name}</p>
                            <p className="text-gray-400 text-xs">{service.duration} min</p>
                          </div>
                        </div>
                        <span className="text-[#F7BF24] font-bold">Rs.{service.price}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t border-gray-600 pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="text-white">Rs. {paymentData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Advance Payment (50%):</span>
                    <span className="text-[#F7BF24] font-bold">Rs. {paymentData.advance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Remaining:</span>
                    <span>Rs. {(paymentData.subtotal - paymentData.advance).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span className="font-medium">Secure Payment</span>
                </div>
                <p className="text-green-300 text-xs mt-1">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Green-Themed Alert Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
          {/* Simple backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeAlert}
          />
          
          {/* Clean Modal */}
          <div className={`relative bg-[#181818] border-2 rounded-2xl p-8 mx-4 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-1500 ${
            alertModal.type === 'success' 
              ? 'border-green-500/50 shadow-green-500/20' 
              : 'border-red-500/50 shadow-red-500/20'
          }`}>

            {/* Close button */}
            <button
              onClick={closeAlert}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Simple Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
                alertModal.type === 'success' 
                  ? 'bg-green-500/20 border-2 border-green-500/30' 
                  : 'bg-red-500/20 border-2 border-red-500/30'
              }`}>
                {alertModal.type === 'success' ? (
                  <CheckCircleIcon className="h-10 w-10 text-green-400" />
                ) : (
                  <AlertTriangleIcon className="h-10 w-10 text-red-400" />
                )}
              </div>

              {/* Title */}
              <h3 className={`text-2xl font-bold mb-4 ${
                alertModal.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {alertModal.title}
              </h3>

              {/* Message */}
              <div className="mb-8">
                <p className="text-gray-300 leading-relaxed">
                  {alertModal.type === 'success' 
                    ? "Your appointment has been confirmed successfully."
                    : alertModal.message
                  }
                </p>
                {alertModal.type === 'success' && (
                  <p className="text-green-400 text-sm mt-3 font-medium">
                    You will receive a confirmation SMS shortly.
                  </p>
                )}
              </div>

              {/* Simple Button */}
              <button
                onClick={closeAlert}
                className={`px-8 py-3 font-bold rounded-lg transition-all duration-200 hover:scale-105 ${
                  alertModal.type === 'success' 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {alertModal.type === 'success' ? 'Perfect!' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
