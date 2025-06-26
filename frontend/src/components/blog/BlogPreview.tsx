import React from 'react';
import { Link } from 'react-router-dom';
const BlogPreview = ({
  post
}) => {
  return <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 overflow-hidden">
        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <span className="text-sm text-gray-500">{post.date}</span>
        <h3 className="text-xl font-semibold mt-2 mb-3 text-gray-900">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-4">{post.excerpt}</p>
        <Link to={`/blog/${post.id}`} className="text-purple-700 font-medium hover:text-purple-900">
          Read more
        </Link>
      </div>
    </article>;
};
export default BlogPreview;