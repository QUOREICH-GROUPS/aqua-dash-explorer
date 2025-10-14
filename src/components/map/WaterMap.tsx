import { useEffect, useRef, useState } from 'react';
import SceneView from '@arcgis/core/views/SceneView';
import Map from '@arcgis/core/Map';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Graphic from '@arcgis/core/Graphic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Circle, Square, PenTool } from 'lucide-react';
import { useFilterStore } from '@/stores/filterStore';

export const WaterMap = () => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<SceneView | null>(null);
  const [sketchVM, setSketchVM] = useState<SketchViewModel | null>(null);
  const [bufferSize, setBufferSize] = useState([500]);
  const [selectedFeatures, setSelectedFeatures] = useState<Graphic[]>([]);
  const { region } = useFilterStore();

  useEffect(() => {
    if (!mapDiv.current) return;

    // Create graphics layers
    const graphicsLayer = new GraphicsLayer({ title: 'Sketches' });
    const bufferLayer = new GraphicsLayer({ title: 'Buffers' });

    // Create map
    const map = new Map({
      basemap: 'hybrid',
      ground: 'world-elevation',
      layers: [bufferLayer, graphicsLayer],
    });

    // Create 3D scene view
    const sceneView = new SceneView({
      container: mapDiv.current,
      map: map,
      camera: {
        position: {
          longitude: 2.3522,
          latitude: 48.8566,
          z: 500000,
        },
        tilt: 45,
      },
      qualityProfile: 'high',
    });

    // Initialize SketchViewModel
    const sketch = new SketchViewModel({
      view: sceneView,
      layer: graphicsLayer,
      creationMode: 'single',
      polygonSymbol: {
        type: 'simple-fill',
        color: [0, 150, 200, 0.3],
        outline: {
          color: [0, 150, 200],
          width: 2,
        },
      },
      polylineSymbol: {
        type: 'simple-line',
        color: [0, 150, 200],
        width: 3,
      },
      pointSymbol: {
        type: 'simple-marker',
        color: [0, 150, 200],
        size: 12,
        outline: {
          color: [255, 255, 255],
          width: 2,
        },
      },
    });

    // Handle sketch create events
    sketch.on('create', (event) => {
      if (event.state === 'complete') {
        const geometry = event.graphic.geometry;
        if (geometry) {
          // Create buffer
          const buffer = geometryEngine.buffer(geometry, bufferSize[0], 'meters');
          if (buffer && !Array.isArray(buffer)) {
            const bufferGraphic = new Graphic({
              geometry: buffer,
              symbol: {
                type: 'simple-fill',
                color: [255, 100, 100, 0.2],
                outline: {
                  color: [255, 100, 100],
                  width: 1,
                  style: 'dash',
                },
              },
            });
            bufferLayer.add(bufferGraphic);
          }
        }
      }
    });

    // Handle selection
    sceneView.on('click', (event) => {
      sceneView.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const graphics = response.results
            .filter((result) => result.type === 'graphic')
            .map((result: any) => result.graphic);
          
          setSelectedFeatures(graphics);

          // Highlight selected features
          graphics.forEach((graphic) => {
            sceneView.whenLayerView(graphic.layer).then((layerView: any) => {
              if (layerView.highlight) {
                layerView.highlight(graphic);
              }
            });
          });
        }
      });
    });

    setView(sceneView);
    setSketchVM(sketch);

    return () => {
      sceneView.destroy();
    };
  }, []);

  // Update buffer when slider changes
  useEffect(() => {
    if (!sketchVM || !view) return;

    const layer = view.map.layers.find((l) => l.title === 'Buffers') as GraphicsLayer;
    if (layer) {
      layer.removeAll();
      
      const graphicsLayer = view.map.layers.find((l) => l.title === 'Sketches') as GraphicsLayer;
      graphicsLayer?.graphics.forEach((graphic) => {
        const buffer = geometryEngine.buffer(graphic.geometry, bufferSize[0], 'meters');
        if (buffer && !Array.isArray(buffer)) {
          const bufferGraphic = new Graphic({
            geometry: buffer,
            symbol: {
              type: 'simple-fill',
              color: [255, 100, 100, 0.2],
              outline: {
                color: [255, 100, 100],
                width: 1,
                style: 'dash',
              },
            },
          });
          layer.add(bufferGraphic);
        }
      });
    }
  }, [bufferSize, sketchVM, view]);

  const handleDrawPoint = () => {
    sketchVM?.create('point');
  };

  const handleDrawPolyline = () => {
    sketchVM?.create('polyline');
  };

  const handleDrawPolygon = () => {
    sketchVM?.create('polygon');
  };

  const handleClear = () => {
    if (view) {
      const graphicsLayer = view.map.layers.find((l) => l.title === 'Sketches') as GraphicsLayer;
      const bufferLayer = view.map.layers.find((l) => l.title === 'Buffers') as GraphicsLayer;
      graphicsLayer?.removeAll();
      bufferLayer?.removeAll();
      setSelectedFeatures([]);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card className="shadow-soft overflow-hidden">
          <div ref={mapDiv} className="h-[600px] w-full" />
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Outils de dessin</CardTitle>
            <CardDescription className="text-muted-foreground">
              Dessinez des formes sur la carte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDrawPoint}
                className="flex-col h-auto py-3"
              >
                <Circle className="h-5 w-5 mb-1" />
                <span className="text-xs">Point</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDrawPolyline}
                className="flex-col h-auto py-3"
              >
                <PenTool className="h-5 w-5 mb-1" />
                <span className="text-xs">Ligne</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDrawPolygon}
                className="flex-col h-auto py-3"
              >
                <Square className="h-5 w-5 mb-1" />
                <span className="text-xs">Polygone</span>
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Buffer (m)
                </label>
                <Badge variant="secondary" className="font-mono">
                  {bufferSize[0]}m
                </Badge>
              </div>
              <Slider
                value={bufferSize}
                onValueChange={setBufferSize}
                min={100}
                max={5000}
                step={100}
                className="w-full"
              />
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleClear}
              className="w-full gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Effacer tout
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Résultats</CardTitle>
            <CardDescription className="text-muted-foreground">
              Géométries sélectionnées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedFeatures.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {selectedFeatures.length} élément(s) sélectionné(s)
                </p>
                <div className="space-y-1">
                  {selectedFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="p-2 rounded bg-secondary/30 text-sm"
                    >
                      Type: {feature.geometry.type}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune sélection
              </p>
            )}

            <div className="mt-4 p-3 rounded bg-muted/30 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Région active
              </p>
              <p className="text-sm font-semibold text-foreground capitalize">
                {region === 'all' ? 'Toutes les régions' : region}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
