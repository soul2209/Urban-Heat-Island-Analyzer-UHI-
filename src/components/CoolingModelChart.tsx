import { useMemo } from 'react';
import { useUHIStore } from '../store/uhiStore';
import { generateCoolingCurves } from '../utils/uhi';
import { COOLING_MODELS, getCoolingModelInfo } from '../types/uhi';
import type { CoolingModel } from '../types/uhi';

/**
 * Visual comparison chart showing all 6 cooling model curves
 * plotted as an SVG line chart. The active model is highlighted.
 */
export default function CoolingModelChart() {
  const { settings } = useUHIStore();

  const data = useMemo(
    () => generateCoolingCurves(settings.coolingCoefficient, 0.8),
    [settings.coolingCoefficient]
  );

  const activeModelInfo = getCoolingModelInfo(settings.coolingModel);

  // Chart dimensions
  const W = 600;
  const H = 180;
  const padX = 40;
  const padY = 16;
  const plotW = W - padX - 20;
  const plotH = H - padY * 2;

  // Compute Y range from data
  let maxVal = 0;
  for (const d of data) {
    for (const model of COOLING_MODELS) {
      if (d.values[model.id] > maxVal) maxVal = d.values[model.id];
    }
  }
  maxVal = Math.ceil(maxVal + 0.5);

  const toX = (g: number) => padX + g * plotW;
  const toY = (v: number) => padY + plotH - (v / maxVal) * plotH;

  // Build SVG paths for each model
  const modelPaths = COOLING_MODELS.map((model) => {
    const points = data.map((d) => `${toX(d.greenCover).toFixed(1)},${toY(d.values[model.id]).toFixed(1)}`);
    return { model, path: `M ${points.join(' L ')}` };
  });

  // Grid lines
  const yTicks = 5;
  const yGrid = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = (maxVal * i) / yTicks;
    return { val, y: toY(val) };
  });

  const xTicks = 5;
  const xGrid = Array.from({ length: xTicks + 1 }, (_, i) => {
    const g = i / xTicks;
    return { g, x: toX(g) };
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Cooling Model Curves</h3>
        <span className="text-[9px] text-white/25 font-mono">f_urban = 0.8</span>
      </div>

      <div className="relative bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* Grid */}
          {yGrid.map(({ val, y }) => (
            <g key={y}>
              <line x1={padX} y1={y} x2={padX + plotW} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <text x={padX - 6} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace">
                {val.toFixed(1)}
              </text>
            </g>
          ))}
          {xGrid.map(({ g, x }) => (
            <g key={x}>
              <line x1={x} y1={padY} x2={x} y2={padY + plotH} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <text x={x} y={padY + plotH + 14} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace">
                {(g * 100).toFixed(0)}%
              </text>
            </g>
          ))}

          {/* Axis labels */}
          <text x={padX + plotW / 2} y={H - 1} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8">
            Green Cover →
          </text>
          <text x={8} y={padY + plotH / 2} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8"
            transform={`rotate(-90, 8, ${padY + plotH / 2})`}>
            Cooling ΔT (°C)
          </text>

          {/* Model curves — inactive models */}
          {modelPaths
            .filter(({ model }) => model.id !== settings.coolingModel)
            .map(({ model, path }) => (
              <path
                key={model.id}
                d={path}
                fill="none"
                stroke={model.color}
                strokeWidth="1"
                opacity="0.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

          {/* Active model curve */}
          {modelPaths
            .filter(({ model }) => model.id === settings.coolingModel)
            .map(({ model, path }) => (
              <g key={model.id}>
                {/* Glow effect */}
                <path
                  d={path}
                  fill="none"
                  stroke={model.color}
                  strokeWidth="4"
                  opacity="0.15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Main line */}
                <path
                  d={path}
                  fill="none"
                  stroke={model.color}
                  strokeWidth="2"
                  opacity="0.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ))}
        </svg>

        {/* Legend overlay */}
        <div className="absolute bottom-1.5 right-2 flex flex-wrap gap-x-3 gap-y-1 justify-end">
          {COOLING_MODELS.map((model) => {
            const isActive = model.id === settings.coolingModel;
            return (
              <div key={model.id} className="flex items-center gap-1">
                <div
                  className="w-3 h-0.5 rounded-full"
                  style={{
                    backgroundColor: model.color,
                    opacity: isActive ? 1 : 0.25,
                  }}
                />
                <span
                  className="text-[8px] font-mono"
                  style={{
                    color: isActive ? model.color : 'rgba(255,255,255,0.2)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {model.shortName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
