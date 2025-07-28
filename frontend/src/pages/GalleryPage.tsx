import { useState } from 'react';
import { GridIcon, ColumnsIcon, SearchIcon, FilterIcon } from 'lucide-react';
import galleryBg from '../assets/Gallery/bg-gallery.jpg';
import img1 from '../assets/Gallery/img1.jpg';
import img2 from '../assets/Gallery/img2.jpg';
import img3 from '../assets/Gallery/img3.jpg';
import img4 from '../assets/Gallery/img4.jpg';
import img5 from '../assets/Gallery/img5.jpg';
import img6 from '../assets/Gallery/img6.jpg';
const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'columns'
  // Mock data for gallery items
  const galleryItems = [
    {
      id: 1,
      title: 'Modern Fade Haircut',
      description: 'Clean modern fade with textured top',
      imageUrl: img1,
      category: 'haircut',
      stylist: 'Jamie Rodriguez'
    },
    {
      id: 2,
      title: 'Beard Trim and Shape',
      description: 'Professional beard grooming and shaping',
      imageUrl: img2,
      category: 'beard',
      stylist: 'Alex Kim'
    },
    {
      id: 3,
      title: 'Geometric Wolf Tattoo',
      description: 'Custom geometric wolf design with fine line work',
      imageUrl: img3,
      category: 'tattoo',
      stylist: 'Taylor Morgan'
    },
    {
      id: 4,
      title: 'Long Hair Styling',
      description: 'Layered cut with beachy waves',
      imageUrl: img4,
      category: 'haircut',
      stylist: 'Jamie Rodriguez'
    },
    {
      id: 5,
      title: 'Classic Pompadour',
      description: 'Timeless pompadour style with modern touch',
      imageUrl: img5,
      category: 'haircut',
      stylist: 'Jamie Rodriguez'
    },
    {
      id: 6,
      title: 'Full Beard Grooming',
      description: 'Full beard trim and styling',
      imageUrl: img6,
      category: 'beard',
      stylist: 'Alex Kim'
    },
    {
      id: 7,
      title: 'Floral Sleeve Tattoo',
      description: 'Intricate floral design sleeve tattoo',
      imageUrl: img1,
      category: 'tattoo',
      stylist: 'Taylor Morgan'
    },
    {
      id: 8,
      title: 'Minimalist Linework Tattoo',
      description: 'Clean, minimalist line work design',
      imageUrl: img2,
      category: 'tattoo',
      stylist: 'Taylor Morgan'
    },
    {
      id: 9,
      title: 'Textured Crop Haircut',
      description: 'Short textured crop with clean fade',
      imageUrl: img3,
      category: 'haircut',
      stylist: 'Jamie Rodriguez'
    }
  ];
  // Gallery categories
  const categories = [{
    id: 'all',
    name: 'All Work'
  }, {
    id: 'haircut',
    name: 'Haircuts'
  }, {
    id: 'beard',
    name: 'Beard Grooming'
  }, {
    id: 'tattoo',
    name: 'Tattoos'
  }];
  // Filter gallery items by category
  const filteredItems = activeCategory === 'all' ? galleryItems : galleryItems.filter(item => item.category === activeCategory);
  return (
    <div className="w-full bg-[#212121] min-h-screen">
      {/* Hero Section */}
      <section 
        className="bg-cover bg-center text-white text-center py-20 relative"
        style={{ backgroundImage: `url(${galleryBg})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10">
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#F7BF24]"></div>
            <div className="w-3 h-3 bg-[#F7BF24] rotate-45"></div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#F7BF24]"></div>
          </div>
          
          <p className="font-inter text-[#F7BF24] text-lg tracking-[3px] mb-4 uppercase">
            Our Portfolio
          </p>
          <h1 className="text-white text-center font-abril text-6xl md:text-7xl font-bold leading-none tracking-[4px] mb-8">
            GALLERY
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mx-auto mb-8">
            Discover our masterpieces and get inspired for your next transformation
          </p>
          
          <div className="flex justify-center items-center gap-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#F7BF24]"></div>
            <div className="text-[#F7BF24] text-2xl">✦</div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#F7BF24]"></div>
          </div>
        </div>
      </section>

      {/* Main Gallery Section */}
      <section className="bg-[#181818] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Filters and View Mode Toggle */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`px-6 py-3 rounded-full font-inter text-sm font-semibold tracking-wide transition-all duration-300 border-2 ${
                    activeCategory === category.id
                      ? 'bg-[#F7BF24] text-black border-[#F7BF24] shadow-lg shadow-[#F7BF24]/30'
                      : 'bg-transparent text-white border-gray-600 hover:border-[#F7BF24] hover:text-[#F7BF24]'
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name.toUpperCase()}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-[#232323] border border-gray-600 rounded-full p-1">
              <button
                className={`p-3 rounded-full transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-[#F7BF24] text-black shadow-lg'
                    : 'text-white hover:text-[#F7BF24]'
                }`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <GridIcon size={20} />
              </button>
              <button
                className={`p-3 rounded-full transition-all duration-300 ${
                  viewMode === 'columns'
                    ? 'bg-[#F7BF24] text-black shadow-lg'
                    : 'text-white hover:text-[#F7BF24]'
                }`}
                onClick={() => setViewMode('columns')}
                aria-label="Columns view"
              >
                <ColumnsIcon size={20} />
              </button>
            </div>
          </div>

          {/* Gallery Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-lg bg-[#232323] border border-gray-600 hover:border-[#F7BF24] transition-all duration-500 hover:shadow-xl hover:shadow-[#F7BF24]/20 transform hover:scale-105"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-white font-abril text-xl font-bold mb-2 tracking-wide">
                        {item.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#F7BF24] rounded-full flex items-center justify-center">
                          <span className="text-black font-bold text-xs">
                            {item.stylist.charAt(0)}
                          </span>
                        </div>
                        <span className="text-[#F7BF24] text-sm font-semibold">
                          {item.stylist}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 bg-[#F7BF24] text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.category}
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#F7BF24] to-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-lg bg-[#232323] border border-gray-600 hover:border-[#F7BF24] transition-all duration-500 break-inside-avoid hover:shadow-xl hover:shadow-[#F7BF24]/20"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-6">
                    <h3 className="font-abril text-white text-xl font-bold mb-2 tracking-wide group-hover:text-[#F7BF24] transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#F7BF24] rounded-full flex items-center justify-center">
                          <span className="text-black font-bold text-xs">
                            {item.stylist.charAt(0)}
                          </span>
                        </div>
                        <span className="text-[#F7BF24] text-sm font-semibold">
                          {item.stylist}
                        </span>
                      </div>
                      <span className="text-gray-500 text-xs uppercase bg-gray-700 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Section */}
          <div className="text-center mt-16 pt-16 border-t border-gray-600">
            <h3 className="font-abril text-white text-2xl font-bold mb-4 tracking-wide">
              Want to See More?
            </h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Follow us on social media for daily updates and behind-the-scenes content
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#F7BF24] hover:bg-yellow-400 text-black px-8 py-4 rounded-full font-bold text-sm tracking-wide transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                LOAD MORE GALLERY
              </button>
              <button className="bg-transparent border-2 border-[#F7BF24] text-[#F7BF24] hover:bg-[#F7BF24] hover:text-black px-8 py-4 rounded-full font-bold text-sm tracking-wide transition-all duration-300 transform hover:scale-105">
                BOOK APPOINTMENT
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#232323] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group">
              <div className="text-5xl font-bold text-[#F7BF24] mb-2 group-hover:scale-110 transition-transform duration-300">
                2000+
              </div>
              <div className="text-white font-semibold text-lg mb-1">Happy Clients</div>
              <div className="text-gray-400">Transformed & Satisfied</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold text-[#F7BF24] mb-2 group-hover:scale-110 transition-transform duration-300">
                500+
              </div>
              <div className="text-white font-semibold text-lg mb-1">Gallery Photos</div>
              <div className="text-gray-400">Premium Work Showcase</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold text-[#F7BF24] mb-2 group-hover:scale-110 transition-transform duration-300">
                100%
              </div>
              <div className="text-white font-semibold text-lg mb-1">Satisfaction</div>
              <div className="text-gray-400">Guaranteed Results</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default GalleryPage;