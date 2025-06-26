import React, { useEffect, useRef, useState } from "react";
import razor from "../../assets/Home/icon razor (3).svg";
import scissor from "../../assets/Home/icon scissors (1).svg";
import shop from "../../assets/Home/icon barbershop.svg";
import tattoo from "../../assets/Home/Tattoo.png";

const counters = [
  { icon: scissor, value: 4500, label: "HAIRCUTS" },
  { icon: tattoo, value: 2500, label: "TATOOS" },
  { icon: razor, value: 2500, label: "SHAVES" },
  { icon: shop, value: 23, label: "OPEN SHOPS" },
];

// Animated count-up hook
function useCountUp(to: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    function step(timestamp: number) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * to));
      if (progress < 1) {
        raf.current = requestAnimationFrame(step);
      } else {
        setCount(to);
      }
    }
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [to, duration]);

  return count;
}

function CounterEle() {
  // Each counter gets its own animated value
  const animatedValues = counters.map((item) => useCountUp(item.value, 1500));

  return (
    <div className="pb-16 py-20">
      <div className="w-full bg-[#232323] py-16 border-y border-gray-400">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {counters.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <img src={item.icon} alt={item.label} className="h-20 mb-6" />
              <div className="text-[#F7BF24] font-extrabold text-7xl md:text-7xl mb-2 font-abril">
                {animatedValues[idx]}
              </div>
              <div className="font-abril text-white text-lg md:text-xl tracking-wider font-bold uppercase">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CounterEle;
