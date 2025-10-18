import { create } from 'zustand';
import { WaterAnalysisResult } from '@/hooks/useWaterAnalysis';

interface AgricultureStats {
  totalSurface: number;
  culturesBreakdown: Array<{
    type: string;
    surface: number;
    rendement: number;
    parcelles: number;
  }>;
  averageYield: number;
  totalParcelles: number;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  forecast: Array<{
    date: string;
    temperature: number;
    precipitation: number;
  }>;
}

interface AnalysisState {
  currentAnalysis: WaterAnalysisResult | null;
  agricultureStats: AgricultureStats | null;
  weatherData: WeatherData | null;
  analysisHistory: Array<{
    id: string;
    timestamp: Date;
    region: string;
    analysis: WaterAnalysisResult;
    agricultureStats: AgricultureStats;
  }>;
  setCurrentAnalysis: (analysis: WaterAnalysisResult) => void;
  setAgricultureStats: (stats: AgricultureStats) => void;
  setWeatherData: (weather: WeatherData) => void;
  addToHistory: (analysis: WaterAnalysisResult, stats: AgricultureStats, region: string) => void;
  clearAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysis: null,
  agricultureStats: null,
  weatherData: null,
  analysisHistory: [],

  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  
  setAgricultureStats: (stats) => set({ agricultureStats: stats }),
  
  setWeatherData: (weather) => set({ weatherData: weather }),
  
  addToHistory: (analysis, stats, region) => set((state) => ({
    analysisHistory: [
      {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        region,
        analysis,
        agricultureStats: stats,
      },
      ...state.analysisHistory.slice(0, 9), // Garder 10 dernières analyses
    ],
  })),
  
  clearAnalysis: () => set({
    currentAnalysis: null,
    agricultureStats: null,
  }),
}));
