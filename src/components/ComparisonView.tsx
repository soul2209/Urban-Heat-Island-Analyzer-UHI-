import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUHIStore } from '../store/uhiStore';
import { calculateAllZones, temperatureToColor } from '../utils/uhi';
import { AnimatedNumber } from './AnimatedNumber';

export default function ComparisonView() {
  const { zones, settings } = useUHIStore();

  const zoneTemps = useMemo(
    () => calculateAllZones(zones, settings),
    [zones, settings]
  );

  const sortedZones = [...zones].sort((a, b) => {
    const ta = zoneTemps[a.id]?.uhiIntensity ?? 0;
    const tb = zoneTemps[b.id]?.uhiIntensity ?? 0;
    return tb - ta;
  });

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Before / After Comparison</h3>
      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 px-2 text-[9px] text-white/30 uppercase tracking-wider">
          <span>Zone</span>
          <span className="text-center">Before</span>
          <span className="text-center">After</span>
          <span className="text-center">Δ</span>
        </div>

        {/* Animated rows */}
        <AnimatePresence mode="popLayout">
          {sortedZones.map((zone) => {
            const temp = zoneTemps[zone.id];
            if (!temp) return null;
            const beforeColor = temperatureToColor(temp.temperatureBefore);
            const afterColor = temperatureToColor(temp.temperatureAfter);

            return (
              <motion.div
                key={zone.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
                className="grid grid-cols-[1fr_60px_60px_60px] gap-2 items-center px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                {/* Zone name + animated color dot */}
                <div className="flex items-center gap-2 min-w-0">
                  <motion.div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    animate={{
                      backgroundColor: settings.showAfter ? afterColor : beforeColor,
                    }}
                    transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                  />
                  <span className="text-[11px] text-white/80 truncate">{zone.name}</span>
                </div>

                {/* Before temp */}
                <div className="text-center text-[11px] font-mono font-semibold" style={{ color: beforeColor }}>
                  <AnimatedNumber value={temp.temperatureBefore} decimals={1} />
                  <span className="text-[9px]">°</span>
                </div>

                {/* After temp */}
                <div className="text-center text-[11px] font-mono font-semibold" style={{ color: afterColor }}>
                  <AnimatedNumber value={temp.temperatureAfter} decimals={1} />
                  <span className="text-[9px]">°</span>
                </div>

                {/* Cooling delta */}
                <div className="text-center text-[11px] font-mono font-semibold text-emerald-400">
                  −<AnimatedNumber value={temp.coolingDelta} decimals={1} />
                  <span className="text-[9px]">°</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
