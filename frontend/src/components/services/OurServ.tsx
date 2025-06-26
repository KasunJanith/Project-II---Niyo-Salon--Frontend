import React from "react";
import haircutIcon from "../../assets/Services/Hair-icon01.png";
import shavingIcon from "../../assets/Services/Hair-icon04.png";
import beardIcon from "../../assets/Services/Hair-icon06.png";
import tattoo from "../../assets/Services/Tattoo.png";
import serviceImg from "../../assets/Services/Salon-img01.jpg";

function OurServ() {
  const services = [
    { icon: haircutIcon, label: "Hair Cut" },
    { icon: shavingIcon, label: "Shaving" },
    { icon: beardIcon, label: "Beard Trim" },
    { icon: tattoo, label: "Tattoos" },
    { icon: tattoo, label: "Tattoos" },
  ];

  return (
    <section className="bg-[#181818] min-h-screen py-20 px-0 flex flex-col items-center border-y border-gray-400">
      <h2 className="text-3xl md:text-4xl font-extrabold font-inter text-center mb-2 text-white tracking-wide">
        Barbershop Services
      </h2>
      <p className="text-center text-base max-w-xl mx-auto mb-10 text-gray-300">
        Sample text. Click to select the text box. Click again or double click
        to start editing the text.
      </p>
      <div className="flex flex-col md:flex-row gap-10 w-full max-w-6xl items-center justify-center">
        {/* Left Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={serviceImg}
            alt="Barbershop Service"
            className="rounded-sm shadow-lg object-cover w-full max-w-md h-[560px]"
          />
        </div>
        {/* Right Services Grid */}
        <div className="w-full md:w-1/2 grid grid-cols-2 gap-6">
          {services.map((s, i) => (
            <div
              key={i}
              className="bg-[#F7BF24] rounded-md flex flex-col items-center justify-center aspect-square shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
              data-aos="fade-left"
            >
              <img src={s.icon} alt={s.label} className="w-24 h-24 mb-4" />
              <span className="text-black text-xl font-bold font-inter">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OurServ;
