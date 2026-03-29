# 🌡️ Urban Heat Island Analyser

> Interactive thermal mapping & cooling model simulation for urban climate analysis.

**🔗 Live Demo:** [urban-heat-island-analyzer-uhi.vercel.app](https://urban-heat-island-analyzer-uhi.vercel.app/)

---

## What is it?

The **Urban Heat Island (UHI) Analyser** is an interactive web tool that simulates how cities trap heat compared to rural areas — and models how different green cooling strategies can reduce urban temperatures.

It's built as an educational and analytical tool for understanding how urban planning decisions directly affect city-wide temperature distribution.

---

## Features

- 🗺️ **Interactive City Map** — Click on zones (Downtown, Industrial, Parks, Lakes, Residential etc.) to inspect their thermal properties
- 🌈 **Live Temperature Color Mapping** — Zones dynamically change color from cool blue → hot red based on real-time calculations
- 📊 **6 Cooling Models** — Compare Linear, Exponential, Logarithmic, Power Law, Threshold, and Quadratic cooling strategies
- 📈 **Cooling Model Curves Chart** — Visual SVG chart plotting all 6 models simultaneously with the active one highlighted
- ⚖️ **Before / After Comparison Table** — See temperature deltas across all zones sorted by UHI intensity
- 🎛️ **Adjustable Parameters** — Tune rural reference temperature, max UHI intensity, cooling coefficient, green cover, and urbanization factor per zone
- 🔄 **Animated Transitions** — Smooth spring animations on all number changes and cooling wave pulses on model switch
- 📋 **Analysis Summary** — Avg temps, max/avg UHI intensity, total cooling, rural reference stats

---

## Cooling Models

| Model | Formula | Description |
|-------|---------|-------------|
| Linear | `ΔT = c × g + f` | Proportional cooling with green cover |
| Exponential | `ΔT = c × (1 - e^(-3g)) + f` | Rapid initial gains, diminishing returns |
| Logarithmic | `ΔT = c × ln(1 + 5g) + f` | Strong early effect, plateaus at high cover |
| Power Law | `ΔT = c × g^0.5 × f` | Sub-linear relationship |
| Threshold | `ΔT = c × abs(g / 0.4, ...) + f` | Minimal effect until critical threshold |
| Quadratic | `ΔT = c × g × (2 - g) + f` | Accelerating effect at higher cover |

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tool
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — animations & transitions
- **Zustand** — state management
- **Lucide React** — icons

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/soul2209/Urban-Heat-Island-Analyzer-UHI-.git
cd Urban-Heat-Island-Analyzer-UHI-

# Install dependencies
npm install

# Run locally
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
src/
├── components/
│   ├── CityMap.tsx           # SVG interactive map
│   ├── ControlPanel.tsx      # Sliders & cooling model selector
│   ├── StatsPanel.tsx        # Analysis summary stats
│   ├── ComparisonView.tsx    # Before/after table
│   ├── CoolingModelChart.tsx # SVG line chart
│   ├── ColorRamp.tsx         # Temperature color scale
│   ├── ZoneDetail.tsx        # Zone inspection panel
│   └── AnimatedNumber.tsx    # Spring-animated numbers
├── store/
│   └── uhiStore.ts           # Zustand global state
├── types/
│   └── uhi.ts                # TypeScript types & cooling model definitions
└── utils/
    └── uhi.ts                # UHI calculation logic
```

---

## How It Works

Each city zone has:
- **Urbanization Factor** — how built-up the area is (0–1)
- **Green Cover** — vegetation percentage (0–1)
- **Albedo** — surface reflectivity

The base UHI intensity is calculated as:

```
ΔT = T_max × f_urban × (1 − g_cover) × (1 − α × 0.3)
```

The selected cooling model then adjusts the post-intervention temperature based on green cover and the cooling coefficient.

---

## Deployment

Deployed on **Vercel** via GitHub integration. Any push to `main` auto-deploys.
*Built with React + Vite + Tailwind CSS*
