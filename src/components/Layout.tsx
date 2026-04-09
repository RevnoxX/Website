import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Globe, Settings, Moon, Sun, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import MouseTrail from "./MouseTrail";
import FallingParticles from "./FallingParticles";
import ClimateClock from "./ClimateClock";
import TimeSelector from "./TimeSelector";
import { motion, AnimatePresence } from "motion/react";

export default function Layout() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(true); // Default to dark mode
  const [timeRange, setTimeRange] = useState("7 Days");
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-air", "theme-water");
    
    if (location.pathname === "/air-quality") {
      root.classList.add("theme-air");
    } else if (location.pathname === "/climate-water") {
      root.classList.add("theme-water");
    }
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const navItems = [
    { name: "Overview", path: "/" },
    { name: "Air Quality", path: "/air-quality" },
    { name: "Climate & Water", path: "/climate-water" },
  ];

  return (
    <div className="min-h-screen bg-background text-on-background transition-colors duration-500 relative">
      <FallingParticles />
      <MouseTrail />
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto relative">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-bold tracking-tight text-primary font-headline">EcoStats Dashboard</span>
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "font-headline text-sm font-semibold tracking-tight transition-all duration-300 pb-1 border-b-2",
                      isActive
                        ? "text-primary border-primary"
                        : "text-on-surface-variant border-transparent hover:text-primary"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Centered Climate Clock */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block scale-110">
            <ClimateClock />
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Slider */}
            <div 
              className="relative flex items-center bg-surface-container-high rounded-full p-1 cursor-pointer w-16 h-8 shadow-inner"
              onClick={() => setIsDark(!isDark)}
            >
              <motion.div 
                className="absolute w-7 h-7 bg-primary rounded-full shadow-md z-10"
                animate={{ left: isDark ? "calc(100% - 32px)" : "4px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
              <div className="w-full flex justify-between px-1.5 z-20 pointer-events-none">
                <Sun className={cn("w-4 h-4 transition-colors", isDark ? "text-outline" : "text-on-primary")} />
                <Moon className={cn("w-4 h-4 transition-colors", isDark ? "text-on-primary" : "text-outline")} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-8 py-10 flex flex-col gap-12 relative z-10">
        {/* Mobile Climate Clock (shows only on small screens since it's in nav on large) */}
        <div className="flex justify-center lg:hidden w-full">
          <ClimateClock />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full flex flex-col gap-12"
          >
            <Outlet context={{ timeRange, setTimeRange, customDate, setCustomDate }} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-outline-variant/20 px-6 py-3 flex justify-around items-center z-50">
        <button className="flex flex-col items-center gap-1 text-primary">
          <LayoutDashboard className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-bold">Metrics</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-bold">Trends</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <Globe className="w-5 h-5" />
          <span className="text-[10px] font-bold">Global</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-bold">Config</span>
        </button>
      </nav>
    </div>
  );
}
