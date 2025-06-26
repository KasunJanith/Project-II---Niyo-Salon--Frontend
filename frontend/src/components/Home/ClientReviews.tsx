import React, { useState, useEffect } from "react";

// Import your avatar images
import avatar1 from "../../assets/Home/man1.png";
import avatar2 from "../../assets/Home/man2.png";
import avatar3 from "../../assets/Home/man3.png";

const reviews = [
  {
    name: "ALEX JOHNSON, Regular Customer",
    text: "Niyo Salon has been my go-to place for haircuts for over a year now. The staff is professional and the results are always amazing!",
    avatar: avatar1,
  },
  {
    name: "JAMIE SMITH, First-time Client",
    text: "I was nervous about getting my first tattoo, but the artists at Niyo made me feel comfortable and delivered exactly what I wanted.",
    avatar: avatar2,
  },
  {
    name: "TAYLAR MORGAN, Monthly Visitor",
    text: "The beard grooming service is top-notch. I always leave looking sharp and feeling confident",
    avatar: avatar3,
  },
];

function ClientReviews() {
  const [index, setIndex] = useState(0);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full py-16 bg-[#232323] flex flex-col items-center">
      <p className="text-[#F7BF24] text-2xl mb-2 font-inter tracking-widest">
        WHAT PEOPLE SAY ABOUT US
      </p>
      <h2 className="font-abril text-white text-5xl font-bold mb-12 tracking-[2px]">
        CLIENTS REVIEWS
      </h2>
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((review, i) => (
          <div
            key={i}
            className={`flex flex-col items-center transition-all duration-700 ${
              i === index
                ? "opacity-100 scale-105 bg-[#181818] shadow-xl border border-[#F7BF24]"
                : "opacity-40"
            } rounded-xl p-8`}
          >
            <img
              src={review.avatar}
              alt={review.name}
              className="w-28 h-28 rounded-full object-cover shadow-lg mb-6 border border-[#F7BF24] bg-[#232323]"
            />
            <p className="text-[#F7BF24] text-lg mb-6 text-center font-normal">
              "{review.text}"
            </p>
            <p className="text-white text-xl font-bold font-inter text-center tracking-wide">
              {review.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ClientReviews;
