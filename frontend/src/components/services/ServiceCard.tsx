import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
type Service = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  imageUrl: string;
  title: string;
  description: string;
  price: string | number;
};

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service
}) => {
  const Icon = service.icon;
  return <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 overflow-hidden relative">
        <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <div className="flex items-center mb-3">
          <div className="bg-purple-100 rounded-full p-2 mr-3">
            <Icon size={20} className="text-purple-700" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {service.title}
          </h3>
        </div>
        <p className="text-gray-600 mb-4">{service.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-purple-700 font-medium">{service.price}</span>
          <Link to="/appointments" className="text-purple-700 hover:text-purple-900 inline-flex items-center">
            Book now
            <ArrowRightIcon size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    </div>;
};
export default ServiceCard;