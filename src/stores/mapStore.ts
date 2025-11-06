import { create } from 'zustand';
import SceneView from '@arcgis/core/views/SceneView';

interface SegmentationResult {
  maskDataUrl: string;
  waterPercentage: number;
  processedImageUrl: string;
  originalDimensions: { width: number; height: number };
}

interface MapState {
  view: SceneView | null;
  selectedWaterBodyId: string | null;
  setView: (view: SceneView | null) => void;
  setSelectedWaterBodyId: (id: string | null) => void;
  zoomToLocation: (latitude: number, longitude: number) => void;
  addSegmentationToMap: (result: SegmentationResult, bounds: { lat: number; lng: number; width: number; height: number }) => void;
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
  },

  addSegmentationToMap: async (result, bounds) => {
    const { view } = get();
    if (!view) return;

    const [Graphic, Polygon, GraphicsLayer, MediaLayer, ExtentAndRotationGeoreference] = await Promise.all([
      import('@arcgis/core/Graphic'),
      import('@arcgis/core/geometry/Polygon'),
      import('@arcgis/core/layers/GraphicsLayer'),
      import('@arcgis/core/layers/MediaLayer'),
      import('@arcgis/core/layers/support/ExtentAndRotationGeoreference'),
    ]);

    // Find or create AI Segmentation layer
    let segmentationLayer = view.map.layers.find(
      (l) => l.title === 'AI Water Segmentation'
    ) as InstanceType<typeof GraphicsLayer.default>;

    if (!segmentationLayer) {
      segmentationLayer = new GraphicsLayer.default({
        title: 'AI Water Segmentation',
        listMode: 'show',
      });
      view.map.add(segmentationLayer);
    }

    // Create extent for the image based on provided bounds
    const halfWidth = bounds.width / 2;
    const halfHeight = bounds.height / 2;

    const extent = {
      xmin: bounds.lng - halfWidth,
      ymin: bounds.lat - halfHeight,
      xmax: bounds.lng + halfWidth,
      ymax: bounds.lat + halfHeight,
      spatialReference: { wkid: 4326 }
    };

    // Create a MediaLayer element for the segmented image
    const imageElement = {
      type: 'image',
      image: result.processedImageUrl,
      georeference: new ExtentAndRotationGeoreference.default({
        extent: extent
      })
    };

    // Create a polygon to show the boundary
    const polygon = new Polygon.default({
      rings: [[
        [extent.xmin, extent.ymin],
        [extent.xmax, extent.ymin],
        [extent.xmax, extent.ymax],
        [extent.xmin, extent.ymax],
        [extent.xmin, extent.ymin]
      ]],
      spatialReference: { wkid: 4326 }
    });

    // Create graphic for the boundary
    const graphic = new Graphic.default({
      geometry: polygon,
      symbol: {
        type: 'simple-fill',
        color: [0, 150, 255, 0.3],
        outline: {
          color: [0, 150, 255],
          width: 2
        }
      },
      attributes: {
        waterPercentage: result.waterPercentage,
        dimensions: `${result.originalDimensions.width}×${result.originalDimensions.height}`
      },
      popupTemplate: {
        title: 'Zone d\'eau détectée par IA',
        content: `
          <div>
            <p><strong>Couverture d'eau:</strong> ${result.waterPercentage.toFixed(2)}%</p>
            <p><strong>Dimensions:</strong> ${result.originalDimensions.width} × ${result.originalDimensions.height} px</p>
            <img src="${result.processedImageUrl}" style="width: 100%; margin-top: 10px; border-radius: 4px;" />
          </div>
        `
      }
    });

    segmentationLayer.add(graphic);

    // Zoom to the new graphic
    view.goTo({
      target: graphic,
      zoom: 14
    }, {
      duration: 1500
    });
  }
}));
