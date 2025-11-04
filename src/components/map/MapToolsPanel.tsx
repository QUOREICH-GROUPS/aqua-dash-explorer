import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Circle, Square, PenTool, Trash2 } from 'lucide-react';
import { LayersControl } from './LayersControl';
import { InteractiveLegend } from './InteractiveLegend';
import { MeasurementTools } from './MeasurementTools';
import { MapControls } from './MapControls';
import { WeatherWidget } from './WeatherWidget';
import { AnalysisPanel } from './AnalysisPanel';
import SceneView from '@arcgis/core/views/SceneView';
import Graphic from '@arcgis/core/Graphic';

interface MapToolsPanelProps {
  view: SceneView | null;
  bufferSize: number[];
  onBufferSizeChange: (value: number[]) => void;
  onDrawPoint: () => void;
  onDrawPolyline: () => void;
  onDrawPolygon: () => void;
  onClear: () => void;
  selectedFeatures: Graphic[];
  region: string;
  waterBodyType: string;
  result: any;
  isAnalyzing: boolean;
}

export const MapToolsPanel = ({
  view,
  bufferSize,
  onBufferSizeChange,
  onDrawPoint,
  onDrawPolyline,
  onDrawPolygon,
  onClear,
  selectedFeatures,
  region,
  waterBodyType,
  result,
  isAnalyzing,
}: MapToolsPanelProps) => {
  return (
    <div className="space-y-4">
      <LayersControl view={view} />
      
      <InteractiveLegend />
      
      <MeasurementTools view={view} />
      
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
              onClick={onDrawPoint}
              className="flex-col h-auto py-3"
            >
              <Circle className="h-5 w-5 mb-1" />
              <span className="text-xs">Point</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDrawPolyline}
              className="flex-col h-auto py-3"
            >
              <PenTool className="h-5 w-5 mb-1" />
              <span className="text-xs">Ligne</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDrawPolygon}
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
              onValueChange={onBufferSizeChange}
              min={100}
              max={5000}
              step={100}
              className="w-full"
            />
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={onClear}
            className="w-full gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Effacer tout
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Géométries</CardTitle>
          <CardDescription className="text-muted-foreground">
            Éléments dessinés
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
              Aucune géométrie dessinée
            </p>
          )}

          <div className="mt-4 p-3 rounded bg-muted/30 border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Filtres actifs
            </p>
            <div className="space-y-1">
              <p className="text-sm text-foreground capitalize">
                {region === 'all' ? 'Toutes les régions' : region}
              </p>
              <p className="text-xs text-muted-foreground">
                {waterBodyType === 'all' ? 'Tous types' : waterBodyType}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <MapControls />

      <WeatherWidget />

      <AnalysisPanel result={result} isAnalyzing={isAnalyzing} />
    </div>
  );
};
