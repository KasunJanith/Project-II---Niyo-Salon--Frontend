import React, { useState, useEffect } from 'react';
import { SearchIcon, TagIcon, CalendarIcon, ClockIcon, ArrowRightIcon } from 'lucide-react';

// Helper function to convert basic Markdown to HTML
const convertMarkdownToHtml = (markdown: string) => {
    let html = markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li>$1</li>');

    if (html.includes('<li>')) {
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    }

    html = html.split('\n').map(line => {
        if (
            line.trim() === '' ||
            line.startsWith('<h') ||
            line.startsWith('<ul') ||
            line.startsWith('<li') ||
            line.startsWith('<p')
        ) {
            return line;
        }
        return `<p>${line}</p>`;
    }).join('');

    return html;
};

// Helper to estimate read time (150 words per minute)
const estimateReadTime = (content: string) => {
    const wordsPerMinute = 150;
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
};

// Blog post type
type BlogPost = {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    imageUrl: string;
    author: string;
    authorRole: string;
    authorImage: string;
    date: string;
    category: string;
    readTime: string;
    featured: boolean;
};

const BlogPage = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalPost, setModalPost] = useState<BlogPost | null>(null);

    const categories = [
        { id: 'all', name: 'All Posts' },
        { id: 'hair', name: 'Hair' },
        { id: 'tattoo', name: 'Tattoo' },
        
    ];

    const genericImageUrl = "https://placehold.co/800x480/A78BFA/ffffff?text=AI Salon Tips";
    const genericAuthorImage = "https://placehold.co/100x100/5B21B6/ffffff?text=AI";
    const genericAuthorRole = "AI Content Creator";
    const genericCategoryName = "AI Content";

    // Function to fetch blog content from Spring Boot backend
    const fetchBlogPosts = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8080/api/blog/posts');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Backend Error: ${response.status} - ${errorText || 'Unknown error'}`);
            }
            const data = await response.json();
            // Assign category based on backend or infer from title/content
            const transformedPosts: BlogPost[] = data.map((post: any) => {
                let category = (post.category || "")
                    .toLowerCase()
                    .replace(/\s/g, '-');
                if (!category || category === "ai-content") {
                    const text = (post.title + " " + post.content).toLowerCase();
                    if (text.includes("hair")) category = "hair";
                    else if (text.includes("tattoo")) category = "tattoo";
                    else if (text.includes("grooming")) category = "grooming";
                    else category = "ai-content";
                }
                return {
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    excerpt: post.content ? post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '') : '',
                    imageUrl: genericImageUrl,
                    author: post.author || 'AI Generated',
                    authorRole: genericAuthorRole,
                    authorImage: genericAuthorImage,
                    date: new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    category,
                    readTime: post.content ? estimateReadTime(post.content) : 'N/A',
                    featured: false
                };
            });
            setBlogPosts(transformedPosts);
        } catch (err: any) {
            console.error("Error fetching blog posts:", err);
            setError(`Error fetching blog posts: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogPosts();
    }, []);

    // Filter posts by category and search term
    const filteredPosts = blogPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = (activeCategory === 'all' || post.category === activeCategory);
        return matchesSearch && matchesCategory;
    });

    const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;

    const ArticleModal = ({ post, onClose }: { post: BlogPost | null, onClose: () => void }) => {
        if (!post) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                <div className="bg-[#232323] max-w-2xl w-full rounded-lg shadow-lg p-8 relative overflow-y-auto max-h-[90vh]">
                    <button
                        className="absolute top-4 right-4 text-gray-400 hover:text-[#F7BF24] text-2xl font-bold"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-64 object-cover rounded mb-6"
                    />
                    <div className="flex items-center mb-4">
                        <TagIcon size={16} className="text-[#F7BF24] mr-2" />
                        <span className="text-sm font-semibold text-[#F7BF24] capitalize tracking-wide">
                            {post.category}
                        </span>
                    </div>
                    <h2 className="text-3xl font-abril font-bold text-white mb-4">{post.title}</h2>
                    <div className="flex items-center mb-6">
                        <img
                            src={post.authorImage}
                            alt={post.author}
                            className="h-10 w-10 rounded-full object-cover mr-3 border border-[#F7BF24]"
                        />
                        <div>
                            <p className="text-sm font-semibold text-white">{post.author}</p>
                            <div className="flex items-center text-xs text-gray-400">
                                <CalendarIcon size={10} className="mr-1" />
                                {post.date} • {post.readTime}
                            </div>
                        </div>
                    </div>
                    <div
                        className="prose prose-invert max-w-none text-gray-200"
                        dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(post.content) }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="w-full bg-[#212121] min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-[#212121] to-[#181818] text-white text-center py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-[#F7BF24] rounded-full animate-pulse"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>
                <div className="relative z-10">
                    <div className="flex justify-center items-center gap-8 mb-8">
                        <div className="w-20 h-px bg-gradient-to-r from-transparent to-[#F7BF24]"></div>
                        <div className="w-4 h-4 bg-[#F7BF24] rotate-45"></div>
                        <div className="w-20 h-px bg-gradient-to-l from-transparent to-[#F7BF24]"></div>
                    </div>
                    <p className="font-inter text-[#F7BF24] text-lg tracking-[3px] mb-4 uppercase">
                        Expert Insights
                    </p>
                    <h1 className="text-white text-center font-abril text-6xl md:text-7xl font-bold leading-none tracking-[4px] mb-8">
                        STYLE JOURNAL
                    </h1>
                    <p className="text-white/80 text-xl max-w-3xl mx-auto mb-8">
                        Stay updated with the latest trends, tips, and insights from our professional stylists and artists
                    </p>
                    <div className="flex justify-center items-center gap-8">
                        <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#F7BF24]"></div>
                        <div className="text-[#F7BF24] text-2xl">✦</div>
                        <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#F7BF24]"></div>
                    </div>
                </div>
            </section>

            {/* Main Blog Section */}
            <section className="bg-[#181818] py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Search and Filters */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-6">
                        {/* Search Bar */}
                        <div className="relative w-full lg:w-96">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <SearchIcon size={20} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-12 pr-4 py-4 bg-[#232323] border border-gray-600 rounded-full text-white placeholder-gray-400 focus:ring-2 focus:ring-[#F7BF24] focus:border-[#F7BF24] transition-all duration-300"
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
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
                    </div>

                    {/* Loading/Error States */}
                    {isLoading && (
                        <div className="text-center py-20">
                            <svg className="animate-spin h-10 w-10 text-[#F7BF24] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-white text-lg">Fetching latest style insights...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center py-20 p-6 bg-red-800/20 text-red-400 rounded-lg border border-red-700">
                            <p className="text-xl font-bold mb-2">Error Loading Blog Posts!</p>
                            <p>{error}</p>
                            <p className="text-sm mt-4">Please ensure your Spring Boot backend is running and accessible at `http://localhost:8080`.</p>
                        </div>
                    )}
                    {!isLoading && filteredPosts.length === 0 && !error && (
                        <div className="text-center py-20 text-gray-400 text-lg">
                            No blog posts found. New AI-generated posts will appear here automatically.
                            
                        </div>
                    )}

                    {/* Featured Post */}
                    {featuredPost && !isLoading && !error && (activeCategory === 'all' || activeCategory === 'ai-content') && searchTerm === '' && (
                        <div className="mb-20">
                            <div className="relative bg-[#232323] rounded-lg overflow-hidden border border-gray-600 hover:border-[#F7BF24] transition-all duration-500 group">
                                <div className="absolute top-6 left-6 z-10">
                                    <div className="bg-[#F7BF24] text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                        <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                                        Featured Article
                                    </div>
                                </div>
                                <div className="md:flex">
                                    <div className="md:w-1/2">
                                        <div className="h-80 md:h-full overflow-hidden">
                                            <img
                                                src={featuredPost.imageUrl}
                                                alt={featuredPost.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:w-1/2 p-8 md:p-12">
                                        <div className="flex items-center mb-4">
                                            <TagIcon size={16} className="text-[#F7BF24] mr-2" />
                                            <span className="text-sm font-semibold text-[#F7BF24] capitalize tracking-wide">
                                                {featuredPost.category}
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-abril font-bold text-white mb-6 tracking-wide group-hover:text-[#F7BF24] transition-colors duration-300">
                                            {featuredPost.title}
                                        </h2>
                                        <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                                            {featuredPost.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <img
                                                    src={featuredPost.authorImage}
                                                    alt={featuredPost.author}
                                                    className="h-12 w-12 rounded-full object-cover mr-4 border-2 border-[#F7BF24]"
                                                />
                                                <div>
                                                    <p className="font-semibold text-white text-lg">
                                                        {featuredPost.author}
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        {featuredPost.authorRole} • {featuredPost.date}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-[#F7BF24] font-medium">
                                                    {featuredPost.readTime}
                                                </span>
                                                <button
                                                    className="bg-[#F7BF24] hover:bg-yellow-400 text-black px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105"
                                                    onClick={() => setModalPost(featuredPost)}
                                                >
                                                    Read Article
                                                    <ArrowRightIcon size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#F7BF24] to-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                            </div>
                        </div>
                    )}

                    {/* Blog Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post, index) => (
                            <article
                                key={post.id}
                                className="group relative bg-[#232323] rounded-lg overflow-hidden border border-gray-600 hover:border-[#F7BF24] transition-all duration-500 hover:shadow-xl hover:shadow-[#F7BF24]/20 transform hover:scale-105"
                                style={{
                                    animationDelay: `${index * 50}ms`
                                }}
                            >
                                <div className="h-56 overflow-hidden">
                                    <img
                                        src={post.imageUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <TagIcon size={14} className="text-[#F7BF24] mr-2" />
                                            <span className="text-xs font-semibold text-[#F7BF24] capitalize tracking-wide">
                                                {post.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-400 text-xs">
                                            <ClockIcon size={12} className="mr-1" />
                                            {post.readTime}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-inter font-bold mb-3 text-white group-hover:text-[#F7BF24] transition-colors duration-300 leading-tight">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-300 mb-6 line-clamp-3 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <img
                                                src={post.authorImage}
                                                alt={post.author}
                                                className="h-10 w-10 rounded-full object-cover mr-3 border border-[#F7BF24]"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {post.author}
                                                </p>
                                                <div className="flex items-center text-xs text-gray-400">
                                                    <CalendarIcon size={10} className="mr-1" />
                                                    {post.date}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="text-[#F7BF24] hover:text-yellow-400 font-semibold text-sm transition-colors duration-300 flex items-center gap-1 group/btn"
                                            onClick={() => setModalPost(post)}
                                        >
                                            Read More
                                            <ArrowRightIcon size={12} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#F7BF24] to-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                            </article>
                        ))}
                    </div>

                    {/* Newsletter Section */}
                    <div className="mt-20 text-center p-12 bg-gradient-to-r from-[#232323] via-[#2a2a2a] to-[#232323] rounded-lg border border-gray-600 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-5">
                            <div className="grid grid-cols-8 gap-4 h-full">
                                {[...Array(32)].map((_, i) => (
                                    <div key={i} className="w-full h-full bg-[#F7BF24] opacity-20"></div>
                                ))}
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h3 className="font-abril text-white text-3xl font-bold mb-4 tracking-wide">
                                Stay In The Loop
                            </h3>
                            <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
                                Get the latest style tips, trends, and exclusive salon offers delivered straight to your inbox
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="flex-1 px-6 py-4 bg-[#181818] border border-gray-600 rounded-full text-white placeholder-gray-400 focus:ring-2 focus:ring-[#F7BF24] focus:border-[#F7BF24] transition-all duration-300"
                                />
                                <button className="bg-[#F7BF24] hover:bg-yellow-400 text-black px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                                    Subscribe
                                    <ArrowRightIcon size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Pagination */}
                    <div className="flex justify-center mt-16">
                        <nav className="flex items-center gap-2">
                            <button className="p-3 rounded-full bg-[#232323] border border-gray-600 text-gray-400 hover:border-[#F7BF24] hover:text-[#F7BF24] transition-all duration-300">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            {[1, 2, 3].map((page) => (
                                <button
                                    key={page}
                                    className={`px-4 py-3 rounded-full font-semibold transition-all duration-300 ${
                                        page === 1
                                            ? 'bg-[#F7BF24] text-black shadow-lg'
                                            : 'bg-[#232323] border border-gray-600 text-white hover:border-[#F7BF24] hover:text-[#F7BF24]'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button className="p-3 rounded-full bg-[#232323] border border-gray-600 text-gray-400 hover:border-[#F7BF24] hover:text-[#F7BF24] transition-all duration-300">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-[#232323] py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="group">
                            <div className="text-5xl font-bold text-[#F7BF24] mb-2 group-hover:scale-110 transition-transform duration-300">
                                50+
                            </div>
                            <div className="text-white font-semibold text-lg mb-1">Articles Published</div>
                            <div className="text-gray-400">Expert Insights & Tips</div>
                        </div>
                        <div className="group">
                            <div className="text-5xl font-bold text-[#F7BF24] mb-2 group-hover:scale-110 transition-transform duration-300">
                                10K+
                            </div>
                            <div className="text-white font-semibold text-lg mb-1">Monthly Readers</div>
                            <div className="text-gray-400">Style Enthusiasts</div>
                        </div>
                        <div className="group">
                            <div className="text-5xl font-bold text-[#F7BF24] mb-2 group-hover:scale-110 transition-transform duration-300">
                                5★
                            </div>
                            <div className="text-white font-semibold text-lg mb-1">Reader Rating</div>
                            <div className="text-gray-400">Quality Content</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Article Modal */}
            <ArticleModal post={modalPost} onClose={() => setModalPost(null)} />
        </div>
    );
};

export default BlogPage;