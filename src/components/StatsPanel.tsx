import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUHIStore } from '../store/uhiStore';
import { calculateAllZones, computeStats } from '../utils/uhi';
import { getCoolingModelInfo } from '../types/uhi';
import { AnimatedNumber } from './AnimatedNumber';

function AnimatedStat({
  label,
  rawValue,
  prefix = '',
  suffix = '°C',
  colorClass,
}: {
  label: string;
  rawValue: number;
  prefix?: string;
  suffix?: string;
  colorClass: string;
}) {
  return (
    <motion.div
      className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/5 hover:border-white/10 transition-colors"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
    >
      <div className="text-[10px] text-white/40 mb-0.5">{label}</div>
      <div className={`text-sm font-bold font-mono ${colorClass}`}>
        <span className="text-[11px]">{prefix}</span>
        <AnimatedNumber value={Math.abs(rawValue)} decimals={1} />
        <span className="text-[10px]">{suffix}</span>
      </div>
    </motion.div>
  );
}

export default function StatsPanel() {
  const { zones, settings } = useUHIStore();

  const zoneTemps = useMemo(
    () => calculateAllZones(zones, settings),
    [zones, settings]
  );

  const stats = useMemo(() => computeStats(zoneTemps), [zoneTemps]);
  const modelInfo = getCoolingModelInfo(settings.coolingModel);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Analysis Summary</h3>
      <div className="grid grid-cols-2 gap-2">
        <AnimatedStat label="Avg Temp (Before)" rawValue={stats.avgBefore} colorClass="text-amber-400" />
        <AnimatedStat label="Avg Temp (After)" rawValue={stats.avgAfter} colorClass="text-emerald-400" />
        <AnimatedStat label="Max UHI Intensity" rawValue={stats.maxUHI} colorClass="text-red-400" />
        <AnimatedStat label="Avg UHI Intensity" rawValue={stats.avgUHI} colorClass="text-orange-400" />
        <AnimatedStat label="Total Cooling" rawValue={stats.totalCooling} prefix="−" colorClass="text-cyan-400" />
        <AnimatedStat label="Rural Reference" rawValue={settings.ruralTemperature} colorClass="text-sky-400" />
      </div>

      {/* Active Formula display */}
      <motion.div
        className="bg-white/5 rounded-xl px-3 py-3 border border-white/5 space-y-2"
        key={settings.coolingModel}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
      >
        <div className="text-[10px] text-white/40 mb-2 uppercase tracking-wider">Formulas</div>
        <div className="text-[11px] text-white/70 font-mono leading-relaxed space-y-1">
          <div>ΔT = T<sub>max</sub> × f<sub>urban</sub> × (1 − g<sub>cover</sub>) × (1 − α × 0.3)</div>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          <motion.span
            className="text-sm inline-block"
            initial={{ rotate: 0, scale: 1 }}
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {modelInfo.icon}
          </motion.span>
          <div>
            <div className="text-[10px] text-white/35">{modelInfo.name}</div>
            <div className="text-[11px] font-mono" style={{ color: modelInfo.color }}>
              {modelInfo.formula}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
