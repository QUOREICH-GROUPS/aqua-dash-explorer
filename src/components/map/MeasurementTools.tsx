import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ruler, Square, Trash2 } from 'lucide-react';
import SceneView from '@arcgis/core/views/SceneView';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Graphic from '@arcgis/core/Graphic';

interface MeasurementToolsProps {
  view: SceneView | null;
}

export const MeasurementTools = ({ view }: MeasurementToolsProps) => {
  const [measurementLayer] = useState<GraphicsLayer>(
    new GraphicsLayer({ title: 'Measurements' })
  );
  const [sketchVM, setSketchVM] = useState<SketchViewModel | null>(null);
  const [measurements, setMeasurements] = useState<{
    distance?: number;
    area?: number;
  }>({});
  const [isActive, setIsActive] = useState(false);

  const initializeSketch = () => {
    if (!view) return;

    // Ajouter la couche si elle n'existe pas
    if (!view.map.layers.includes(measurementLayer)) {
      view.map.add(measurementLayer);
    }

    const sketch = new SketchViewModel({
      view: view,
      layer: measurementLayer,
      creationMode: 'single',
      polylineSymbol: {
        type: 'simple-line',
        color: [255, 165, 0],
        width: 3,
        style: 'solid',
      },
      polygonSymbol: {
        type: 'simple-fill',
        color: [255, 165, 0, 0.2],
        outline: {
          color: [255, 165, 0],
          width: 2,
        },
      },
    });

    sketch.on('create', (event) => {
      if (event.state === 'complete') {
        const geometry = event.graphic.geometry;
        if (geometry.type === 'polyline') {
          const length = geometryEngine.geodesicLength(geometry, 'kilometers');
          setMeasurements({ distance: length });
          
          // Ajouter un label
          const midpoint = geometry.extent.center;
          const textGraphic = new Graphic({
            geometry: midpoint,
            symbol: {
              type: 'text',
              color: [255, 165, 0],
              text: `${length.toFixed(2)} km`,
              font: {
                size: 12,
                weight: 'bold',
              },
              haloColor: [0, 0, 0],
              haloSize: 1,
            },
          });
          measurementLayer.add(textGraphic);
        } else if (geometry.type === 'polygon') {
          const area = geometryEngine.geodesicArea(geometry, 'hectares');
          setMeasurements({ area });
          
          // Ajouter un label
          const centroid = geometry.extent.center;
          const textGraphic = new Graphic({
            geometry: centroid,
            symbol: {
              type: 'text',
              color: [255, 165, 0],
              text: `${area.toFixed(2)} ha`,
              font: {
                size: 12,
                weight: 'bold',
              },
              haloColor: [0, 0, 0],
              haloSize: 1,
            },
          });
          measurementLayer.add(textGraphic);
        }
      }
    });

    setSketchVM(sketch);
  };

  const measureDistance = () => {
    if (!view) return;
    if (!sketchVM) {
      initializeSketch();
    }
    setIsActive(true);
    setMeasurements({});
    sketchVM?.create('polyline');
  };

  const measureArea = () => {
    if (!view) return;
    if (!sketchVM) {
      initializeSketch();
    }
    setIsActive(true);
    setMeasurements({});
    sketchVM?.create('polygon');
  };

  const clearMeasurements = () => {
    measurementLayer.removeAll();
    setMeasurements({});
    setIsActive(false);
    if (sketchVM) {
      sketchVM.cancel();
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Outils de mesure
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Mesurez les distances et surfaces
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={isActive && !measurements.area ? 'default' : 'outline'}
            className="gap-2"
            onClick={measureDistance}
          >
            <Ruler className="h-4 w-4" />
            Distance
          </Button>
          <Button
            variant={isActive && !measurements.distance ? 'default' : 'outline'}
            className="gap-2"
            onClick={measureArea}
          >
            <Square className="h-4 w-4" />
            Surface
          </Button>
        </div>

        {(measurements.distance || measurements.area) && (
          <div className="space-y-2 p-3 rounded bg-muted/30 border border-border">
            <h4 className="text-sm font-semibold text-foreground">Résultats</h4>
            {measurements.distance && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Distance</span>
                <Badge variant="secondary">
                  {measurements.distance.toFixed(2)} km
                </Badge>
              </div>
            )}
            {measurements.area && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Surface</span>
                <Badge variant="secondary">
                  {measurements.area.toFixed(2)} ha
                </Badge>
              </div>
            )}
          </div>
        )}

        <Button
          variant="destructive"
          className="w-full gap-2"
          onClick={clearMeasurements}
          disabled={!isActive && measurements.distance === undefined && measurements.area === undefined}
        >
          <Trash2 className="h-4 w-4" />
          Effacer les mesures
        </Button>

        <div className="p-3 rounded bg-secondary/20 border border-border">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Astuce:</strong> Cliquez sur la carte pour commencer à mesurer. 
            Double-cliquez pour terminer la mesure.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};