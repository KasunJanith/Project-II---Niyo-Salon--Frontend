import React, { useState } from 'react';
import { SearchIcon, TagIcon } from 'lucide-react';
const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  // Mock data for blog posts
  const blogPosts = [{
    id: 1,
    title: '2023 Hair Trends You Need to Try',
    excerpt: 'Discover the hottest hair trends of the year and how to achieve these looks with our expert tips.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
    imageUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    author: 'Jamie Rodriguez',
    authorRole: 'Senior Hair Stylist',
    authorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    date: 'June 15, 2023',
    category: 'hair',
    readTime: '5 min read',
    featured: true
  }, {
    id: 2,
    title: 'Tattoo Aftercare: Essential Tips',
    excerpt: 'Learn how to properly care for your new tattoo to ensure it heals perfectly and maintains its vibrant appearance.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
    imageUrl: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    author: 'Taylor Morgan',
    authorRole: 'Tattoo Artist',
    authorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    date: 'May 28, 2023',
    category: 'tattoo',
    readTime: '7 min read',
    featured: false
  }, {
    id: 3,
    title: 'The Art of Beard Maintenance',
    excerpt: 'Expert tips on how to keep your beard looking its best between salon visits. Grooming techniques and product recommendations.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
    imageUrl: 'https://images.unsplash.com/photo-1513531926349-466f15ec8cc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    author: 'Alex Kim',
    authorRole: 'Barber',
    authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    date: 'May 10, 2023',
    category: 'grooming',
    readTime: '4 min read',
    featured: false
  }, {
    id: 4,
    title: 'Choosing the Right Hair Color for Your Skin Tone',
    excerpt: 'Find the perfect hair color to complement your skin tone with our comprehensive guide.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    author: 'Jordan Smith',
    authorRole: 'Hair Colorist',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    date: 'April 22, 2023',
    category: 'hair',
    readTime: '6 min read',
    featured: false
  }, {
    id: 5,
    title: 'Minimalist Tattoo Designs That Make a Big Impact',
    excerpt: 'Explore the beauty of simplicity with these stunning minimalist tattoo ideas.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
    imageUrl: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    author: 'Taylor Morgan',
    authorRole: 'Tattoo Artist',
    authorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    date: 'April 15, 2023',
    category: 'tattoo',
    readTime: '5 min read',
    featured: false
  }, {
    id: 6,
    title: 'Summer Skincare Routine for Men',
    excerpt: 'Keep your skin healthy and fresh during the hot summer months with these essential skincare tips.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.',
    imageUrl: 'https://images.unsplash.com/photo-1540935825-4044121bbc7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    author: 'Alex Kim',
    authorRole: 'Barber',
    authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    date: 'April 3, 2023',
    category: 'grooming',
    readTime: '8 min read',
    featured: false
  }];
  // Blog categories
  const categories = [{
    id: 'all',
    name: 'All Posts'
  }, {
    id: 'hair',
    name: 'Hair'
  }, {
    id: 'tattoo',
    name: 'Tattoo'
  }, {
    id: 'grooming',
    name: 'Grooming'
  }];
  // Filter posts by category
  const filteredPosts = activeCategory === 'all' ? blogPosts : blogPosts.filter(post => post.category === activeCategory);
  // Get featured post
  const featuredPost = blogPosts.find(post => post.featured);
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Style Insights</h1>
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="relative w-full md:w-64 mb-4 md:mb-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" placeholder="Search articles..." />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => <button key={category.id} className={`px-4 py-2 rounded-md text-sm font-medium ${activeCategory === category.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveCategory(category.id)}>
              {category.name}
            </button>)}
        </div>
      </div>
      {/* Featured Post */}
      {featuredPost && activeCategory === 'all' && <div className="mb-12">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="h-64 md:h-full overflow-hidden">
                  <img src={featuredPost.imageUrl} alt={featuredPost.title} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="md:w-1/2 p-6 md:p-8">
                <div className="flex items-center mb-4">
                  <TagIcon size={16} className="text-purple-700 mr-2" />
                  <span className="text-sm font-medium text-purple-700 capitalize">
                    {featuredPost.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img src={featuredPost.authorImage} alt={featuredPost.author} className="h-10 w-10 rounded-full object-cover mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {featuredPost.author}
                      </p>
                      <p className="text-sm text-gray-500">
                        {featuredPost.date}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {featuredPost.readTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>}
      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map(post => <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="h-48 overflow-hidden">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <div className="flex items-center mb-3">
                <TagIcon size={14} className="text-purple-700 mr-2" />
                <span className="text-xs font-medium text-purple-700 capitalize">
                  {post.category}
                </span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-xs text-gray-500">{post.readTime}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img src={post.authorImage} alt={post.author} className="h-8 w-8 rounded-full object-cover mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {post.author}
                    </p>
                    <p className="text-xs text-gray-500">{post.date}</p>
                  </div>
                </div>
                <button className="text-purple-700 hover:text-purple-900 font-medium text-sm">
                  Read more
                </button>
              </div>
            </div>
          </article>)}
      </div>
      {/* Pagination */}
      <div className="flex justify-center mt-12">
        <nav className="inline-flex rounded-md shadow">
          <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            <span className="sr-only">Previous</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </a>
          <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            1
          </a>
          <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-purple-50 text-sm font-medium text-purple-700">
            2
          </a>
          <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            3
          </a>
          <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            <span className="sr-only">Next</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        </nav>
      </div>
    </div>;
};
export default BlogPage;