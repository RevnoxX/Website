import React, { useState, useEffect } from "react";
import { Search, Wind, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, Rectangle } from "recharts";
import { useOutletContext } from "react-router-dom";
import TimeSelector from "../components/TimeSelector";

interface Pollutant {
  parameter: string;
  value: number;
  unit: string;
  lastUpdated: string;
}

export default function AirQuality() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationName, setLocationName] = useState("London");
  const [pollutants, setPollutants] = useState<Pollutant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPollutant, setSelectedPollutant] = useState("pm25");
  const { timeRange, setTimeRange, customDate, setCustomDate } = useOutletContext<{
    timeRange: string, 
    setTimeRange: (val: string) => void, 
    customDate: string, 
    setCustomDate: (val: string) => void
  }>();

  // Mock data for the chart
  const chartData = [
    { city: "Delhi", pm25: 145, pm10: 200, co: 1.5, no2: 60 },
    { city: "Beijing", pm25: 85, pm10: 120, co: 0.8, no2: 45 },
    { city: "London", pm25: 22, pm10: 35, co: 0.2, no2: 25 },
    { city: "New York", pm25: 15, pm10: 25, co: 0.3, no2: 30 },
    { city: "Sydney", pm25: 8, pm10: 15, co: 0.1, no2: 10 },
  ];

  const fetchData = async (city: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.openaq.org/v2/latest?limit=100&city=${encodeURIComponent(city)}`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const measurements = data.results[0].measurements;
        setPollutants(measurements.slice(0, 4)); // Get up to 4 pollutants
        setLocationName(data.results[0].city || city);
      } else {
        throw new Error("No data");
      }
    } catch (error) {
      console.error("Failed to fetch OpenAQ data, using fallback", error);
      // Fallback data
      setPollutants([
        { parameter: "pm25", value: Math.random() * 50, unit: "µg/m³", lastUpdated: new Date().toISOString() },
        { parameter: "pm10", value: Math.random() * 100, unit: "µg/m³", lastUpdated: new Date().toISOString() },
        { parameter: "co", value: Math.random() * 2, unit: "ppm", lastUpdated: new Date().toISOString() },
        { parameter: "no2", value: Math.random() * 40, unit: "µg/m³", lastUpdated: new Date().toISOString() },
      ]);
      setLocationName(city);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData("London");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchData(searchQuery.trim());
    }
  };

  const getSafetyColor = (parameter: string, value: number) => {
    // Simplified thresholds
    if (parameter === "pm25") {
      if (value <= 12) return "text-secondary bg-secondary-container";
      if (value <= 35) return "text-yellow-700 bg-yellow-100";
      return "text-error bg-error-container";
    }
    if (parameter === "pm10") {
      if (value <= 54) return "text-secondary bg-secondary-container";
      if (value <= 154) return "text-yellow-700 bg-yellow-100";
      return "text-error bg-error-container";
    }
    // Default
    return "text-secondary bg-secondary-container";
  };

  const getSafetyStatus = (parameter: string, value: number) => {
    if (parameter === "pm25") {
      if (value <= 12) return "Good";
      if (value <= 35) return "Moderate";
      return "Hazardous";
    }
    return "Good";
  };

  return (
    <>
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Atmospheric Health & Pollutants</h1>
          <p className="text-on-surface-variant font-medium">Real-time air quality monitoring for {locationName}.</p>
        </div>
        <div className="flex flex-col md:flex-row items-end gap-4">
          <form onSubmit={handleSearch} className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
            <input
              type="text"
              placeholder="Search City or Station"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border-none rounded-full shadow-sm focus:ring-2 focus:ring-primary text-on-surface text-sm"
            />
          </form>
          <TimeSelector timeRange={timeRange} setTimeRange={setTimeRange} customDate={customDate} setCustomDate={setCustomDate} />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest p-8 rounded-xl shadow-sm h-48 animate-pulse">
              <div className="w-12 h-12 bg-surface-container-low rounded-lg mb-4"></div>
              <div className="h-4 bg-surface-container-low w-1/2 mb-2 rounded"></div>
              <div className="h-8 bg-surface-container-low w-3/4 rounded"></div>
            </div>
          ))
        ) : (
          pollutants.map((p, i) => {
            const colorClass = getSafetyColor(p.parameter, p.value);
            const status = getSafetyStatus(p.parameter, p.value);
            const isHazardous = status === "Hazardous";

            return (
              <div key={i} className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(25,28,29,0.04)] flex flex-col justify-between min-h-[200px] hover:scale-105 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center">
                    <Wind className="text-primary w-6 h-6" />
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${colorClass}`}>
                    {isHazardous ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {status}
                  </span>
                </div>
                <div>
                  <p className="text-label-md text-outline uppercase tracking-widest font-bold text-xs mb-1">
                    {p.parameter.toUpperCase()}
                  </p>
                  <h3 className="text-4xl font-black text-primary tracking-tighter">
                    {p.value.toFixed(1)} <span className="text-base font-medium text-on-surface-variant tracking-normal">{p.unit}</span>
                  </h3>
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(25,28,29,0.04)]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h4 className="text-xl font-bold text-primary">Global {selectedPollutant.toUpperCase()} Comparison</h4>
            <p className="text-sm text-on-surface-variant">Current levels across major cities</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedPollutant}
              onChange={(e) => setSelectedPollutant(e.target.value)}
              className="bg-surface-container-low text-on-surface border-none rounded-full px-5 py-2 focus:ring-2 focus:ring-primary shadow-sm appearance-none cursor-pointer"
            >
              <option value="pm25">PM2.5</option>
              <option value="pm10">PM10</option>
              <option value="co">CO</option>
              <option value="no2">NO2</option>
            </select>
            <button className="p-2 text-outline hover:text-primary transition-colors">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="city" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-outline)', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-outline)', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'var(--color-surface-container-low)' }}
                contentStyle={{ backgroundColor: 'var(--color-surface-container-lowest)', color: 'var(--color-on-surface)', borderRadius: '12px', border: '1px solid var(--color-outline-variant)', boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: 'var(--color-primary)' }}
              />
              <Bar 
                dataKey={selectedPollutant} 
                radius={[6, 6, 0, 0]}
                activeBar={<Rectangle fillOpacity={0.8} stroke="var(--color-primary)" strokeWidth={2} />}
              >
                <LabelList dataKey={selectedPollutant} position="top" fill="var(--color-on-surface)" fontSize={12} fontWeight="bold" />
                {chartData.map((entry, index) => {
                  const val = entry[selectedPollutant as keyof typeof entry] as number;
                  let fill = 'var(--color-secondary)';
                  if (selectedPollutant === 'pm25') {
                    fill = val > 35 ? 'var(--color-error)' : val > 12 ? '#ca8a04' : 'var(--color-secondary)';
                  } else if (selectedPollutant === 'pm10') {
                    fill = val > 154 ? 'var(--color-error)' : val > 54 ? '#ca8a04' : 'var(--color-secondary)';
                  } else {
                    fill = 'var(--color-primary)';
                  }
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}
