import { temperatureToColor, colorRampGradient } from '../utils/uhi';

interface ColorRampProps {
  minTemp: number;
  maxTemp: number;
}

export default function ColorRamp({ minTemp, maxTemp }: ColorRampProps) {
  const steps = 20;
  const stops = Array.from({ length: steps }, (_, i) => {
    const temp = minTemp + (maxTemp - minTemp) * (i / (steps - 1));
    const color = temperatureToColor(temp, minTemp, maxTemp);
    return (
      <div
        key={i}
        className="flex-1 h-full"
        style={{ backgroundColor: color }}
      />
    );
  });

  const labelCount = 7;
  const labels = Array.from({ length: labelCount }, (_, i) => {
    const temp = minTemp + (maxTemp - minTemp) * (i / (labelCount - 1));
    const pct = (i / (labelCount - 1)) * 100;
    return (
      <div key={i} className="absolute flex flex-col items-center" style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}>
        <span className="text-[10px] text-white/60 font-mono">{temp.toFixed(1)}°C</span>
        <span className="w-px h-1.5 bg-white/30" />
      </div>
    );
  });

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Temperature Scale</h3>
      <div className="relative">
        <div className="flex rounded-lg overflow-hidden h-6 shadow-inner">
          {stops}
        </div>
        <div className="absolute -bottom-5 left-0 right-0 flex justify-between">
          {labels}
        </div>
      </div>
      <div className="flex justify-between pt-3 text-[9px] text-white/40">
        <span>Cool / Vegetated</span>
        <span>Urban Heat Island</span>
        <span>Extreme Heat</span>
      </div>
    </div>
  );
}
