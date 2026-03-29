import type { UrbanZone, ZoneTemperature, UHISettings, CoolingModel } from '../types/uhi';
import { getCoolingModelInfo } from '../types/uhi';

/**
 * Temperature-to-colour mapping using a multi-stop colour ramp.
 * Maps temperature in range [minT, maxT] to a colour string.
 * Stops: deep blue → cyan → green → yellow → orange → red → dark red
 */
export function temperatureToColor(temp: number, minT = 15, maxT = 45): string {
  const t = Math.max(0, Math.min(1, (temp - minT) / (maxT - minT)));
  const stops = [
    { pos: 0.0, r: 20, g: 50, b: 180 },
    { pos: 0.15, r: 30, g: 140, b: 220 },
    { pos: 0.3, r: 40, g: 200, b: 190 },
    { pos: 0.45, r: 80, g: 210, b: 80 },
    { pos: 0.6, r: 240, g: 220, b: 40 },
    { pos: 0.75, r: 250, g: 150, b: 30 },
    { pos: 0.88, r: 230, g: 50, b: 30 },
    { pos: 1.0, r: 130, g: 15, b: 15 },
  ];

  let lower = stops[0], upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].pos && t <= stops[i + 1].pos) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  const range = upper.pos - lower.pos;
  const factor = range === 0 ? 0 : (t - lower.pos) / range;
  const r = Math.round(lower.r + (upper.r - lower.r) * factor);
  const g = Math.round(lower.g + (upper.g - lower.g) * factor);
  const b = Math.round(lower.b + (upper.b - lower.b) * factor);

  return `rgb(${r},${g},${b})`;
}

/**
 * Generate an SVG linear gradient definition string for the colour ramp.
 */
export function colorRampGradient(minT = 15, maxT = 45): string {
  const steps = 10;
  const stops = Array.from({ length: steps }, (_, i) => {
    const temp = minT + (maxT - minT) * (i / (steps - 1));
    const color = temperatureToColor(temp, minT, maxT);
    return `<stop offset="${((i / (steps - 1)) * 100).toFixed(1)}%" stop-color="${color}" />`;
  }).join('');
  return `<linearGradient id="colorRampGrad" x1="0" y1="1" x2="0" y2="0">${stops}</linearGradient>`;
}

// ─── Cooling Model Functions ─────────────────────────────────────────────────

/**
 * Calculate the cooling delta (°C) for a given zone using the selected model.
 *
 * @param greenCover  g — proportion of green cover (0–1)
 * @param urbanization  f — urbanization density factor (0–1)
 * @param coefficient  c — user-controlled cooling coefficient (°C)
 * @param model  the active cooling model
 * @returns  cooling delta in °C (always ≥ 0)
 */
export function computeCoolingDelta(
  greenCover: number,
  urbanization: number,
  coefficient: number,
  model: CoolingModel
): number {
  const g = greenCover;
  const f = urbanization;
  const c = coefficient;

  switch (model) {
    // Linear: direct proportionality
    // ΔT = c × g × f
    case 'linear':
      return c * g * f;

    // Exponential Decay: diminishing returns
    // ΔT = c × (1 - e^(-3g)) × f
    // At g=0: 0, at g=0.33: ~63% of max, at g=1: ~95% of max
    case 'exponential':
      return c * (1 - Math.exp(-3 * g)) * f;

    // Logarithmic: rapid initial then plateau
    // ΔT = c × ln(1 + 5g) × f
    // At g=0: 0, at g=0.2: ~69% of max, at g=1: ~100%
    case 'logarithmic':
      return c * Math.log(1 + 5 * g) * f;

    // Power Law: sub-linear with exponent 0.5
    // ΔT = c × g^0.5 × f
    // Square root curve — rapid initial, slower growth
    case 'power-law':
      return c * Math.pow(g, 0.5) * f;

    // Threshold / Saturation: linear up to threshold, then caps
    // ΔT = c × min(g / 0.4, 1) × f
    // Full cooling reached at 40% green cover
    case 'threshold':
      return c * Math.min(g / 0.4, 1) * f;

    // Quadratic (Concave): bell-shaped response
    // ΔT = c × g × (2 - g) × f
    // Max at g=0.5 (ΔT = c × 1 × f), symmetric decay
    case 'quadratic':
      return c * g * (2 - g) * f;

    default:
      return c * g * f;
  }
}

/**
 * Generate curve data points for all cooling models (for the comparison chart).
 * Returns an array of { greenCover, models: Record<CoolingModel, number> }.
 */
export function generateCoolingCurves(
  coefficient: number,
  urbanization: number
): { greenCover: number; values: Record<CoolingModel, number> }[] {
  const models: CoolingModel[] = ['linear', 'exponential', 'logarithmic', 'power-law', 'threshold', 'quadratic'];
  const steps = 50;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const g = i / steps;
    const values: Record<string, number> = {};
    for (const m of models) {
      values[m] = Math.round(computeCoolingDelta(g, urbanization, coefficient, m) * 100) / 100;
    }
    return { greenCover: g, values: values as Record<CoolingModel, number> };
  });
}

// ─── UHI Core Calculation ────────────────────────────────────────────────────

/**
 * UHI Formula Implementation
 *
 * UHI Intensity (ΔT) for a zone:
 *   ΔT = maxUHI × urbanizationFactor × (1 - greenCover) × (1 - albedo × 0.3)
 *
 * Zone temperature before cooling:
 *   T_before = T_rural + ΔT
 *
 * Zone temperature after cooling (model-dependent):
 *   T_after = T_before - coolingDelta(model)
 */
export function calculateZoneTemperature(
  zone: UrbanZone,
  settings: UHISettings
): ZoneTemperature {
  const { ruralTemperature, maxUHI, coolingCoefficient, coolingModel } = settings;

  // UHI intensity contribution
  const uhiIntensity =
    maxUHI *
    zone.urbanizationFactor *
    (1 - zone.greenCover) *
    (1 - zone.albedo * 0.3);

  // Temperature before any cooling intervention
  const temperatureBefore = ruralTemperature + uhiIntensity;

  // Apply selected cooling model
  const coolingDelta = computeCoolingDelta(
    zone.greenCover,
    zone.urbanizationFactor,
    coolingCoefficient,
    coolingModel
  );

  const temperatureAfter = temperatureBefore - coolingDelta;

  return {
    zoneId: zone.id,
    temperatureBefore: Math.round(temperatureBefore * 10) / 10,
    temperatureAfter: Math.round(temperatureAfter * 10) / 10,
    uhiIntensity: Math.round(uhiIntensity * 10) / 10,
    coolingDelta: Math.round(coolingDelta * 10) / 10,
  };
}

export function calculateAllZones(
  zones: UrbanZone[],
  settings: UHISettings
): Record<string, ZoneTemperature> {
  const result: Record<string, ZoneTemperature> = {};
  for (const zone of zones) {
    result[zone.id] = calculateZoneTemperature(zone, settings);
  }
  return result;
}

/**
 * Compute aggregate statistics across all zones.
 */
export function computeStats(
  zoneTemps: Record<string, ZoneTemperature>
): {
  avgBefore: number;
  avgAfter: number;
  maxUHI: number;
  minUHI: number;
  totalCooling: number;
  avgUHI: number;
} {
  const vals = Object.values(zoneTemps);
  if (vals.length === 0) {
    return { avgBefore: 0, avgAfter: 0, maxUHI: 0, minUHI: 0, totalCooling: 0, avgUHI: 0 };
  }

  const avgBefore = vals.reduce((s, v) => s + v.temperatureBefore, 0) / vals.length;
  const avgAfter = vals.reduce((s, v) => s + v.temperatureAfter, 0) / vals.length;
  const maxUHI = Math.max(...vals.map(v => v.uhiIntensity));
  const minUHI = Math.min(...vals.map(v => v.uhiIntensity));
  const totalCooling = vals.reduce((s, v) => s + v.coolingDelta, 0);
  const avgUHI = vals.reduce((s, v) => s + v.uhiIntensity, 0) / vals.length;

  return {
    avgBefore: Math.round(avgBefore * 10) / 10,
    avgAfter: Math.round(avgAfter * 10) / 10,
    maxUHI: Math.round(maxUHI * 10) / 10,
    minUHI: Math.round(minUHI * 10) / 10,
    totalCooling: Math.round(totalCooling * 10) / 10,
    avgUHI: Math.round(avgUHI * 10) / 10,
  };
}
