import { create } from 'zustand';
import SceneView from '@arcgis/core/views/SceneView';

interface MapState {
  view: SceneView | null;
  selectedWaterBodyId: string | null;
  setView: (view: SceneView | null) => void;
  setSelectedWaterBodyId: (id: string | null) => void;
  zoomToLocation: (latitude: number, longitude: number) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  view: null,
  selectedWaterBodyId: null,
  
  setView: (view) => set({ view }),
  
  setSelectedWaterBodyId: (id) => set({ selectedWaterBodyId: id }),
  
  zoomToLocation: (latitude, longitude) => {
    const { view } = get();
    if (view) {
      view.goTo({
        center: [longitude, latitude],
        zoom: 12,
        tilt: 45
      }, {
        duration: 2000,
        easing: 'ease-in-out'
      });
    }
  }
}));
