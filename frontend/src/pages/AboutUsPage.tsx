import React from 'react';
import { StarIcon, AwardIcon, UsersIcon, ClockIcon, ScissorsIcon, PaletteIcon, HeartIcon, TrendingUpIcon } from 'lucide-react';
import heroImg from '../assets/Services/Hero.png';
import salonImg from '../assets/Services/Salon-img01.jpg';
import man1 from '../assets/Home/man1.png';
import man2 from '../assets/Home/man2.png';
import man3 from '../assets/Home/man3.png';

function AboutUsPage() {
  const teamMembers = [
    {
      id: 1,
      name: 'Jamie Rodriguez',
      role: 'Master Hair Stylist & Founder',
      image: man1,
      experience: '15+ Years',
      specialization: 'Creative Cuts & Color',
      description: 'Jamie founded Niyo Salon with a vision to create a premium grooming experience that combines artistry with precision.',
      achievements: ['Celebrity Stylist', 'Award Winner', 'Industry Leader']
    },
    {
      id: 2,
      name: 'Alex Kim',
      role: 'Senior Barber & Grooming Expert',
      image: man2,
      experience: '12+ Years',
      specialization: 'Classic & Modern Cuts',
      description: 'Alex brings traditional barbering techniques combined with contemporary styling to deliver exceptional results.',
      achievements: ['Master Barber', 'Grooming Specialist', 'Trainer']
    },
    {
      id: 3,
      name: 'Taylor Morgan',
      role: 'Lead Tattoo Artist',
      image: man3,
      experience: '10+ Years',
      specialization: 'Custom Artwork & Design',
      description: 'Taylor creates stunning custom tattoos that tell your unique story through exceptional artistry and technique.',
      achievements: ['Custom Artist', 'Award Winner', 'Designer']
    }
  ];

  const values = [
    {
      icon: StarIcon,
      title: 'Excellence',
      description: 'We strive for perfection in every service, ensuring exceptional results that exceed expectations.',
      color: 'text-[#F7BF24]'
    },
    {
      icon: HeartIcon,
      title: 'Passion',
      description: 'Our love for the craft drives us to continuously innovate and perfect our artistry.',
      color: 'text-red-400'
    },
    {
      icon: UsersIcon,
      title: 'Community',
      description: 'We build lasting relationships with our clients, creating a welcoming and inclusive environment.',
      color: 'text-blue-400'
    },
    {
      icon: TrendingUpIcon,
      title: 'Innovation',
      description: 'We stay ahead of trends and continuously evolve our techniques and services.',
      color: 'text-green-400'
    }
  ];

  const milestones = [
    { year: '2024', event: 'Founded Niyo Salon', description: 'Started with a vision to revolutionize the grooming experience' },
    { year: '2024', event: 'First Location', description: 'Opened our flagship salon with state-of-the-art facilities' },
    { year: '2024', event: 'Growing Team', description: 'Assembled a team of industry-leading professionals' },
    { year: '2024', event: 'Future Vision', description: 'Expanding services and building our reputation' }
  ];

  return (
    <div className="w-full bg-[#212121] min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#212121] to-[#181818] text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_, i) => (
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start items-center gap-8 mb-8">
                <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#F7BF24]"></div>
                <div className="w-3 h-3 bg-[#F7BF24] rotate-45"></div>
                <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#F7BF24]"></div>
              </div>
              
              <p className="font-inter text-[#F7BF24] text-lg tracking-[3px] mb-4 uppercase">
                Our Story
              </p>
              <h1 className="font-abril text-white text-5xl md:text-6xl font-bold leading-tight tracking-[3px] mb-8">
                ABOUT NIYO SALON
              </h1>
              <p className="text-white/80 text-xl leading-relaxed mb-8 max-w-2xl">
                Where artistry meets precision, and every client's vision becomes reality. We are more than a salon – we are creators of confidence and masters of transformation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <button className="bg-[#F7BF24] hover:bg-yellow-400 text-black px-8 py-4 rounded-full font-bold text-sm tracking-wide transition-all duration-300 transform hover:scale-105 shadow-lg">
                  BOOK APPOINTMENT
                </button>
                <button className="bg-transparent border-2 border-[#F7BF24] text-[#F7BF24] hover:bg-[#F7BF24] hover:text-black px-8 py-4 rounded-full font-bold text-sm tracking-wide transition-all duration-300 transform hover:scale-105">
                  VIEW GALLERY
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#F7BF24] rounded-lg blur-lg opacity-20 transform rotate-3"></div>
                <img
                  src={heroImg}
                  alt="Niyo Salon Interior"
                  className="relative w-full max-w-md h-[500px] object-cover rounded-lg shadow-2xl border border-[#F7BF24]/30 transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="bg-[#181818] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-inter text-[#F7BF24] text-lg tracking-[3px] mb-4 uppercase">
              Our Purpose
            </p>
            <h2 className="font-abril text-white text-4xl md:text-5xl font-bold mb-8 tracking-[2px]">
              MISSION & VISION
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#F7BF24] to-transparent mx-auto mb-12"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="group relative bg-[#232323] p-8 rounded-lg border border-gray-600 hover:border-[#F7BF24] transition-all duration-500">
              <div className="absolute top-6 left-6">
                <div className="w-12 h-12 bg-[#F7BF24] rounded-full flex items-center justify-center">
                  <ScissorsIcon size={24} className="text-black" />
                </div>
              </div>
              <div className="pt-16">
                <h3 className="font-inter text-white text-2xl font-bold mb-4 tracking-wide group-hover:text-[#F7BF24] transition-colors duration-300">
                  Our Mission
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  To provide exceptional grooming and styling services that enhance our clients' confidence and self-expression. We combine traditional techniques with modern innovation to deliver personalized experiences that exceed expectations.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="group relative bg-[#232323] p-8 rounded-lg border border-gray-600 hover:border-[#F7BF24] transition-all duration-500">
              <div className="absolute top-6 left-6">
                <div className="w-12 h-12 bg-[#F7BF24] rounded-full flex items-center justify-center">
                  <PaletteIcon size={24} className="text-black" />
                </div>
              </div>
              <div className="pt-16">
                <h3 className="font-inter text-white text-2xl font-bold mb-4 tracking-wide group-hover:text-[#F7BF24] transition-colors duration-300">
                  Our Vision
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  To be the premier destination for premium grooming and artistic services, setting new standards in the industry while fostering a community of creativity, excellence, and personal transformation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-[#212121] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-inter text-[#F7BF24] text-lg tracking-[3px] mb-4 uppercase">
              What Drives Us
            </p>
            <h2 className="font-abril text-white text-4xl md:text-5xl font-bold mb-8 tracking-[2px]">
              OUR VALUES
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#F7BF24] to-transparent mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group text-center p-6 bg-[#232323] rounded-lg border border-gray-600 hover:border-[#F7BF24] transition-all duration-500 transform hover:scale-105"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-[#F7BF24]/10 rounded-full flex items-center justify-center group-hover:bg-[#F7BF24]/20 transition-colors duration-300">
                    <value.icon size={32} className={`${value.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                </div>
                <h3 className="font-inter text-white text-xl font-bold mb-4 group-hover:text-[#F7BF24] transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-[#181818] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-inter text-[#F7BF24] text-lg tracking-[3px] mb-4 uppercase">
              Meet The Experts
            </p>
            <h2 className="font-abril text-white text-4xl md:text-5xl font-bold mb-8 tracking-[2px]">
              OUR TEAM
            </h2>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto mb-8">
              Our talented professionals bring years of experience and passion to every service
            </p>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#F7BF24] to-transparent mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                className="group relative bg-[#232323] rounded-lg overflow-hidden border border-gray-600 hover:border-[#F7BF24] transition-all duration-500 transform hover:scale-105"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-inter text-white text-xl font-bold mb-2 group-hover:text-[#F7BF24] transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-[#F7BF24] font-semibold mb-2">
                    {member.role}
                  </p>
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <ClockIcon size={14} />
                      {member.experience}
                    </div>
                    <div className="flex items-center gap-1">
                      <AwardIcon size={14} />
                      Expert
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {member.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {member.achievements.map((achievement, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-[#F7BF24]/20 text-[#F7BF24] px-2 py-1 rounded-full"
                      >
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover Effect Line */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#F7BF24] to-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="bg-[#232323] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-inter text-[#F7BF24] text-lg tracking-[3px] mb-4 uppercase">
              Our Journey
            </p>
            <h2 className="font-abril text-white text-4xl md:text-5xl font-bold mb-8 tracking-[2px]">
              MILESTONES
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#F7BF24] to-transparent mx-auto"></div>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#F7BF24] to-yellow-400"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="group bg-[#212121] p-6 rounded-lg border border-gray-600 hover:border-[#F7BF24] transition-all duration-500">
                      <div className="text-[#F7BF24] font-bold text-xl mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-white font-inter font-bold text-lg mb-2 group-hover:text-[#F7BF24] transition-colors duration-300">
                        {milestone.event}
                      </h3>
                      <p className="text-gray-300">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="relative flex items-center justify-center w-8 h-8 bg-[#F7BF24] rounded-full border-4 border-[#232323] z-10">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  </div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#181818] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="group">
              <div className="text-5xl font-bold text-[#F7BF24] mb-2 group-hover:scale-110 transition-transform duration-300">
                2000+
              </div>
              <div className="text-white font-semibold text-lg mb-1">Happy Clients</div>
              <div className="text-gray-400">Served This Year</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold text-[#F7BF24] mb-2 group-hover:scale-110 transition-transform duration-300">
                15+
              </div>
              <div className="text-white font-semibold text-lg mb-1">Services Offered</div>
              <div className="text-gray-400">Premium Quality</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold text-[#F7BF24] mb-2 group-hover:scale-110 transition-transform duration-300">
                99%
              </div>
              <div className="text-white font-semibold text-lg mb-1">Satisfaction Rate</div>
              <div className="text-gray-400">Client Reviews</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold text-[#F7BF24] mb-2 group-hover:scale-110 transition-transform duration-300">
                5★
              </div>
              <div className="text-white font-semibold text-lg mb-1">Average Rating</div>
              <div className="text-gray-400">Google Reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#212121] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-abril text-white text-4xl md:text-5xl font-bold mb-6 tracking-[2px]">
            READY TO TRANSFORM?
          </h2>
          <p className="text-gray-300 text-xl mb-12 max-w-2xl mx-auto">
            Join thousands of satisfied clients who trust us with their style. Book your appointment today and experience the Niyo difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-[#F7BF24] hover:bg-yellow-400 text-black px-10 py-4 rounded-full font-bold text-lg tracking-wide transition-all duration-300 transform hover:scale-105 shadow-xl">
              BOOK NOW
            </button>
            <button className="bg-transparent border-2 border-[#F7BF24] text-[#F7BF24] hover:bg-[#F7BF24] hover:text-black px-10 py-4 rounded-full font-bold text-lg tracking-wide transition-all duration-300 transform hover:scale-105">
              CONTACT US
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUsPage;