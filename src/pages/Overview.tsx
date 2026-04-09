import { useState, useEffect } from "react";
import { Wind, Thermometer, Trees, Sun, ArrowRight, Lightbulb, Zap, Recycle, CheckCircle, AlertTriangle, Car, Home } from "lucide-react";
import { motion } from "motion/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell, Sector, Legend } from "recharts";
import { useOutletContext } from "react-router-dom";
import TimeSelector from "../components/TimeSelector";

export default function Overview() {
  const { timeRange, setTimeRange, customDate, setCustomDate } = useOutletContext<{
    timeRange: string, 
    setTimeRange: (val: string) => void, 
    customDate: string, 
    setCustomDate: (val: string) => void
  }>();

  // Carbon Footprint State
  const [travelKm, setTravelKm] = useState(150);
  const [energyKwh, setEnergyKwh] = useState(300);
  const carbonFootprint = (travelKm * 0.12) + (energyKwh * 0.82); // kg CO2

  // Dynamic Data based on Time Range
  const getDynamicData = () => {
    switch(timeRange) {
      case "24 Hours": return { aqi: 35, aqiTrend: -1.2, co2: 418, co2Trend: +0.1, temp: "+1.14", forest: 0.01 };
      case "30 Days": return { aqi: 45, aqiTrend: +2.5, co2: 420, co2Trend: +1.2, temp: "+1.16", forest: 0.3 };
      case "Custom": return { aqi: 38, aqiTrend: -0.5, co2: 419, co2Trend: +0.5, temp: "+1.15", forest: 1.2 };
      default: return { aqi: 42, aqiTrend: -4.2, co2: 419, co2Trend: +0.8, temp: "+1.15", forest: 3.75 }; // 7 Days
    }
  };
  const data = getDynamicData();

  // Historical Temp Data
  const [tempData, setTempData] = useState<{year: string, temp: number}[]>([]);
  useEffect(() => {
    // Mocking historical data for the chart to look like the SVG but interactive
    setTempData([
      { year: "2018", temp: 0.85 },
      { year: "2019", temp: 0.98 },
      { year: "2020", temp: 1.02 },
      { year: "2021", temp: 0.84 },
      { year: "2022", temp: 0.89 },
      { year: "2023", temp: 1.15 },
    ]);
  }, []);

  return (
    <>
      {/* Header & Time Controls */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Intelligence Overview</h1>
          <p className="text-on-surface-variant font-medium">Real-time ecological metrics from the Living Archive.</p>
        </div>
        <div className="flex justify-end w-full md:w-auto">
           <TimeSelector timeRange={timeRange} setTimeRange={setTimeRange} customDate={customDate} setCustomDate={setCustomDate} />
        </div>
      </section>

      {/* Vital Signs (4 Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* AQI Card */}
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(25,28,29,0.04)] flex flex-col justify-between min-h-[220px] group transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(27,67,50,0.2)]">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center">
              <Wind className="text-primary w-6 h-6" />
            </div>
            <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${data.aqiTrend < 0 ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
              {data.aqiTrend < 0 ? <TrendingDownIcon /> : <TrendingUpIcon />} {Math.abs(data.aqiTrend)}%
            </span>
          </div>
          <div>
            <p className="text-label-md text-outline uppercase tracking-widest font-bold text-xs mb-1">AIR QUALITY INDEX</p>
            <h3 className="text-4xl font-black text-primary tracking-tighter">{data.aqi} <span className="text-base font-medium text-on-surface-variant tracking-normal">AQI</span></h3>
          </div>
          <div className="h-8 flex items-end gap-1 overflow-hidden transition-all duration-300">
            {[1, 2, 3, 4, 5].map((i) => {
              const fillThreshold = (i / 5) * 100;
              const isFilled = (data.aqi / 100) * 100 >= fillThreshold - 10; // rough mapping
              return (
                <div key={i} className={`w-full rounded-t-sm transition-all duration-300 ${isFilled ? 'bg-primary shadow-[0_0_8px_rgba(1,45,29,0.6)]' : 'bg-surface-container-high'}`} style={{ height: `${20 + i * 16}%` }} />
              );
            })}
          </div>
        </div>

        {/* CO2 Card */}
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(25,28,29,0.04)] flex flex-col justify-between min-h-[220px] group transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(27,67,50,0.2)]">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center">
              <span className="text-primary font-bold">CO₂</span>
            </div>
            <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${data.co2Trend <= 0 ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
              {data.co2Trend <= 0 ? <TrendingDownIcon /> : <TrendingUpIcon />} {Math.abs(data.co2Trend)}%
            </span>
          </div>
          <div>
            <p className="text-label-md text-outline uppercase tracking-widest font-bold text-xs mb-1">CO2 CONCENTRATION</p>
            <h3 className="text-4xl font-black text-primary tracking-tighter">{data.co2} <span className="text-base font-medium text-on-surface-variant tracking-normal">PPM</span></h3>
          </div>
          <div className="h-8 flex items-end gap-1 overflow-hidden transition-all duration-300">
             {[1, 2, 3, 4, 5].map((i) => {
              const fillThreshold = (i / 5) * 450;
              const isFilled = data.co2 >= fillThreshold - 50;
              return (
                <div key={i} className={`w-full rounded-t-sm transition-all duration-300 ${isFilled ? 'bg-primary shadow-[0_0_8px_rgba(165,208,185,0.6)]' : 'bg-surface-container-high'}`} style={{ height: `${20 + i * 16}%` }} />
              );
            })}
          </div>
        </div>

        {/* Temp Rise Card */}
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(25,28,29,0.04)] flex flex-col justify-between min-h-[220px] group transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(27,67,50,0.2)]">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center">
              <Thermometer className="text-primary w-6 h-6" />
            </div>
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full flex items-center gap-1">
               <CheckCircle className="w-3 h-3" /> Moderate
            </span>
          </div>
          <div>
            <p className="text-label-md text-outline uppercase tracking-widest font-bold text-xs mb-1">GLOBAL TEMP RISE</p>
            <h3 className="text-4xl font-black text-primary tracking-tighter">{data.temp} <span className="text-base font-medium text-on-surface-variant tracking-normal">°C</span></h3>
          </div>
          <div className="h-8 flex items-end gap-1 overflow-hidden transition-all duration-300">
             {[1, 2, 3, 4, 5].map((i) => {
              const fillThreshold = (i / 5) * 1.5;
              const isFilled = parseFloat(data.temp) >= fillThreshold - 0.2;
              return (
                <div key={i} className={`w-full rounded-t-sm transition-all duration-300 ${isFilled ? 'bg-primary shadow-[0_0_8px_rgba(1,45,29,0.6)]' : 'bg-surface-container-high'}`} style={{ height: `100%` }} />
              );
            })}
          </div>
        </div>

        {/* Forest Card */}
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(25,28,29,0.04)] flex flex-col justify-between min-h-[220px] group transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(27,67,50,0.2)]">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center">
              <Trees className="text-primary w-6 h-6" />
            </div>
            <span className="px-3 py-1 bg-error-container text-on-error-container text-xs font-bold rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Critical
            </span>
          </div>
          <div>
            <p className="text-label-md text-outline uppercase tracking-widest font-bold text-xs mb-1">Global Forest Loss</p>
            <h3 className="text-4xl font-black text-primary tracking-tighter">{data.forest} <span className="text-base font-medium text-on-surface-variant tracking-normal">M Ha</span></h3>
          </div>
          <div className="h-8 flex items-end gap-1 overflow-hidden transition-all duration-300">
             {[1, 2, 3, 4, 5].map((i) => {
              const fillThreshold = (i / 5) * 5;
              const isFilled = data.forest >= fillThreshold - 1;
              return (
                <div key={i} className={`w-full rounded-t-sm transition-all duration-300 ${isFilled ? 'bg-primary shadow-[0_0_8px_rgba(165,208,185,0.6)]' : 'bg-surface-container-high'}`} style={{ height: `${20 + i * 16}%` }} />
              );
            })}
          </div>
        </div>
      </section>

      {/* Visualizations */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Global Temperature Trend */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(25,28,29,0.04)] hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(27,67,50,0.2)] transition-all duration-300">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h4 className="text-xl font-bold text-primary">Global Temperature Trend</h4>
              <p className="text-sm text-on-surface-variant">Annual deviation from 20th century average</p>
            </div>
          </div>
          <div className="relative h-64 w-full bg-surface-container-low rounded-lg overflow-hidden flex items-end p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-container-high)" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-outline)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-outline)', fontSize: 12 }} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--color-surface-container-lowest)', color: 'var(--color-on-surface)', borderRadius: '12px', border: '1px solid var(--color-outline-variant)', boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                  labelStyle={{ color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}
                  formatter={(value: number) => [`+${value}°C`, 'Deviation']}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <ReferenceLine y={0.9} stroke="var(--color-outline)" strokeDasharray="3 3" label={{ position: 'top', value: 'Average', fill: 'var(--color-outline)', fontSize: 10 }} />
                <Line type="monotone" dataKey="temp" name="Deviation (°C)" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-primary)' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emissions by Sector */}
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(25,28,29,0.04)] flex flex-col hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(27,67,50,0.2)] transition-all duration-300">
          <h4 className="text-xl font-bold text-primary mb-2">Emissions by Sector</h4>
          <p className="text-sm text-on-surface-variant mb-8 text-balance">Distribution of anthropogenic greenhouse gases.</p>
          <div className="relative flex-1 flex flex-col items-center justify-center">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Energy", value: 73.2, color: "var(--color-primary)" },
                      { name: "Agriculture", value: 18.4, color: "var(--color-secondary)" },
                      { name: "Waste", value: 8.4, color: "var(--color-surface-container-high)" },
                    ]}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="var(--color-surface-container-lowest)"
                    strokeWidth={2}
                    activeShape={(props: any) => {
                      const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                      return (
                        <g>
                          <Sector
                            cx={cx}
                            cy={cy}
                            innerRadius={innerRadius}
                            outerRadius={outerRadius + 6}
                            startAngle={startAngle}
                            endAngle={endAngle}
                            fill={fill}
                            style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.3))' }}
                          />
                        </g>
                      );
                    }}
                  >
                    {[
                      { name: "Energy", value: 73.2, color: "var(--color-primary)" },
                      { name: "Agriculture", value: 18.4, color: "var(--color-secondary)" },
                      { name: "Waste", value: 8.4, color: "var(--color-surface-container-high)" },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface-container-lowest)', color: 'var(--color-on-surface)', borderRadius: '8px', border: '1px solid var(--color-outline-variant)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                    formatter={(value: number) => [`${value}%`, 'Share']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value, entry: any) => <span className="text-on-surface-variant font-medium text-sm ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 w-full space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-primary"></span>
                  <span className="text-sm font-medium text-on-surface">Energy</span>
                </div>
                <span className="text-sm font-bold text-primary">73.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-secondary"></span>
                  <span className="text-sm font-medium text-on-surface">Agriculture</span>
                </div>
                <span className="text-sm font-bold text-primary">18.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-surface-container-high"></span>
                  <span className="text-sm font-medium text-on-surface">Waste</span>
                </div>
                <span className="text-sm font-bold text-primary">8.4%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Did You Know? Fact Grid */}
      <section className="bg-surface-container-lowest text-on-surface rounded-xl overflow-hidden p-12 shadow-[0_12px_40px_rgba(25,28,29,0.04)] transition-all duration-300">
        <div className="flex items-center gap-4 mb-10">
          <Lightbulb className="text-primary w-10 h-10" />
          <h3 className="text-3xl font-bold tracking-tight text-primary">The Living Intelligence</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-outline-variant/20 rounded-xl overflow-hidden">
          <div className="p-8 border-r border-b border-outline-variant/20 hover:bg-primary hover:text-on-primary transition-all duration-500 ease-out group hover:-translate-y-1.5 hover:shadow-xl hover:rounded-2xl hover:z-10 relative bg-surface-container-lowest">
            <p className="text-[10px] font-bold tracking-[.2em] mb-4 text-primary group-hover:text-primary-container">BIOSPHERE</p>
            <p className="text-lg font-light leading-relaxed group-hover:translate-x-1 transition-transform">One mature tree can absorb more than 48 pounds of carbon dioxide from the atmosphere in a single year.</p>
          </div>
          <div className="p-8 border-b border-outline-variant/20 hover:bg-primary hover:text-on-primary transition-all duration-500 ease-out group hover:-translate-y-1.5 hover:shadow-xl hover:rounded-2xl hover:z-10 relative bg-surface-container-lowest">
            <p className="text-[10px] font-bold tracking-[.2em] mb-4 text-primary group-hover:text-primary-container">OCEANIC</p>
            <p className="text-lg font-light leading-relaxed group-hover:translate-x-1 transition-transform">The ocean absorbs about 30% of the carbon dioxide produced by humans, buffering the impacts of global warming.</p>
          </div>
          <div className="p-8 border-r border-outline-variant/20 hover:bg-primary hover:text-on-primary transition-all duration-500 ease-out group hover:-translate-y-1.5 hover:shadow-xl hover:rounded-2xl hover:z-10 relative bg-surface-container-lowest">
            <p className="text-[10px] font-bold tracking-[.2em] mb-4 text-primary group-hover:text-primary-container">ATMOSPHERIC</p>
            <p className="text-lg font-light leading-relaxed group-hover:translate-x-1 transition-transform">Lightning strikes the earth about 8.6 million times a day, which helps fix nitrogen into the soil.</p>
          </div>
          <div className="p-8 hover:bg-primary hover:text-on-primary transition-all duration-500 ease-out group hover:-translate-y-1.5 hover:shadow-xl hover:rounded-2xl hover:z-10 relative bg-surface-container-lowest">
            <p className="text-[10px] font-bold tracking-[.2em] mb-4 text-primary group-hover:text-primary-container">ECOSYSTEMS</p>
            <p className="text-lg font-light leading-relaxed group-hover:translate-x-1 transition-transform">Bees are responsible for pollinating roughly one-third of the food we eat, maintaining global food security.</p>
          </div>
        </div>
      </section>

      {/* Carbon Footprint Calculator */}
      <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_40px_rgba(25,28,29,0.04)] mb-10">
        <h3 className="text-2xl font-bold text-primary mb-6">Personal Carbon Footprint Estimator</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="space-y-4 col-span-2">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-on-surface mb-2">
                <Car className="w-4 h-4 text-primary" /> Monthly Travel (Km)
              </label>
              <input 
                type="range" 
                min="0" max="3000" 
                value={travelKm} 
                onChange={(e) => setTravelKm(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="text-right text-xs text-on-surface-variant mt-1">{travelKm} km</div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-on-surface mb-2">
                <Home className="w-4 h-4 text-primary" /> Monthly Energy (kWh)
              </label>
              <input 
                type="range" 
                min="0" max="1500" 
                value={energyKwh} 
                onChange={(e) => setEnergyKwh(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="text-right text-xs text-on-surface-variant mt-1">{energyKwh} kWh</div>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl text-center flex flex-col justify-center h-full">
            <p className="text-sm font-bold text-outline uppercase tracking-widest mb-2">Estimated Footprint</p>
            <h4 className="text-4xl font-black text-primary">{Math.round(carbonFootprint)} <span className="text-lg font-medium text-on-surface-variant">kg CO₂</span></h4>
            <p className="text-xs text-on-surface-variant mt-4">Per month based on inputs</p>
          </div>
        </div>
      </section>

      {/* Actionable Steps */}
      <section className="flex flex-col gap-8 mb-10">
        <div className="text-center md:text-left">
          <h3 className="text-3xl font-bold text-primary">Every Action Resonates</h3>
          <p className="text-on-surface-variant font-medium mt-2">Strategic pathways toward a regenerative future.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-surface-container-low p-8 rounded-xl group hover:bg-surface-container-highest transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(27,67,50,0.15)]">
            <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
              <Zap className="text-on-secondary-container w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-primary mb-3">Optimize Usage</h4>
            <p className="text-on-surface-variant leading-relaxed">Implement high-efficiency systems and behavioral shifts to reduce raw resource consumption by up to 25%.</p>
            <a href="#" className="mt-6 flex items-center gap-2 font-bold text-secondary text-sm group-hover:gap-3 transition-all">
              Efficiency Guide <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          {/* Step 2 */}
          <div className="bg-surface-container-low p-8 rounded-xl group hover:bg-surface-container-highest transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(27,67,50,0.15)]">
            <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
              <Sun className="text-on-secondary-container w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-primary mb-3">Energy Shift</h4>
            <p className="text-on-surface-variant leading-relaxed">Transition infrastructure to decentralized renewable grids, prioritizing wind, solar, and tidal kinetics.</p>
            <a href="#" className="mt-6 flex items-center gap-2 font-bold text-secondary text-sm group-hover:gap-3 transition-all">
              Transition Plan <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          {/* Step 3 */}
          <div className="bg-surface-container-low p-8 rounded-xl group hover:bg-surface-container-highest transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(27,67,50,0.15)]">
            <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
              <Recycle className="text-on-secondary-container w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-primary mb-3">Circular Living</h4>
            <p className="text-on-surface-variant leading-relaxed">Design out waste by adopting closed-loop systems where every byproduct becomes a feedstock for another process.</p>
            <a href="#" className="mt-6 flex items-center gap-2 font-bold text-secondary text-sm group-hover:gap-3 transition-all">
              Circular Framework <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function TrendingDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
  );
}
