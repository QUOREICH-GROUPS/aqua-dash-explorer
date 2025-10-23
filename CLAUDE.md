# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AquaDash Explorer is a water resource analysis application for Burkina Faso built with React, TypeScript, Vite, and ArcGIS. It provides interactive 3D mapping, agricultural zone visualization, and water body analysis using AI-powered insights.

**Tech Stack:**
- Vite + React + TypeScript + SWC
- shadcn/ui + Tailwind CSS
- ArcGIS JS API 4.33+ (@arcgis/core)
- Supabase (Edge Functions, client)
- Zustand (state management)
- React Query (@tanstack/react-query)
- Chart.js + Recharts

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### State Management (Zustand Stores)

The application uses three global stores located in `src/stores/`:

1. **filterStore** (`src/stores/filterStore.ts`) - Manages map filters:
   - `region`: Selected administrative region
   - `period`: Time period for analysis
   - `waterBodyType`: Type of water body (lake, river, reservoir, wetland, all)

2. **analysisStore** (`src/stores/analysisStore.ts`) - Manages water analysis results:
   - `currentAnalysis`: Current water analysis result
   - `agricultureStats`: Agricultural statistics for the selected area
   - `weatherData`: Weather data and forecasts
   - `analysisHistory`: Last 10 analyses performed

3. **mapStore** (`src/stores/mapStore.ts`) - Manages ArcGIS map state:
   - `view`: SceneView instance from ArcGIS
   - `selectedWaterBodyId`: Currently selected water body
   - `zoomToLocation()`: Animated zoom to coordinates

### ArcGIS Integration

The main map component is `src/components/map/WaterMap.tsx`. It initializes:

- **SceneView**: 3D view centered on Burkina Faso (lon: -1.5584, lat: 12.2395, z: 1000000)
- **Layers**:
  - `regionsLayer`: World Administrative Divisions filtered for Burkina Faso regions
  - `agricultureLayer`: Custom FeatureLayer with 5 agricultural zones (Maïs, Coton, Riz, Mil, Sorgho)
  - `graphicsLayer`: User-drawn geometries (points, lines, polygons)
  - `bufferLayer`: Buffer zones around user-drawn geometries
- **SketchViewModel**: Enables drawing tools with configurable buffer size (100-5000m)

### Supabase Edge Function

The water analysis is powered by a Deno-based Edge Function at `supabase/functions/water-analysis-ai/index.ts`:

- **Input**: Geometry (point/polygon) and analysis parameters
- **Process**:
  - Calculates geometry center point
  - Identifies intersecting agricultural zones
  - Fetches real-time weather data from Open-Meteo API
  - Generates analysis results with surface area, NDWI, anomalies, forecasts, alerts, and suggestions
- **Output**: Combined water analysis + agriculture stats + weather data

The function is invoked via the `useWaterAnalysis` hook (`src/hooks/useWaterAnalysis.ts`).

### Routing

Routes are defined in `src/App.tsx`:
- `/` - Dashboard/Index page
- `/map` - Interactive map page
- `*` - 404 Not Found page

**Important**: Add all custom routes ABOVE the catch-all `*` route.

### Component Structure

- `src/components/ui/` - shadcn/ui components (auto-generated, modify with caution)
- `src/components/map/` - Map-specific components:
  - `WaterMap.tsx`: Main 3D map with ArcGIS
  - `AnalysisPanel.tsx`: Displays water analysis results
  - `MapControls.tsx`: Map interaction controls
  - `WeatherWidget.tsx`: Weather display widget
- `src/components/dashboard/` - Dashboard components for stats and charts
- `src/components/layout/` - Layout components (Header, Footer, Sidebar, MainLayout)

### Data Flow

1. User draws geometry on map (WaterMap component)
2. User clicks "Analyser avec IA" button
3. `handleAnalyze()` calls `analyzeWaterBody()` from `useWaterAnalysis` hook
4. Hook invokes Supabase Edge Function `water-analysis-ai`
5. Edge Function:
   - Calculates geometry center
   - Identifies agricultural zones
   - Fetches weather data from Open-Meteo API
   - Returns comprehensive analysis
6. Results stored in `analysisStore` (current analysis + history)
7. UI components react to store updates and display results

## Important Patterns

### TypeScript Path Aliases

Use `@/` prefix for imports from `src/`:
```typescript
import { Button } from '@/components/ui/button';
import { useFilterStore } from '@/stores/filterStore';
```

### ArcGIS Module Loading

ArcGIS modules are imported from `@arcgis/core`:
```typescript
import SceneView from '@arcgis/core/views/SceneView';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
```

### Environment Variables

Required environment variables in `.env`:
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

Access with `import.meta.env.VITE_*` (Vite convention).

### Supabase Edge Function Development

Edge Functions run on Deno, not Node.js:
- Use Deno imports: `https://deno.land/std@0.168.0/...`
- No npm packages; use Deno-compatible imports
- CORS headers required for browser access
- Handle OPTIONS preflight requests

## Geographic Context

Application is specifically designed for **Burkina Faso**:
- Country ISO code: `BFA`
- Central coordinates: lon -1.5584, lat 12.2395
- Administrative regions displayed via ArcGIS World Administrative Divisions
- 5 agricultural zones with realistic geographic bounds:
  - Centre (Ouagadougou): Maïs
  - Est (Fada N'Gourma): Coton
  - Hauts-Bassins (Bobo-Dioulasso): Riz
  - Centre-Nord (Kaya): Mil
  - Sud-Ouest (Gaoua): Sorgho

## UI/UX Notes

- Lovable platform integration (`lovable-tagger` plugin active in dev mode)
- Dark/light theme support via `next-themes`
- Responsive design with Tailwind CSS
- Toast notifications via `sonner` and custom toast hook
- Charts via Chart.js and Recharts
- Icons from `lucide-react`

## Testing & Quality

ESLint configuration in `eslint.config.js` with React-specific rules. TypeScript strict mode is relaxed:
- `noImplicitAny: false`
- `strictNullChecks: false`
- `noUnusedParameters: false`
- `noUnusedLocals: false`
