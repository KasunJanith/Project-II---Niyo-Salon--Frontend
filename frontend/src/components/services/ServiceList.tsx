import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowRightIcon, ClockIcon, StarIcon, ScissorsIcon, PencilIcon, GemIcon, SparklesIcon } from 'lucide-react';
import type { LucideIcon } from "lucide-react";
import { adminService, ServiceResponse } from '../../services/adminService';

// Interface for service with icon
interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  isActive?: boolean;
  popularityRank?: number;
  icon: LucideIcon;
}

// Map category to icon - same as AppointmentPage
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

const ServiceList = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Load services from backend - same logic as AppointmentPage
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
          }));
        setServices(servicesWithIcons);
      } catch (error) {
        console.error('Error loading services:', error);
        // Set empty array if error occurs
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, []);

  return (
    <section className="bg-[#181818] w-full py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-inter text-[#F7BF24] text-lg tracking-widest mb-4 uppercase">
            DETAILED PRICING
          </p>
          <h2 className="font-abril text-white text-4xl md:text-5xl font-bold mb-6 tracking-[2px]">
            SERVICE MENU
          </h2>
          <p className="text-gray-300 text-base max-w-2xl mx-auto mb-8">
            Professional grooming services with transparent pricing. Each service is performed by our skilled professionals using premium products.
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#F7BF24] to-transparent mx-auto"></div>
        </div>

        {/* Services List */}
        <div className="grid gap-6 md:gap-8">
          {servicesLoading ? (
            // Loading skeleton
            [...Array(6)].map((_, idx) => (
              <div key={idx} className="group relative bg-[#232323] border border-gray-600 rounded-lg overflow-hidden">
                <div className="p-6 md:p-8 animate-pulse">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gray-600 rounded-lg"></div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-grow">
                          <div className="h-6 bg-gray-600 rounded mb-3 w-3/4"></div>
                          <div className="h-4 bg-gray-600 rounded mb-2 w-full"></div>
                          <div className="h-4 bg-gray-600 rounded mb-4 w-2/3"></div>
                          <div className="h-4 bg-gray-600 rounded w-24"></div>
                        </div>
                        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-4 min-w-fit">
                          <div className="h-10 bg-gray-600 rounded-lg w-32"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : services.length === 0 ? (
            // No services found
            <div className="text-center py-12">
              <SparklesIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No services available</p>
              <p className="text-gray-500 text-sm">Please check back later or contact us for assistance.</p>
            </div>
          ) : (
            // Actual services
            services.map((service) => (
              <div
                key={service.id}
                className="group relative bg-[#232323] border border-gray-600 rounded-lg overflow-hidden hover:border-[#F7BF24] transition-all duration-500 hover:shadow-xl hover:shadow-[#F7BF24]/10"
              >
                {/* Popular Badge */}
                {service.popularityRank && service.popularityRank <= 3 && (
                  <div className="absolute top-4 right-4 bg-[#F7BF24] text-black px-3 py-1 rounded-full text-xs font-bold z-10">
                    POPULAR
                  </div>
                )}

                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* Icon Section */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-[#F7BF24] rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <service.icon className="w-10 h-10 text-black" />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-grow">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        {/* Service Info */}
                        <div className="flex-grow">
                          <h3 className="font-inter text-white text-2xl font-bold mb-3 tracking-wide group-hover:text-[#F7BF24] transition-colors duration-300">
                            {service.name}
                          </h3>
                          <p className="text-gray-300 text-base leading-relaxed mb-4 max-w-2xl">
                            {service.description}
                          </p>
                          
                          {/* Duration and Category */}
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-2 text-[#F7BF24] text-sm font-medium">
                              <ClockIcon size={16} />
                              <span>{service.duration} min</span>
                            </div>
                            <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-full font-medium">
                              {service.category}
                            </span>
                          </div>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon 
                                key={i} 
                                className={`w-4 h-4 ${
                                  i < (service.popularityRank ? 5 - service.popularityRank * 0.1 : 4.5) 
                                    ? 'text-[#F7BF24] fill-current' 
                                    : 'text-gray-600'
                                }`} 
                              />
                            ))}
                            <span className="text-xs text-gray-400 ml-1">
                              {service.popularityRank ? (5 - service.popularityRank * 0.1).toFixed(1) : "4.5"}
                            </span>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-4 min-w-fit">
                          <div className="text-center lg:text-right">
                            <div className="text-[#F7BF24] font-bold text-3xl font-inter">
                              Rs.{service.price}
                            </div>
                            <div className="text-gray-400 text-sm uppercase tracking-wide">
                              Starting from
                            </div>
                          </div>
                          
                          {/* Book Button */}
                          <Link to="/appointments">
                            <button className="group/btn bg-[#F7BF24] hover:bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-2 hover:gap-3 shadow-lg hover:shadow-xl hover:scale-105 min-w-fit uppercase">
                              Book Service
                              <ArrowRightIcon size={16} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Line */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#F7BF24] to-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-gray-600">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#F7BF24] mb-2">500+</div>
            <div className="text-white font-medium">Happy Clients</div>
            <div className="text-gray-400 text-sm">This Month</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#F7BF24] mb-2">{services.length}+</div>
            <div className="text-white font-medium">Service Options</div>
            <div className="text-gray-400 text-sm">Professional Grade</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#F7BF24] mb-2">98%</div>
            <div className="text-white font-medium">Satisfaction Rate</div>
            <div className="text-gray-400 text-sm">Customer Reviews</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 p-8 bg-[#232323] rounded-lg border border-gray-600">
          <h3 className="font-inter text-white text-2xl font-bold mb-4 tracking-wide">
            Discover the Experience Behind the Style.
          </h3>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Learn more about our story, team, and commitment to excellence. Then explore our gallery to see the artistry and attention to detail that define every service we offer.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center" >
            <Link to="/aboutus">
            <button className="bg-transparent border-2 border-[#F7BF24] text-[#F7BF24] hover:bg-[#F7BF24] hover:text-black px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 uppercase">
              About Us
            </button>
            </Link>
            <Link to="/gallery">
            <button className="bg-[#F7BF24] hover:bg-yellow-400 text-black px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 uppercase">
              View Gallery
            </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceList;