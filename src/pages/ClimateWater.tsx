import React, { useState, useEffect } from "react";
import { Droplets, Sprout, Waves, Sun, Info, Search, AlertTriangle } from "lucide-react";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from "recharts";
import { useOutletContext } from "react-router-dom";
import TimeSelector from "../components/TimeSelector";

interface ClimateData {
  precipitation: number;
  soilMoisture: number;
  waveHeight: number;
  wavePeriod: number;
  uvIndex: number;
}

interface WeatherAlert {
  severity: "Warning" | "Watch" | "Advisory";
  description: string;
}

export default function ClimateWater() {
  const [data, setData] = useState<ClimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationName, setLocationName] = useState("Berlin");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const { timeRange, setTimeRange, customDate, setCustomDate } = useOutletContext<{
    timeRange: string, 
    setTimeRange: (val: string) => void, 
    customDate: string, 
    setCustomDate: (val: string) => void
  }>();

  // Mock data for the chart (Monthly Rainfall vs Average Temperature)
  const chartData = [
    { month: "Jan", rainfall: 78, temperature: 5 },
    { month: "Feb", rainfall: 65, temperature: 6 },
    { month: "Mar", rainfall: 55, temperature: 9 },
    { month: "Apr", rainfall: 45, temperature: 13 },
    { month: "May", rainfall: 50, temperature: 17 },
    { month: "Jun", rainfall: 40, temperature: 20 },
    { month: "Jul", rainfall: 35, temperature: 23 },
    { month: "Aug", rainfall: 40, temperature: 22 },
    { month: "Sep", rainfall: 55, temperature: 19 },
    { month: "Oct", rainfall: 70, temperature: 14 },
    { month: "Nov", rainfall: 85, temperature: 9 },
    { month: "Dec", rainfall: 90, temperature: 6 },
  ];

  const fetchWeatherData = async (city: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Geocode
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
      if (!geoRes.ok) throw new Error("Failed to connect to geocoding service");
      const geoData = await geoRes.json();
      
      let lat = 52.52;
      let lon = 13.41;
      
      if (geoData.results && geoData.results.length > 0) {
        lat = geoData.results[0].latitude;
        lon = geoData.results[0].longitude;
        setLocationName(geoData.results[0].name);
      } else {
        throw new Error(`Location "${city}" not found`);
      }

      // 2. Fetch weather
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation,soil_moisture_0_to_7cm,uv_index,temperature_2m`);
      if (!weatherRes.ok) throw new Error("Failed to fetch weather data");
      const weatherData = await weatherRes.json();

      // 3. Fetch marine
      let waveHeight = 0;
      let wavePeriod = 0;
      try {
        const marineRes = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_period_max`);
        if (marineRes.ok) {
          const marineData = await marineRes.json();
          if (marineData.current?.wave_height) waveHeight = marineData.current.wave_height;
          if (marineData.current?.wave_period_max) wavePeriod = marineData.current.wave_period_max;
        }
      } catch (e) {
        // Ignore marine error for inland cities
      }

      const precip = weatherData.current.precipitation || 0;
      const uv = weatherData.current.uv_index || 0;

      setData({
        precipitation: precip,
        soilMoisture: weatherData.current.soil_moisture_0_to_7cm || 0,
        waveHeight: waveHeight,
        wavePeriod: wavePeriod,
        uvIndex: uv,
      });

      // Mock Alerts based on data
      const newAlerts: WeatherAlert[] = [];
      if (precip > 10) newAlerts.push({ severity: "Warning", description: "Heavy rainfall expected in the area." });
      if (uv > 8) newAlerts.push({ severity: "Advisory", description: "High UV Index. Sun protection recommended." });
      if (waveHeight > 3) newAlerts.push({ severity: "Watch", description: "High surf advisory in effect." });
      setAlerts(newAlerts);

    } catch (error: any) {
      console.error("Failed to fetch weather data", error);
      setErrorMsg(error.message || "An error occurred while fetching data.");
      // Retain last known good data (do not overwrite `data` with mock if we already have some)
      if (!data) {
        setData({
          precipitation: 0,
          soilMoisture: 0,
          waveHeight: 0,
          wavePeriod: 0,
          uvIndex: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(locationName);
  }, [timeRange, customDate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeatherData(searchQuery.trim());
    }
  };

  const metrics = [
    { title: "Average Precipitation", value: data?.precipitation ?? 0, unit: "mm", icon: Droplets },
    { title: "Soil Moisture", value: data?.soilMoisture ?? 0, unit: "m³/m³", icon: Sprout },
    { title: "Wave Height / Period", value: `${data?.waveHeight?.toFixed(1) ?? 0}m / ${data?.wavePeriod?.toFixed(1) ?? 0}s`, unit: "", icon: Waves },
    { title: "UV Index", value: data?.uvIndex ?? 0, unit: "", icon: Sun },
  ];

  return (
    <>
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Meteorological & Hydrological Data</h1>
          <p className="text-on-surface-variant font-medium">Current data for {locationName}</p>
        </div>
        <div className="flex flex-col md:flex-row items-end gap-4">
          <form onSubmit={handleSearch} className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
            <input
              type="text"
              placeholder="Search Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border-none rounded-full shadow-sm focus:ring-2 focus:ring-primary text-on-surface text-sm"
            />
          </form>
          <TimeSelector timeRange={timeRange} setTimeRange={setTimeRange} customDate={customDate} setCustomDate={setCustomDate} />
        </div>
      </section>

      {errorMsg && (
        <div className="bg-error-container text-error p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5" />
          <p className="font-medium text-sm">{errorMsg}</p>
        </div>
      )}

      {alerts.length > 0 && (
        <section className="flex flex-col gap-3">
          {alerts.map((alert, idx) => (
            <div key={idx} className="bg-surface-container-lowest border border-error/30 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <Info className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-error text-sm uppercase tracking-wider">{alert.severity}</h4>
                <p className="text-on-surface text-sm mt-1">{alert.description}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest p-8 rounded-xl shadow-sm h-48 animate-pulse">
              <div className="w-12 h-12 bg-surface-container-low rounded-lg mb-4"></div>
              <div className="h-4 bg-surface-container-low w-1/2 mb-2 rounded"></div>
              <div className="h-8 bg-surface-container-low w-3/4 rounded"></div>
            </div>
          ))
        ) : (
          metrics.map((m, i) => (
            <div key={i} className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(25,28,29,0.04)] flex flex-col justify-between min-h-[200px] hover:scale-105 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center">
                  <m.icon className="text-primary w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-label-md text-outline uppercase tracking-widest font-bold text-xs mb-1">
                  {m.title}
                </p>
                <h3 className="text-4xl font-black text-primary tracking-tighter">
                  {typeof m.value === 'number' ? m.value.toFixed(2) : m.value} <span className="text-base font-medium text-on-surface-variant tracking-normal">{m.unit}</span>
                </h3>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(25,28,29,0.04)]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h4 className="text-xl font-bold text-primary">Monthly Rainfall vs. Average Temperature</h4>
            <p className="text-sm text-on-surface-variant">Current year hydrological cycle</p>
          </div>
          <button className="p-2 text-outline hover:text-primary transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-container-high)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-outline)', fontSize: 12 }} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-outline)', fontSize: 12 }} dx={-10} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-outline)', fontSize: 12 }} dx={10} />
              <Tooltip
                cursor={{ fill: 'var(--color-surface-container-low)' }}
                contentStyle={{ backgroundColor: 'var(--color-surface-container-lowest)', color: 'var(--color-on-surface)', borderRadius: '12px', border: '1px solid var(--color-outline-variant)', boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: 'var(--color-primary)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar yAxisId="left" dataKey="rainfall" name="Rainfall (mm)" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} barSize={30} />
              <Line yAxisId="right" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-primary)' }} activeDot={{ r: 6 }} />
              <Brush 
                dataKey="month" 
                height={30} 
                stroke="var(--color-primary)" 
                fill="var(--color-surface-container-low)" 
                tickFormatter={() => ''} 
                travellerWidth={10}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-on-surface-variant text-center mt-4 flex items-center justify-center gap-2">
          <Info className="w-3 h-3" />
          Drag the handles on the timeline above to zoom in, or click and drag the center to pan across months.
        </p>
      </section>
    </>
  );
}
