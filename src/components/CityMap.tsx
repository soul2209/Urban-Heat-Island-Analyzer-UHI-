import { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUHIStore } from '../store/uhiStore';
import { calculateAllZones, temperatureToColor, colorRampGradient } from '../utils/uhi';
import { AnimatedNumber } from './AnimatedNumber';
import type { ZoneTemperature } from '../types/uhi';
import type { CoolingModel } from '../types/uhi';

function getZoneFillColor(
  temp: ZoneTemperature,
  showAfter: boolean
): string {
  return temperatureToColor(showAfter ? temp.temperatureAfter : temp.temperatureBefore);
}

const categoryIcons: Record<string, string> = {
  downtown: '🏗️',
  commercial: '🏪',
  residential: '🏠',
  industrial: '🏭',
  park: '🌳',
  water: '💧',
  suburban: '🌿',
};

/** Pre-compute stagger delays based on distance from park center */
const PARK_CENTER = { x: 335, y: 185 };
const MAX_DIST = 280;

function getStaggerDelay(labelPos: { x: number; y: number }): number {
  const dx = labelPos.x - PARK_CENTER.x;
  const dy = labelPos.y - PARK_CENTER.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return (dist / MAX_DIST) * 0.4; // 0 to 0.4s stagger
}

export default function CityMap() {
  const { zones, settings, selectedZoneId, hoveredZoneId, setSelectedZone, setHoveredZone } = useUHIStore();
  const [prevModel, setPrevModel] = useState<CoolingModel>(settings.coolingModel);
  const [waveKey, setWaveKey] = useState(0);

  const zoneTemps = useMemo(
    () => calculateAllZones(zones, settings),
    [zones, settings]
  );

  const showAfter = settings.showAfter;

  // Trigger a staggered cooling wave when the model changes
  useEffect(() => {
    if (settings.coolingModel !== prevModel) {
      setPrevModel(settings.coolingModel);
      setWaveKey((k) => k + 1);
    }
  }, [settings.coolingModel, prevModel]);

  return (
    <div className="relative w-full">
      <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs text-white/70 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Interactive — click zones to inspect
      </div>

      <svg
        viewBox="40 50 640 510"
        className="w-full h-auto rounded-2xl"
        style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.3))' }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {colorRampGradient()}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Background */}
        <rect x="40" y="50" width="640" height="510" rx="16" fill="#0f1729" />
        <rect x="40" y="50" width="640" height="510" rx="16" fill="url(#grid)" />

        {/* Connection lines between zones (roads) */}
        <g opacity="0.15" stroke="white" strokeWidth="1" strokeDasharray="4 3">
          <line x1="345" y1="175" x2="500" y2="200" />
          <line x1="345" y1="175" x2="200" y2="165" />
          <line x1="345" y1="175" x2="335" y2="185" />
          <line x1="420" y1="260" x2="440" y2="335" />
          <line x1="250" y1="190" x2="180" y2="320" />
          <line x1="530" y1="300" x2="595" y2="350" />
          <line x1="595" y1="350" x2="545" y2="465" />
        </g>

        {/* Zone polygons — animated with motion.path */}
        {zones.map((zone) => {
          const temp = zoneTemps[zone.id];
          if (!temp) return null;

          const fillColor = getZoneFillColor(temp, showAfter);
          const isSelected = zone.id === selectedZoneId;
          const isHovered = zone.id === hoveredZoneId;
          const strokeColor = isSelected ? '#ffffff' : isHovered ? '#e0e0e0' : 'rgba(255,255,255,0.15)';
          const strokeWidth = isSelected ? 3 : isHovered ? 2 : 1;
          const stagger = getStaggerDelay(zone.labelPos);

          return (
            <g key={zone.id}>
              {/* Animated zone polygon */}
              <motion.path
                d={zone.path}
                initial={false}
                animate={{
                  fill: fillColor,
                  stroke: strokeColor,
                  strokeWidth: strokeWidth,
                }}
                transition={{
                  fill: {
                    duration: 0.6,
                    delay: 0,
                    ease: [0.33, 1, 0.68, 1],
                  },
                  stroke: { duration: 0.2 },
                  strokeWidth: { duration: 0.2 },
                }}
                style={{ cursor: 'pointer', filter: isHovered ? 'url(#glow)' : 'none' }}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => setSelectedZone(zone.id === selectedZoneId ? null : zone.id)}
              />

              {/* Cooling wave pulse on model change */}
              <motion.path
                d={zone.path}
                fill="rgba(52, 211, 153, 0.15)"
                key={`wave-${zone.id}-${waveKey}`}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                transition={{
                  duration: 1.2,
                  delay: stagger,
                  ease: 'easeOut',
                }}
                style={{ pointerEvents: 'none' }}
              />

              {/* Zone label (name only — temperature is rendered via foreignObject below) */}
              <text
                x={zone.labelPos.x}
                y={zone.labelPos.y - 4}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="600"
                style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
              >
                {categoryIcons[zone.category]} {zone.name}
              </text>
            </g>
          );
        })}

        {/* Floating temperature labels using foreignObject for AnimatedNumber */}
        <foreignObject x="40" y="50" width="640" height="510" style={{ pointerEvents: 'none' }}>
          <div className="relative w-full h-full" style={{ overflow: 'visible' }}>
            {zones.map((zone) => {
              const temp = zoneTemps[zone.id];
              if (!temp) return null;

              // Convert SVG coords to percentage for positioning (offset +14 below name label)
              const px = ((zone.labelPos.x - 40) / 640) * 100;
              const py = ((zone.labelPos.y + 14 - 50) / 510) * 100;
              const displayTemp = showAfter ? temp.temperatureAfter : temp.temperatureBefore;

              return (
                <div
                  key={`num-${zone.id}`}
                  className="absolute text-center whitespace-nowrap"
                  style={{
                    left: `${px}%`,
                    top: `${py}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.9)',
                    textShadow: '0 1px 6px rgba(0,0,0,0.95)',
                    lineHeight: 1,
                  }}
                >
                  <AnimatedNumber value={displayTemp} decimals={1} />
                  <span style={{ fontSize: '10px' }}>°C</span>
                </div>
              );
            })}
          </div>
        </foreignObject>

        {/* Selected zone info tooltip */}
        <AnimatePresence>
          {selectedZoneId && zoneTemps[selectedZoneId] && (() => {
            const zone = zones.find((z) => z.id === selectedZoneId);
            if (!zone) return null;
            const temp = zoneTemps[selectedZoneId];
            return (
              <motion.g
                key="tooltip"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.25 }}
              >
                <rect
                  x={zone.labelPos.x - 70}
                  y={zone.labelPos.y + 18}
                  width="140"
                  height="42"
                  rx="8"
                  fill="rgba(0,0,0,0.75)"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                />
                <text
                  x={zone.labelPos.x}
                  y={zone.labelPos.y + 34}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                >
                  UHI: {temp.uhiIntensity}°C • Cooling: −{temp.coolingDelta}°C
                </text>
                <text
                  x={zone.labelPos.x}
                  y={zone.labelPos.y + 48}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.6)"
                  fontSize="8"
                >
                  {temp.temperatureBefore}°C → {temp.temperatureAfter}°C
                </text>
              </motion.g>
            );
          })()}
        </AnimatePresence>
      </svg>
    </div>
  );
}
