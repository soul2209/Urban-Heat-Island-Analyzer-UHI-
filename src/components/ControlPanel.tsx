import { useUHIStore } from '../store/uhiStore';
import type { CoolingModel } from '../types/uhi';
import { COOLING_MODELS, getCoolingModelInfo } from '../types/uhi';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
  color?: string;
}

function Slider({ label, value, min, max, step, unit = '', onChange, color = '#60a5fa' }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <label className="text-xs text-white/60">{label}</label>
        <span className="text-xs font-mono font-bold text-white/90">
          {value}{unit}
        </span>
      </div>
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-200"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 appearance-none bg-transparent cursor-pointer relative z-10 mt-[-26px]"
        style={{ WebkitAppearance: 'none', background: 'transparent' }}
      />
    </div>
  );
}

export default function ControlPanel() {
  const {
    settings, setSettings,
    zones, setZoneGreenCover, setZoneUrbanization,
    selectedZoneId, setComparisonMode, comparisonMode, resetZones,
  } = useUHIStore();

  const selectedZone = zones.find((z) => z.id === selectedZoneId);
  const activeModelInfo = getCoolingModelInfo(settings.coolingModel);

  return (
    <div className="space-y-5">
      {/* Global Settings */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Global Parameters</h3>
        <Slider
          label="Rural Reference Temp"
          value={settings.ruralTemperature}
          min={15} max={35} step={0.5}
          unit="°C"
          onChange={(v) => setSettings({ ruralTemperature: v })}
          color="#38bdf8"
        />
        <Slider
          label="Max UHI Intensity"
          value={settings.maxUHI}
          min={2} max={15} step={0.5}
          unit="°C"
          onChange={(v) => setSettings({ maxUHI: v })}
          color="#f97316"
        />
      </div>

      {/* Cooling Model Selector */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Cooling Model</h3>

        {/* Model cards grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {COOLING_MODELS.map((model) => {
            const isActive = settings.coolingModel === model.id;
            return (
              <button
                key={model.id}
                onClick={() => setSettings({ coolingModel: model.id })}
                className={`relative text-left p-2.5 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 border-white/20 shadow-lg'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                }`}
                style={isActive ? { boxShadow: `0 0 20px ${model.color}15` } : undefined}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <div
                    className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: model.color }}
                  />
                )}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{model.icon}</span>
                  <span className={`text-[11px] font-semibold ${isActive ? 'text-white' : 'text-white/50'}`}>
                    {model.shortName}
                  </span>
                </div>
                <div
                  className="text-[9px] font-mono leading-snug"
                  style={{ color: isActive ? `${model.color}` : 'rgba(255,255,255,0.25)' }}
                >
                  {model.formula}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active model description */}
        <div
          className="rounded-xl px-3 py-2.5 border transition-all duration-300"
          style={{
            backgroundColor: `${activeModelInfo.color}08`,
            borderColor: `${activeModelInfo.color}20`,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span>{activeModelInfo.icon}</span>
            <span className="text-[11px] font-semibold text-white/90">{activeModelInfo.name}</span>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">{activeModelInfo.description}</p>
        </div>

        {/* Cooling coefficient slider */}
        <Slider
          label="Cooling Coefficient"
          value={settings.coolingCoefficient}
          min={0} max={8} step={0.25}
          unit="°C"
          onChange={(v) => setSettings({ coolingCoefficient: v })}
          color={activeModelInfo.color}
        />
      </div>

      {/* Comparison Mode */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Comparison Mode</h3>
        <div className="flex rounded-xl overflow-hidden border border-white/10">
          {(['before', 'split', 'after'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setComparisonMode(mode);
                setSettings({ showAfter: mode !== 'before' });
              }}
              className={`flex-1 py-2 text-[11px] font-semibold transition-all duration-200 ${
                comparisonMode === mode
                  ? 'bg-white/15 text-white'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {mode === 'before' ? 'Before' : mode === 'after' ? 'After' : 'Split'}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Zone Controls */}
      {selectedZone && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Zone: {selectedZone.name}
          </h3>
          <Slider
            label="Green Cover"
            value={selectedZone.greenCover}
            min={0} max={1} step={0.01}
            onChange={(v) => setZoneGreenCover(selectedZone.id, v)}
            color="#22c55e"
          />
          <Slider
            label="Urbanization Factor"
            value={selectedZone.urbanizationFactor}
            min={0} max={1} step={0.01}
            onChange={(v) => setZoneUrbanization(selectedZone.id, v)}
            color="#f59e0b"
          />
          <button
            onClick={() => resetZones()}
            className="w-full mt-2 py-2 text-[11px] font-medium text-white/50 bg-white/5 rounded-xl hover:bg-white/10 hover:text-white/70 transition-all border border-white/5"
          >
            Reset All Zones
          </button>
        </div>
      )}

      {!selectedZone && (
        <div className="text-center py-4">
          <div className="text-2xl mb-2">👆</div>
          <p className="text-[11px] text-white/30">Select a zone on the map to adjust its properties</p>
        </div>
      )}
    </div>
  );
}
