import { useState } from 'react';
import { GridIcon, ColumnsIcon } from 'lucide-react';
const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'columns'
  // Mock data for gallery items
  const galleryItems = [{
    id: 1,
    title: 'Modern Fade Haircut',
    description: 'Clean modern fade with textured top',
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    category: 'haircut',
    stylist: 'Jamie Rodriguez'
  }, {
    id: 2,
    title: 'Beard Trim and Shape',
    description: 'Professional beard grooming and shaping',
    imageUrl: 'https://images.unsplash.com/photo-1635273051899-3f76b81f1a31?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    category: 'beard',
    stylist: 'Alex Kim'
  }, {
    id: 3,
    title: 'Geometric Wolf Tattoo',
    description: 'Custom geometric wolf design with fine line work',
    imageUrl: 'https://images.unsplash.com/photo-1611501355759-f0e3ce5c7dc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    category: 'tattoo',
    stylist: 'Taylor Morgan'
  }, {
    id: 4,
    title: 'Long Hair Styling',
    description: 'Layered cut with beachy waves',
    imageUrl: 'https://images.unsplash.com/photo-1626015677293-95388882c900?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    category: 'haircut',
    stylist: 'Jamie Rodriguez'
  }, {
    id: 5,
    title: 'Classic Pompadour',
    description: 'Timeless pompadour style with modern touch',
    imageUrl: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    category: 'haircut',
    stylist: 'Jamie Rodriguez'
  }, {
    id: 6,
    title: 'Full Beard Grooming',
    description: 'Full beard trim and styling',
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    category: 'beard',
    stylist: 'Alex Kim'
  }, {
    id: 7,
    title: 'Floral Sleeve Tattoo',
    description: 'Intricate floral design sleeve tattoo',
    imageUrl: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    category: 'tattoo',
    stylist: 'Taylor Morgan'
  }, {
    id: 8,
    title: 'Minimalist Linework Tattoo',
    description: 'Clean, minimalist line work design',
    imageUrl: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    category: 'tattoo',
    stylist: 'Taylor Morgan'
  }, {
    id: 9,
    title: 'Textured Crop Haircut',
    description: 'Short textured crop with clean fade',
    imageUrl: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    category: 'haircut',
    stylist: 'Jamie Rodriguez'
  }];
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
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Our Gallery</h1>
      {/* Filters and View Mode Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
          {categories.map(category => <button key={category.id} className={`px-4 py-2 rounded-md text-sm font-medium ${activeCategory === category.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveCategory(category.id)}>
              {category.name}
            </button>)}
        </div>
        <div className="flex border border-gray-300 rounded-md">
          <button className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-700' : 'bg-white text-gray-700'}`} onClick={() => setViewMode('grid')} aria-label="Grid view">
            <GridIcon size={20} />
          </button>
          <button className={`p-2 ${viewMode === 'columns' ? 'bg-purple-100 text-purple-700' : 'bg-white text-gray-700'}`} onClick={() => setViewMode('columns')} aria-label="Columns view">
            <ColumnsIcon size={20} />
          </button>
        </div>
      </div>
      {/* Gallery Grid */}
      {viewMode === 'grid' ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => <div key={item.id} className="group relative overflow-hidden rounded-lg shadow-md bg-white">
              <div className="aspect-square overflow-hidden">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-semibold text-lg">
                  {item.title}
                </h3>
                <p className="text-gray-200 text-sm">{item.description}</p>
                <p className="text-purple-300 text-sm mt-1">
                  by {item.stylist}
                </p>
              </div>
            </div>)}
        </div> : <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredItems.map(item => <div key={item.id} className="group relative overflow-hidden rounded-lg shadow-md bg-white break-inside-avoid">
              <img src={item.imageUrl} alt={item.title} className="w-full object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                <p className="text-purple-700 text-sm mt-1">
                  by {item.stylist}
                </p>
              </div>
            </div>)}
        </div>}
      {/* Load More Button */}
      <div className="mt-12 text-center">
        <button className="bg-purple-700 text-white px-6 py-3 rounded-md hover:bg-purple-800">
          Load More
        </button>
      </div>
    </div>;
};
export default GalleryPage;