# Cargo Lab

**Experimental Concept Project**

> This project is an experimental showcase of creative UI/UX ideas, interactive visualizations, and advanced frontend engineering. It is not intended for production use, but to demonstrate novel approaches to data visualization and user interaction in a modern frontend stack.

---

## Overview

Cargo Lab is a highly interactive, visually rich experimental frontend app simulating aspects of global cargo shipping. It features real-time animated data visualizations, creative UI panels, and modular architecture, all built with SolidJS and modern web tooling. The app demonstrates:

- Animated world maps with live cargo movement
- Interactive cargo bay management
- AI-inspired visualizations and stats
- Modular, reusable charting components
- Responsive, modern UI/UX patterns

---

## Features (Extracted from Code)

- **Animated Global Cargo Tracker**: 3D globe visualization with real-time cargo movements, interactive tooltips, and zoom/rotate controls (using D3, d3-geo, topojson).
- **Cargo Bay Manager**: Interactive grid for simulating container placement, slot selection, and container stacking logic.
- **AI Brain Visualization**: Animated, canvas-based sphere with "nodes" representing AI activity, including stats and dynamic tooltips.
- **Insight Panel**: Live shipment statistics, on-time percentages, and AI-generated insight messages.
- **Reusable Chart Components**: Donut and bar charts (D3-powered), used throughout the app for visual stats.
- **Responsive Layout**: Custom header, navigation, and layout components.
- **Mock Data Services**: Simulated cargo data, ports, and transit logic for realistic demo.
- **Custom Hooks**: Utilities for measuring and theming UI components.
- **Modern CSS Modules**: Isolated, themeable styles for all major components.

---

## Tech Stack (Deduced from Project Files)

- **Framework**: [SolidJS](https://solidjs.com/) (SPA, reactive UI)
- **Router**: `@solidjs/router`
- **Build Tool**: [Vite](https://vitejs.dev/) with `vite-plugin-solid`
- **Type Checking**: TypeScript
- **Data Visualization**: [D3.js](https://d3js.org/), [d3-geo](https://github.com/d3/d3-geo), [topojson-client](https://github.com/topojson/topojson-client)
- **Styles**: CSS Modules, global CSS
- **Project Structure**: Modular, feature-first (pages, components, charts, services, hooks, assets)

---

## Pages & Modules

### Main Pages

- **Home (`/`)**
  - Hero section, animated stats, and live insights panel
  - Entry point for visualizing cargo activity and stats

- **Cargo (`/cargo`)**
  - Interactive cargo bay grid for simulating container placement
  - Slot selection, container stacking, and tooltips for each bay

- **AI Brain (`/about`)**
  - Animated "AI Brain" canvas visualization
  - Dynamic node sphere, stats, and simulated AI reasoning

### Core Components

- **Header & Layout**: Navigation and page layout
- **Hero**: Home page hero section
- **Stats**: Visual summary of key metrics
- **InsightsPanel**: Live shipment stats, global map, and AI insights
- **AIBrainStats**: Stats for the AI Brain page
- **Card**: Reusable chart/stat container
- **Charts**: DonutChart, BarChart, GlobalMap (all D3-powered)

### Services & Utilities

- **cargoService**: Generates and animates mock cargo data, simulates movement between ports
- **Hooks**: `useMeasure`, `useTheme` for responsive and theme-aware UI
- **Assets**: World topojson, images, SVGs for globe and visualizations

### Styles

- CSS Modules for each major component (e.g., `AIBrain.module.css`, `Cargo.module.css`, etc.)
- Global styles for layout and resets

---

## How to Run

1. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```

2. **Start the development server:**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

3. **Build for production:**
   ```bash
   yarn build
   # or
   npm run build
   ```

4. **Preview production build:**
   ```bash
   yarn preview
   # or
   npm run preview
   ```

---

## Additional Insights

- **Architecture:**
  - Feature-first directory structure: `pages/`, `components/`, `charts/`, `services/`, `hooks/`, `assets/`, `styles/`
  - All data is mock/simulated for demo purposes; no real backend
  - Emphasis on animation, interactivity, and visual feedback
- **UI/UX Concepts:**
  - Animated transitions, tooltips, and responsive layouts
  - Canvas and SVG blending for high-performance visualizations
  - Modular, reusable component design
- **Limitations:**
  - Not production-ready; intended for UI/UX experimentation and inspiration
  - No authentication, persistence, or real data APIs

---

## License

This project is for experimental/demo use only. See LICENSE for details (if present).
