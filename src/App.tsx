import React from 'react';
import { useUHIStore } from './store/uhiStore';
import CityMap from './components/CityMap';
import ColorRamp from './components/ColorRamp';
import ControlPanel from './components/ControlPanel';
import StatsPanel from './components/StatsPanel';
import ComparisonView from './components/ComparisonView';
import ZoneDetail from './components/ZoneDetail';
import CoolingModelChart from './components/CoolingModelChart';

function App() {
  const { settings } = useUHIStore();

  // Derive temperature range from settings for the color ramp
  const minTemp = Math.round(settings.ruralTemperature - 1);
  const maxTemp = Math.round(settings.ruralTemperature + settings.maxUHI + 2);

  return (
    <div className="min-h-screen bg-[#080d19] text-white/90">
      {/* Background atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full bg-orange-500/[0.04] blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[50%] h-[50%] rounded-full bg-cyan-500/[0.04] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-lg shadow-lg shadow-orange-500/20">
              🌡️
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Urban Heat Island Analyser
              </h1>
              <p className="text-[11px] text-white/35 -mt-0.5">
                Interactive thermal mapping &amp; cooling model simulation
              </p>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Left Column: Map + Colour Ramp + Chart + Comparison */}
          <div className="space-y-5">
            {/* SVG City Map */}
            <div className="glass-panel p-4 sm:p-5">
              <CityMap />
            </div>

            {/* Colour Ramp */}
            <div className="glass-panel px-5 pt-4 pb-8">
              <ColorRamp minTemp={minTemp} maxTemp={maxTemp} />
            </div>

            {/* Cooling Model Comparison Chart */}
            <div className="glass-panel p-4 sm:p-5">
              <CoolingModelChart />
            </div>

            {/* Before/After Comparison Table */}
            <div className="glass-panel p-4 sm:p-5">
              <ComparisonView />
            </div>
          </div>

          {/* Right Column: Controls + Stats + Zone Detail */}
          <div className="space-y-5">
            {/* Control Panel */}
            <div className="glass-panel p-4 sm:p-5">
              <ControlPanel />
            </div>

            {/* Stats Panel */}
            <div className="glass-panel p-4 sm:p-5">
              <StatsPanel />
            </div>

            {/* Zone Detail */}
            <ZoneDetail />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 py-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/20">
            UHI Analyser — 6 cooling models: Linear · Exponential · Logarithmic · Power Law · Threshold · Quadratic
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
