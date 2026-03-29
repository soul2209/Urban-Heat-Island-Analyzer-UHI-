import { create } from 'zustand';
import type { UrbanZone, UHISettings, ComparisonMode, CoolingModel } from '../types/uhi';

/**
 * Default urban zones – a stylised top-down city layout.
 * Each zone is an SVG polygon representing a distinct urban land-use area.
 */
export const DEFAULT_ZONES: UrbanZone[] = [
  {
    id: 'downtown',
    name: 'Downtown Core',
    urbanizationFactor: 0.95,
    greenCover: 0.05,
    albedo: 0.15,
    path: 'M 280 120 L 380 100 L 430 140 L 420 220 L 360 260 L 280 250 L 250 190 Z',
    labelPos: { x: 345, y: 175 },
    category: 'downtown',
  },
  {
    id: 'commercial',
    name: 'Commercial District',
    urbanizationFactor: 0.75,
    greenCover: 0.12,
    albedo: 0.25,
    path: 'M 430 140 L 530 120 L 580 170 L 570 250 L 500 280 L 420 260 L 420 220 Z',
    labelPos: { x: 500, y: 200 },
    category: 'commercial',
  },
  {
    id: 'residential-nw',
    name: 'Residential NW',
    urbanizationFactor: 0.55,
    greenCover: 0.30,
    albedo: 0.30,
    path: 'M 160 80 L 280 70 L 280 120 L 250 190 L 280 250 L 200 260 L 130 200 L 120 130 Z',
    labelPos: { x: 200, y: 165 },
    category: 'residential',
  },
  {
    id: 'residential-se',
    name: 'Residential SE',
    urbanizationFactor: 0.50,
    greenCover: 0.35,
    albedo: 0.32,
    path: 'M 360 260 L 420 260 L 500 280 L 570 300 L 560 370 L 480 400 L 380 380 L 320 330 Z',
    labelPos: { x: 440, y: 335 },
    category: 'residential',
  },
  {
    id: 'industrial',
    name: 'Industrial Zone',
    urbanizationFactor: 0.85,
    greenCover: 0.03,
    albedo: 0.10,
    path: 'M 80 220 L 200 260 L 280 250 L 320 330 L 300 400 L 200 420 L 100 380 L 60 300 Z',
    labelPos: { x: 180, y: 320 },
    category: 'industrial',
  },
  {
    id: 'central-park',
    name: 'Central Park',
    urbanizationFactor: 0.10,
    greenCover: 0.92,
    albedo: 0.20,
    path: 'M 320 140 L 380 130 L 380 180 L 370 230 L 340 240 L 300 230 L 290 190 Z',
    labelPos: { x: 340, y: 215 },
    category: 'park',
  },
  {
    id: 'lake',
    name: 'Urban Lake',
    urbanizationFactor: 0.05,
    greenCover: 0.05,
    albedo: 0.06,
    path: 'M 530 300 L 600 280 L 650 320 L 660 390 L 620 420 L 560 400 L 530 360 Z',
    labelPos: { x: 595, y: 350 },
    category: 'water',
  },
  {
    id: 'suburban',
    name: 'Suburban Edge',
    urbanizationFactor: 0.30,
    greenCover: 0.60,
    albedo: 0.40,
    path: 'M 480 400 L 560 370 L 620 420 L 650 490 L 590 530 L 500 510 L 440 470 Z',
    labelPos: { x: 545, y: 465 },
    category: 'suburban',
  },
];

interface UHIState {
  zones: UrbanZone[];
  settings: UHISettings;
  selectedZoneId: string | null;
  comparisonMode: ComparisonMode;
  hoveredZoneId: string | null;

  setSettings: (patch: Partial<UHISettings>) => void;
  setZoneGreenCover: (zoneId: string, value: number) => void;
  setZoneUrbanization: (zoneId: string, value: number) => void;
  setSelectedZone: (id: string | null) => void;
  setComparisonMode: (mode: ComparisonMode) => void;
  setHoveredZone: (id: string | null) => void;
  resetZones: () => void;
}

export const useUHIStore = create<UHIState>((set) => ({
  zones: DEFAULT_ZONES,
  settings: {
    ruralTemperature: 22,
    maxUHI: 8,
    coolingCoefficient: 3.5,
    coolingModel: 'linear' as CoolingModel,
    showAfter: true,
  },
  selectedZoneId: null,
  comparisonMode: 'split',
  hoveredZoneId: null,

  setSettings: (patch) =>
    set((state) => ({
      settings: { ...state.settings, ...patch },
    })),

  setZoneGreenCover: (zoneId, value) =>
    set((state) => ({
      zones: state.zones.map((z) =>
        z.id === zoneId ? { ...z, greenCover: value } : z
      ),
    })),

  setZoneUrbanization: (zoneId, value) =>
    set((state) => ({
      zones: state.zones.map((z) =>
        z.id === zoneId ? { ...z, urbanizationFactor: value } : z
      ),
    })),

  setSelectedZone: (id) => set({ selectedZoneId: id }),
  setComparisonMode: (mode) => set({ comparisonMode: mode }),
  setHoveredZone: (id) => set({ hoveredZoneId: id }),

  resetZones: () => set({ zones: DEFAULT_ZONES }),
}));
