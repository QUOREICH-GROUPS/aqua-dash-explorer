import { create } from 'zustand';

export type WaterBodyType = 'all' | 'lake' | 'river' | 'reservoir' | 'wetland';

interface FilterState {
  region: string;
  period: string;
  waterBodyType: WaterBodyType;
  setRegion: (region: string) => void;
  setPeriod: (period: string) => void;
  setWaterBodyType: (type: WaterBodyType) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  region: 'all',
  period: 'current',
  waterBodyType: 'all',
  setRegion: (region) => set({ region }),
  setPeriod: (period) => set({ period }),
  setWaterBodyType: (waterBodyType) => set({ waterBodyType }),
  resetFilters: () => set({ 
    region: 'all', 
    period: 'current', 
    waterBodyType: 'all' 
  }),
}));
