export interface UrbanZone {
  id: string;
  name: string;
  /** Base urbanization density factor (0–1) */
  urbanizationFactor: number;
  /** Proportion of green cover (0–1) */
  greenCover: number;
  /** Surface albedo / reflectivity (0–1) */
  albedo: number;
  /** SVG path data for the zone shape */
  path: string;
  /** Bounding box offset for labels */
  labelPos: { x: number; y: number };
  /** Zone category for icon display */
  category: 'downtown' | 'commercial' | 'residential' | 'industrial' | 'park' | 'water' | 'suburban';
}

export interface ZoneTemperature {
  zoneId: string;
  temperatureBefore: number;
  temperatureAfter: number;
  uhiIntensity: number;
  coolingDelta: number;
}

export interface UHISettings {
  /** Base rural reference temperature (°C) */
  ruralTemperature: number;
  /** Max UHI intensity under full urbanization (°C) */
  maxUHI: number;
  /** Cooling coefficient — scales the cooling effect magnitude */
  coolingCoefficient: number;
  /** Active cooling model */
  coolingModel: CoolingModel;
  /** Whether to show the "after cooling" state */
  showAfter: boolean;
}

export type ComparisonMode = 'before' | 'after' | 'split';

/**
 * Supported cooling models for simulating green-space temperature reduction.
 *
 * Each model defines how the cooling delta (ΔT_cool) is calculated
 * as a function of green cover (g), urbanization factor (f), and
 * the user-controlled cooling coefficient (c).
 */
export type CoolingModel =
  | 'linear'
  | 'exponential'
  | 'logarithmic'
  | 'power-law'
  | 'threshold'
  | 'quadratic';

/** Metadata for each cooling model: display name, description, formula, and icon. */
export interface CoolingModelInfo {
  id: CoolingModel;
  name: string;
  shortName: string;
  description: string;
  formula: string;
  icon: string;
  color: string;
}

export const COOLING_MODELS: CoolingModelInfo[] = [
  {
    id: 'linear',
    name: 'Linear',
    shortName: 'Linear',
    description: 'Simple proportional relationship. Cooling increases steadily with green cover.',
    formula: 'ΔT = c × g × f',
    icon: '📐',
    color: '#34d399',
  },
  {
    id: 'exponential',
    name: 'Exponential Decay',
    shortName: 'Exp Decay',
    description: 'Diminishing returns — strong initial cooling that plateaus as green cover increases.',
    formula: 'ΔT = c × (1 − e^(−3g)) × f',
    icon: '📉',
    color: '#60a5fa',
  },
  {
    id: 'logarithmic',
    name: 'Logarithmic',
    shortName: 'Log',
    description: 'Rapid cooling at low green cover, then tapers off. Reflects realistic saturation.',
    formula: 'ΔT = c × ln(1 + 5g) × f',
    icon: '📊',
    color: '#a78bfa',
  },
  {
    id: 'power-law',
    name: 'Power Law',
    shortName: 'Power',
    description: 'Non-linear scaling with an exponent (n=0.5). Sub-linear curve controlled by the coefficient.',
    formula: 'ΔT = c × g^0.5 × f',
    icon: '⚡',
    color: '#fbbf24',
  },
  {
    id: 'threshold',
    name: 'Threshold / Saturation',
    shortName: 'Threshold',
    description: 'Linear up to 40% green cover, then saturates. Models a cap on cooling effectiveness.',
    formula: 'ΔT = c × min(g / 0.4, 1) × f',
    icon: '🚧',
    color: '#f87171',
  },
  {
    id: 'quadratic',
    name: 'Quadratic (Concave)',
    shortName: 'Quad',
    description: 'Concave parabolic curve. Maximum cooling at 50% green cover, diminishing beyond.',
    formula: 'ΔT = c × g × (2 − g) × f',
    icon: '🔮',
    color: '#fb923c',
  },
];

export function getCoolingModelInfo(id: CoolingModel): CoolingModelInfo {
  return COOLING_MODELS.find(m => m.id === id) ?? COOLING_MODELS[0];
}
