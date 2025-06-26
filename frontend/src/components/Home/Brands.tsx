import React from "react";

import brand2 from "../../assets/Home/brand1.png";
import brand1 from "../../assets/Home/brand2.png";
import brand3 from "../../assets/Home/brand3.png";
import brand4 from "../../assets/Home/brand4.png";
import brand5 from "../../assets/Home/brand5.png";
import brand6 from "../../assets/Home/brand6.png";

const brands = [brand1, brand2, brand3, brand4, brand5, brand6];

function Brands() {
  return (
    <section className="w-full bg-[#232323] py-20 px-4 flex justify-center items-center">
      <div className="w-full max-w-7xl flex flex-col md:flex-row items-stretch">
        {/* Left: Title and Description */}
        <div className="md:w-1/2 flex flex-col justify-center pr-0 md:pr-16">
          <h2 className="font-abril text-white text-[50px] md:text-5xl font-bold mb-10 tracking-[2px] uppercase">
            BRANDS WE CARRY
          </h2>
          <p className="text-white md:text-xl max-w-lg">
            At Niyo Salon, we’re committed to quality in every service we offer
            — from styling to skin, and ink to care. That’s why we partner with
            top-tier brands trusted by beauty and tattoo professionals alike.
            Our curated collection includes premium haircare, skincare, and
            tattoo aftercare products, ensuring that you enjoy salon-level and
            studio-grade results even after your visit. Every product we carry
            is selected for its performance, safety, and ability to help you
            look and feel your best.
          </p>
        </div>
        {/* Divider */}
        <div
          className="hidden md:block w-px bg-[#E6C87A] mx-10"
          style={{ minHeight: 350 }}
        ></div>
        {/* Right: Brands Grid */}
        <div className="md:w-1/2 flex items-center justify-center">
          <div className="grid grid-cols-3 grid-rows-2 gap-8">
            {brands.map((img, idx) => (
              <div key={idx} className="flex items-center justify-center">
                <img
                  src={img}
                  alt={`Brand ${idx + 1}`}
                  className="w-64 h-48 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Brands;
