import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Cloud, CloudLightning, CloudRain } from "lucide-react";
import { motion } from "motion/react";

export default function ClimateClock() {
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Target date for 1.5C (approximate based on current carbon budget estimates)
  const targetDate = new Date("2029-07-22T00:00:00Z").getTime();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        years: Math.floor(distance / (1000 * 60 * 60 * 24 * 365.25)),
        days: Math.floor((distance % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const getCloudIcon = (className: string) => {
    if (location.pathname === "/air-quality") return <Cloud className={className} />;
    if (location.pathname === "/climate-water") return <CloudLightning className={className} />;
    return <Cloud className={className} />;
  };

  return (
    <div className="relative overflow-hidden flex items-center gap-4 px-5 py-2 bg-surface-container-lowest rounded-full border border-outline-variant/30 shadow-sm w-fit">
      {/* Horizontal Moving Clouds */}
      <motion.div
        animate={{ x: ["-100%", "1000%"] }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-0"
      >
        {getCloudIcon("w-6 h-6 text-outline/20")}
      </motion.div>
      <motion.div
        animate={{ x: ["-100%", "1000%"] }}
        transition={{ repeat: Infinity, duration: 35, ease: "linear", delay: 5 }}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-0"
      >
        {getCloudIcon("w-8 h-8 text-outline/10")}
      </motion.div>

      <div className="z-10 flex items-center gap-3">
        <span className="text-[10px] font-bold tracking-widest text-error uppercase whitespace-nowrap">1.5°C Limit:</span>
        <div className="flex items-center gap-1.5 font-mono text-sm font-black text-on-surface">
          <span>{timeLeft.years}y</span>
          <span className="text-outline-variant">:</span>
          <span>{timeLeft.days.toString().padStart(3, '0')}d</span>
          <span className="text-outline-variant">:</span>
          <span>{timeLeft.hours.toString().padStart(2, '0')}h</span>
          <span className="text-outline-variant">:</span>
          <span>{timeLeft.minutes.toString().padStart(2, '0')}m</span>
          <span className="text-outline-variant">:</span>
          <span className="text-error">{timeLeft.seconds.toString().padStart(2, '0')}s</span>
        </div>
      </div>
    </div>
  );
}
