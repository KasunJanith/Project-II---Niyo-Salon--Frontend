import { Link } from "react-router-dom";

import scissors from '../../assets/Home/icon scissors.svg';
import razor from '../../assets/Home/icon razor.svg';
import beard from '../../assets/Home/icon beard.svg';
import mustache from '../../assets/Home/icon mustache.svg';
import { ArrowRightIcon, ClockIcon, StarIcon } from 'lucide-react';

const ServiceList = () => {
  const services = [
    {
      icon: scissors,
      title: "HAIRCUT & STYLING",
      desc: "Professional haircuts and modern styling techniques tailored to your face shape and personal style.",
      price: "$35",
      duration: "45 min",
      popular: true,
    },
    {
      icon: razor,
      title: "CLASSIC SHAVE",
      desc: "Traditional wet shave experience with hot towels, premium products, and precision techniques.",
      price: "$25",
      duration: "30 min",
      popular: false,
    },
    {
      icon: beard,
      title: "BEARD GROOMING",
      desc: "Complete beard trimming, shaping, and conditioning for the perfect masculine look.",
      price: "$20",
      duration: "25 min",
      popular: false,
    },
    {
      icon: mustache,
      title: "MUSTACHE STYLING",
      desc: "Expert mustache trimming and styling to complement your facial features perfectly.",
      price: "$15",
      duration: "15 min",
      popular: false,
    },
    {
      icon: scissors,
      title: "HAIR WASH & TREATMENT",
      desc: "Deep cleansing and nourishing hair treatment with premium salon-grade products.",
      price: "$18",
      duration: "20 min",
      popular: false,
    },
    {
      icon: razor,
      title: "FACIAL GROOMING",
      desc: "Complete facial grooming service including eyebrow trimming and face moisturizing.",
      price: "$30",
      duration: "40 min",
      popular: true,
    },
  ];

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
          {services.map((service, idx) => (
            <div
              key={idx}
              className="group relative bg-[#232323] border border-gray-600 rounded-lg overflow-hidden hover:border-[#F7BF24] transition-all duration-500 hover:shadow-xl hover:shadow-[#F7BF24]/10"
            >
              {/* Popular Badge */}
              

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Icon Section */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-[#F7BF24] rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <img 
                        src={service.icon} 
                        alt={service.title} 
                        className="w-10 h-10 filter brightness-0" 
                      />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-grow">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Service Info */}
                      <div className="flex-grow">
                        <h3 className="font-inter text-white text-2xl font-bold mb-3 tracking-wide group-hover:text-[#F7BF24] transition-colors duration-300">
                          {service.title}
                        </h3>
                        <p className="text-gray-300 text-base leading-relaxed mb-4 max-w-2xl">
                          {service.desc}
                        </p>
                        
                        {/* Duration */}
                        <div className="flex items-center gap-2 text-[#F7BF24] text-sm font-medium">
                          <ClockIcon size={16} />
                          <span>{service.duration}</span>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-4 min-w-fit">
                        {/* <div className="text-center lg:text-right">
                          <div className="text-[#F7BF24] font-bold text-3xl font-inter">
                            {service.price}
                          </div>
                          <div className="text-gray-400 text-sm uppercase tracking-wide">
                            Starting from
                          </div>
                        </div> */}
                        
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
          ))}
        </div>

        {/* Bottom Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-gray-600">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#F7BF24] mb-2">500+</div>
            <div className="text-white font-medium">Happy Clients</div>
            <div className="text-gray-400 text-sm">This Month</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#F7BF24] mb-2">15+</div>
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