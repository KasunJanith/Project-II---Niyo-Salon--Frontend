import React from "react";
import sevBg from "../assets/Services/Services.png";
import barberImg from "../assets/Services/Hero.png";
import OurServ from "../components/services/OurServ";
import ServiceList from "../components/services/ServiceList";


function ServicesPage() {
  return (
    <>
      <section
        className="bg-[#232323] w-full justify-center items-center"
        style={{ backgroundImage: `url(${sevBg})` }}
      >
        <section className="py-8 flex flex-col items-center justify-center">
          <p className="font-inter text-[#F7BF24] text-[19px] tracking-widest mb-2">
            OUR TREATMENT
          </p>
          <h2 className="font-abril text-white text-[50px] md:text-5xl font-bold mb-10 tracking-[2px]">
            SERVICES
          </h2>
        </section>
        <section className="py-8">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-5 px-36">
            {/* Left Content */}
            <div className="flex-1 flex flex-col justify-center items-start">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight font-inter uppercase">
                Your Signature
                <br />
                Look Starts Here
                <br />
              </h1>
              <p className="text-white text-base md:text-lg mb-8 max-w-lg">
                At Niyo Salon, we bring together the artistry of grooming and
                the creativity of tattooing to offer a complete self-expression
                experience. Whether you're here for a flawless haircut, a
                relaxing treatment, or a bold new tattoo, our skilled
                professionals are dedicated to delivering personalized care,
                precision, and comfort — every single time.
              </p>
              <div className="flex gap-12 mt-4">
                <div>
                  <span className="text-3xl md:text-4xl font-extrabold text-[#F7BF24]">
                    99%
                  </span>
                  <div className="font-extrabold text-white text-base mt-2">
                    CUSTOMER
                    <br />
                    SATISFACTION
                  </div>
                </div>
                <div>
                  <span className="text-3xl md:text-4xl font-extrabold text-[#F7BF24]">
                    10+
                  </span>
                  <div className="font-extrabold text-white text-base mt-2">
                    YEARS OF
                    <br />
                    EXPERIENCE
                  </div>
                </div>
              </div>
            </div>
            {/* Right Image */}
            <div className="flex-1 flex justify-center items-center">
              <img
                src={barberImg}
                alt="Barber Service"
                className="w-full max-w-md h-[500px] object-cover rounded-lg shadow-3xl drop-shadow-[#F7BF24] border-[#F7BF24] border-b-1 border-r-1"
              />
            </div>
          </div>
        </section>
      </section>

      {/* Our Services Section */}
      <OurServ/>
      
      {/*Services List Section */}
      <ServiceList/>
      
    </>
  );
} 

export default ServicesPage;
