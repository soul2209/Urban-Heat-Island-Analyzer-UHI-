import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUHIStore } from '../store/uhiStore';
import { calculateAllZones } from '../utils/uhi';
import { AnimatedNumber } from './AnimatedNumber';

function DetailItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[9px] text-white/35 uppercase tracking-wider">{label}</div>
      <div className={`text-xs font-mono font-semibold ${highlight ? 'text-white' : 'text-white/70'}`}>
        {value}
      </div>
    </div>
  );
}

export default function ZoneDetail() {
  const { zones, settings, selectedZoneId, hoveredZoneId } = useUHIStore();

  const zoneTemps = useMemo(
    () => calculateAllZones(zones, settings),
    [zones, settings]
  );

  const activeZoneId = selectedZoneId ?? hoveredZoneId;
  const zone = zones.find((z) => z.id === activeZoneId);
  const temp = activeZoneId ? zoneTemps[activeZoneId] : null;

  const categoryColors: Record<string, string> = {
    downtown: '#f97316',
    commercial: '#eab308',
    residential: '#60a5fa',
    industrial: '#ef4444',
    park: '#22c55e',
    water: '#38bdf8',
    suburban: '#a3e635',
  };

  return (
    <AnimatePresence mode="wait">
      {!zone || !temp ? (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white/5 rounded-xl border border-white/5 px-4 py-6 text-center"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <p className="text-[11px] text-white/25">Hover or click a zone for details</p>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key={activeZoneId}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          className="bg-white/5 rounded-xl border border-white/5 px-4 py-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: categoryColors[zone.category] ?? '#888' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
              />
              <h3 className="text-sm font-semibold text-white/90">{zone.name}</h3>
            </div>
            <motion.span
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 uppercase tracking-wider"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              {zone.category}
            </motion.span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <DetailItem label="Urbanization" value={`${(zone.urbanizationFactor * 100).toFixed(0)}%`} />
            <DetailItem label="Green Cover" value={`${(zone.greenCover * 100).toFixed(0)}%`} />
            <DetailItem label="Albedo" value={zone.albedo.toFixed(2)} />
            <div>
              <div className="text-[9px] text-white/35 uppercase tracking-wider">UHI ΔT</div>
              <div className="text-xs font-mono font-semibold text-white">
                <AnimatedNumber value={temp.uhiIntensity} decimals={1} />
                <span className="text-[10px]">°C</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-white/35 uppercase tracking-wider">Temp (Before)</div>
              <div className="text-xs font-mono font-semibold text-white/70">
                <AnimatedNumber value={temp.temperatureBefore} decimals={1} />
                <span className="text-[10px]">°C</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-white/35 uppercase tracking-wider">Temp (After)</div>
              <div className="text-xs font-mono font-semibold text-white">
                <AnimatedNumber value={temp.temperatureAfter} decimals={1} />
                <span className="text-[10px]">°C</span>
              </div>
            </div>
          </div>

          {temp.coolingDelta > 0 && (
            <motion.div
              className="mt-1 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
              initial={{ opacity: 0, height: 0, padding: 0 }}
              animate={{ opacity: 1, height: 'auto', padding: '8px' }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="text-[10px] text-emerald-400/70">Cooling Reduction</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                −<AnimatedNumber value={temp.coolingDelta} decimals={1} />
                <span className="text-[11px]">°C</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
