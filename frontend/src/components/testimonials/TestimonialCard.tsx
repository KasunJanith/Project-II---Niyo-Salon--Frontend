import React from 'react';
import { StarIcon } from 'lucide-react';
const TestimonialCard = ({
  testimonial
}) => {
  return <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <img src={testimonial.imageUrl} alt={testimonial.name} className="h-12 w-12 rounded-full object-cover mr-4" />
        <div>
          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
          <p className="text-sm text-gray-600">{testimonial.role}</p>
        </div>
      </div>
      <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => <StarIcon key={i} size={16} fill={i < testimonial.rating ? 'currentColor' : 'none'} className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'} />)}
      </div>
    </div>;
};
export default TestimonialCard;