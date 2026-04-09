import { useState, useEffect } from "react";
import { motion } from "motion/react";

interface TimeSelectorProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  customDate: string;
  setCustomDate: (date: string) => void;
}

export default function TimeSelector({ timeRange, setTimeRange, customDate, setCustomDate }: TimeSelectorProps) {
  const timeRanges = ["24 Hours", "7 Days", "30 Days", "Custom"];
  const today = new Date().toISOString().split('T')[0];
  const minDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];

  return (
    <div className="flex bg-surface-container-high p-1 rounded-full gap-1 relative items-center">
      {timeRanges.map((range) => (
        <button
          key={range}
          onClick={() => setTimeRange(range)}
          className={`relative px-6 py-2 rounded-full text-sm transition-all z-10 ${
            timeRange === range
              ? "font-bold text-on-secondary-container"
              : "font-semibold text-on-surface-variant hover:text-on-surface"
          }`}
        >
          {timeRange === range && (
            <motion.div
              layoutId="timeRangeIndicator"
              className="absolute inset-0 bg-secondary-container rounded-full -z-10 shadow-sm"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          {range}
        </button>
      ))}
      {timeRange === "Custom" && (
        <motion.input
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          type="date"
          max={today}
          min={minDate}
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          className="ml-2 px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface text-sm border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm"
        />
      )}
    </div>
  );
}
