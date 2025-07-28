import { Link } from "react-router-dom";
import herobg from "../assets/Home/hero-bg.png";
import path3 from "../assets/Home/Path 3.svg";
import scissor from "../assets/Home/icon scissors.svg";
import path2 from "../assets/Home/Path 2.svg";
import mustache from "../assets/Home/icon mustache.svg";
import down from "../assets/Home/down.svg";

import sevBg from "../assets/Services/Services.png";

import scissors from "../assets/Home/icon scissors.svg";
import razor from "../assets/Home/icon razor.svg";
import beard from "../assets/Home/icon beard.svg";

import {
  ScissorsIcon,
  PencilIcon,
  CalendarIcon,
  ArrowRightIcon,
  BoxIcon,
} from "lucide-react";
import TestimonialCard from "../components/testimonials/TestimonialCard";
import BlogPreview from "../components/blog/BlogPreview";
import CounterEle from "../components/Home/CounterEle";
import ClientReviews from "../components/Home/ClientReviews";
import Brands from "../components/Home/Brands";
const HomePage = () => {
  const testimonials = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "Regular Customer",
      content:
        "Niyo Salon has been my go-to place for haircuts for over a year now. The staff is professional and the results are always amazing!",
      rating: 5,
      imageUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
    {
      id: 2,
      name: "Jamie Smith",
      role: "First-time Client",
      content:
        "I was nervous about getting my first tattoo, but the artists at Niyo made me feel comfortable and delivered exactly what I wanted.",
      rating: 5,
      imageUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
    {
      id: 3,
      name: "Taylor Morgan",
      role: "Monthly Visitor",
      content:
        "The beard grooming service is top-notch. I always leave looking sharp and feeling confident.",
      rating: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
  ];

  // Services
  const services = [
    {
      icon: scissors,
      title: "HAIRCUT & BEARD TRIM",
      desc: "Duis porta, ligula rhoncuseuism od pretium, nisi tellus eleifend odio, luctus viverra sem.",
    },
    {
      icon: razor,
      title: "SHAVES & HAIRCUT",
      desc: "Duis porta, ligula rhoncuseuism od pretium, nisi tellus eleifend odio, luctus viverra sem.",
    },
    {
      icon: beard,
      title: "FACIAL & SHAVE",
      desc: "Duis porta, ligula rhoncuseuism od pretium, nisi tellus eleifend odio, luctus viverra sem.",
    },
    {
      icon: mustache,
      title: "THE BIG DAY",
      desc: "Duis porta, ligula rhoncuseuism od pretium, nisi tellus eleifend odio, luctus viverra sem.",
    },
    {
      icon: razor,
      title: "SHAVES & HAIRCUT",
      desc: "Duis porta, ligula rhoncuseuism od pretium, nisi tellus eleifend odio, luctus viverra sem.",
    },
    {
      icon: razor,
      title: "SHAVES & HAIRCUT",
      desc: "Duis porta, ligula rhoncuseuism od pretium, nisi tellus eleifend odio, luctus viverra sem.",
      highlight: true, // For the blue border
    },
  ];
  // Mock data for blog posts
  const blogPosts = [
    {
      id: 1,
      title: "2023 Hair Trends You Need to Try",
      excerpt:
        "Discover the hottest hair trends of the year and how to achieve these looks.",
      imageUrl:
        "https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      date: "June 15, 2023",
    },
    {
      id: 2,
      title: "Tattoo Aftercare: Essential Tips",
      excerpt:
        "Learn how to properly care for your new tattoo to ensure it heals perfectly.",
      imageUrl:
        "https://images.unsplash.com/photo-1562962230-16e4623d36e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      date: "May 28, 2023",
    },
    {
      id: 3,
      title: "The Art of Beard Maintenance",
      excerpt:
        "Expert tips on how to keep your beard looking its best between salon visits.",
      imageUrl:
        "https://images.unsplash.com/photo-1513531926349-466f15ec8cc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      date: "May 10, 2023",
    },
  ];
  return (
    <div className="w-full bg-[#212121]">
      {/* Hero Section 01 */}
      <section
        className="bg-cover bg-center text-white text-center pt-10"
        style={{ backgroundImage: `url(${herobg})` }}
      >
        <section className="border-b-1 border-white-100 pt-10">
          <div className="flex justify-center items-center gap-8 py-[40px]">
            <img
              src={path3}
              alt="Left Decoration"
              className="w-[113.48px] h-[87.935px] flex-shrink-0 [stroke-width:4.001px] [stroke:rgba(247,191,36,0.91)]"
            />
            <img
              src={scissor}
              alt="Scissors Icon"
              className="flex flex-col items-center gap-[94px] px-[20px] mt-[-80px]"
            />
            <img
              src={path2}
              alt="Right Decoration"
              className="w-[113.48px] h-[87.935px]  flex-shrink-0 [stroke-width:4.001px] [stroke:rgba(247,191,36,0.91)]"
            />
          </div>

          <h1 className="text-white text-center [leading-trim:both] [text-edge:cap] font-abril text-[120px] font-semibold leading-none tracking-[6px]">
            NIYO SALON
          </h1>

          <div className="flex flex-col items-center relative w-full mt-8">
            {/* Mustache Icon */}
            <img
              src={mustache}
              alt="Mustache"
              className="w-[171.98px] y-[54.6px] mb-4"
            />

            {/* Center Text */}
            <p className="font-abril text-white text-[30px] md:text-5xl font-medium">
              shaves & trims
            </p>

            {/* Chevron with EST. and 2024 */}
            <div
              className="relative w-full flex justify-center items-center"
              style={{ height: 150 }}
            >
              
              {/* Chevron SVG */}
              <img
                src={down}
                alt="Chevron"
                className="w-[425.261px] max-w-[500px] mx-auto mt-[-140px]"
                style={{ display: "block" }}
              />

              
            </div>
          </div>

          {/* <p className="text-xl italic">shaves & trims</p> */}
          {/* <p className="text-sm mt-2">EST. 2024</p> */}
        </section>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-yellow-500 to-yellow-400 text-black rounded-sm shadow-xl overflow-hidden m-4">
        {/* Decorative SVG Shape at the Bottom */}
        <svg
          className="absolute bottom-0 left-0 w-full h-24 md:h-32 lg:h-40 pointer-events-none"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <polygon
            fill="#000"
            fillOpacity="0.18"
            points="0,320 0,270 200,250 400,300 700,220 900,310 1200,230 1440,280 1440,320"
          />
        </svg>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-4 relative z-10 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-2/3 text-center md:text-left">
            <h1
              className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight font-inter uppercase drop-shadow-lg"
              data-aos="fade-right"
            >
              <i>Ready to Transform</i>
              <br />
              <i>Your Look?</i>
            </h1>
            <div
              className="flex flex-col sm:flex-row gap-4 mt-6"
              data-aos="zoom-in"
            >
              {/* Book Appointment Button (Primary) */}
              <Link
                to="/appointments"
                className="group inline-flex items-center justify-center px-3 py-3 rounded-sm bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-sm shadow-lg transition-transform duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-black animate-bounce"
              >
                <CalendarIcon size={18} className="mr-2" />
                BOOK APPOINTMENT
              </Link>

              {/* View Our Work Button (Secondary) */}
              <Link
                to="/gallery"
                className="group inline-flex items-center justify-center px-3 py-3 rounded-sm bg-white text-black border border-black font-semibold text-sm shadow-lg hover:bg-black/70 hover:text-white hover:border- transition-transform duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white"
              >
                VIEW OUR WORK
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        className="w-full flex flex-col items-center bg-right text-white text-center py-10 bg-black"
        style={{ backgroundImage: `url(${sevBg})` }}
      >
        {/* Section Title */}
        <section className="py-15">
          <p className="font-inter text-[#F7BF24] text-[19px] tracking-widest mb-2">
            OUR TREATMENT
          </p>
          <h2 className="font-abril text-white text-[50px] md:text-5xl font-bold mb-10 tracking-[2px]">
            SERVICES
          </h2>
        </section>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full max-w-6xl px-4">
          {services.map((service, idx) => (
            <div
              key={idx}
              className={`
              flex flex-col items-center text-center p-8 border-2
              ${service.highlight ? "border-[#F7BF24]" : "border-[#F7BF24]"}
              rounded-none transition
              hover:shadow-lg
            `}
              style={{
                minHeight: 260,
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <img
                src={service.icon}
                alt={service.title}
                className="mb-6 h-14"
              />
              <h3 className="font-abril text-white text-lg font-bold mb-2 tracking-wider">
                {service.title}
              </h3>
              <p className="text-white text-sm">{service.desc}</p>
            </div>
          ))}
        </div>

        {/* Explore Now Button */}
        <Link to="/services" className="flex items-center">
          <button className="border-2 border-[#F7BF24] text-[#F7BF24] text-[20px] px-8 py-2 font-bold mb-30 tracking-widest hover:bg-[#F7BF24] hover:text-black transition">
            EXPLORE MORE
          </button>
        </Link>
      </section>

      {/* Counter Section */}
      <CounterEle />

      {/* CLIENTS REVIEWS Section */}
      <ClientReviews />

      {/* Gallery Preview Section */}
      <section className="relative py-24 bg-gradient-to-br from-[#181818] via-[#232323] to-[#181818] overflow-hidden border-t border-gray-400">
        {/* Top gold wave */}
        <svg
          className="absolute top-0 left-0 w-full h-24 text-[#F7BF24] opacity-20"
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,80 Q360,0 720,80 T1440,80 V100 H0 Z"
            fill="currentColor"
          />
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-abril text-white text-[50px] md:text-5xl font-bold mb-10 tracking-[2px] uppercase">
              Our Gallery
            </h2>
            <p className="font-inter text-[#F7BF24] text-[19px] tracking-widest mb-2">
              Discover the artistry and atmosphere that set us apart
            </p>
          </div>
          {/* Premium grid with layered cards and gold glow */}
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="relative group col-span-2 md:col-span-2 row-span-2 shadow-2xl rounded-3xl overflow-hidden border-2 border-[#F7BF24] bg-[#181818] hover:scale-105 hover:shadow-gold transition-all duration-500">
              <img
                src="https://img.freepik.com/free-photo/young-man-barbershop-trimming-hair_1303-26254.jpg?uid=R35513287&ga=GA1.1.189135001.1728562490&semt=ais_hybrid&w=740"
                alt="Haircut example"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition duration-300 flex items-end p-6">
                <span className="text-[#F7BF24] text-2xl font-bold font-inter drop-shadow-lg">
                  Haircut
                </span>
              </div>
            </div>
            <div className="relative group shadow-xl rounded-3xl overflow-hidden border border-[#F7BF24] bg-[#232323] hover:scale-105 hover:shadow-gold transition-all duration-500">
              <img
                src="https://plus.unsplash.com/premium_photo-1663090795087-230ce6de3765?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8QmVhcmQlMjBUcmltfGVufDB8fDB8fHww"
                alt="Beard trim example"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition duration-300 flex items-end p-6">
                <span className="text-[#F7BF24] text-xl font-bold font-inter drop-shadow-lg">
                  Beard Trim
                </span>
              </div>
            </div>
            <div className="relative group shadow-xl rounded-3xl overflow-hidden border border-[#F7BF24] bg-[#232323] hover:scale-105 hover:shadow-gold transition-all duration-500">
              <img
                src="https://img.freepik.com/free-photo/dilligent-focused-tattoo-artist-is-creating-new-tattoo-young-woman-s-hand-tatoo-studio_613910-19581.jpg?uid=R35513287&ga=GA1.1.189135001.1728562490&semt=ais_hybrid&w=740"
                alt="Tattoo example"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition duration-300 flex items-end p-6">
                <span className="text-[#F7BF24] text-xl font-bold font-inter drop-shadow-lg">
                  Tattoo
                </span>
              </div>
            </div>
            <div className="relative group shadow-xl rounded-3xl overflow-hidden border border-[#F7BF24] bg-[#232323] hover:scale-105 hover:shadow-gold transition-all duration-500">
              <img
                src="https://plus.unsplash.com/premium_photo-1661288502656-7265af3e6b23?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8aGFpciUyMFN0eWxpbmclMjBtZW58ZW58MHx8MHx8fDA%3D"
                alt="Styling example"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition duration-300 flex items-end p-6">
                <span className="text-[#F7BF24] text-xl font-bold font-inter drop-shadow-lg">
                  Styling
                </span>
              </div>
            </div>
          </div>
          <div className="mt-20 text-center">
            <Link
              to="/gallery"
              className="inline-flex items-center text-[#181818] font-bold hover:text-[#F7BF24] bg-[#F7BF24] hover:bg-[#181818] border border-[#F7BF24] px-4 py-3 rounded-md shadow-lg transition-all duration-300 uppercase tracking-widest"
            >
              View full gallery
              <ArrowRightIcon size={24} className="ml-3" />
            </Link>
          </div>
        </div>

        {/* Bottom gold wave */}
        <svg
          className="absolute bottom-0 left-0 w-full h-24 text-[#F7BF24] opacity-20"
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,20 Q360,100 720,20 T1440,20 V0 H0 Z"
            fill="currentColor"
          />
        </svg>
      </section>

      {/* Brands Section */}
      <Brands />

      {/* Blog Preview Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#181818] via-[#232323] to-[#181818] overflow-hidden">
        {/* Decorative gold wave at the top */}
        <svg
          className="absolute top-0 left-0 w-full h-16 text-[#F7BF24] opacity-10"
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,40 Q360,0 720,40 T1440,40 V80 H0 Z" fill="currentColor" />
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#F7BF24] font-abril tracking-widest drop-shadow-lg uppercase">
              Style Insights
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Latest trends and tips from our blog
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {blogPosts.map((post, idx) => (
              <div
                key={post.id}
                className={`
            group relative rounded-3xl overflow-hidden shadow-2xl bg-[#232323]
            hover:scale-105 hover:shadow-gold transition-all duration-500
            ${idx === 1 ? "md:-mt-8 md:mb-8" : ""}
          `}
              >
                <div className="h-56 w-full overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-8 flex flex-col h-full">
                  <h3 className="text-[#F7BF24] font-bold text-2xl font-inter mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-200 mb-4 flex-1">{post.excerpt}</p>
                  <span className="text-xs text-gray-400 mb-2">
                    {post.date}
                  </span>
                  <Link
                    to={`/blog/${post.id}`}
                    className="inline-flex items-center text-[#F7BF24] font-semibold hover:text-white transition-colors duration-200"
                  >
                    Read More
                    <ArrowRightIcon size={16} className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link
              to="/blog"
              className="inline-flex items-center text-[#181818] font-bold hover:text-[#F7BF24] bg-[#F7BF24] hover:bg-[#181818] border border-[#F7BF24] px-4 py-3 rounded-md shadow-lg transition-all duration-300 uppercase tracking-widest"
            >
              Read more articles
              <ArrowRightIcon size={20} className="ml-3" />
            </Link>
          </div>
        </div>
        {/* Decorative gold wave at the bottom */}
        <svg
          className="absolute bottom-0 left-0 w-full h-16 text-[#F7BF24] opacity-10"
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,40 Q360,80 720,40 T1440,40 V0 H0 Z" fill="currentColor" />
        </svg>
      </section>
    </div>
  );
};
export default HomePage;
