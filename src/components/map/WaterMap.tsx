import { useEffect, useRef, useState } from 'react';
import SceneView from '@arcgis/core/views/SceneView';
import Map from '@arcgis/core/Map';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import Geometry from '@arcgis/core/geometry/Geometry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Circle, Square, PenTool, Sparkles } from 'lucide-react';
import { useFilterStore } from '@/stores/filterStore';
import { useMapStore } from '@/stores/mapStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useWaterAnalysis } from '@/hooks/useWaterAnalysis';
import { AnalysisPanel } from './AnalysisPanel';
import { MapControls } from './MapControls';
import { WeatherWidget } from './WeatherWidget';
import { ZoneConfirmationDialog } from './ZoneConfirmationDialog';
import { LayersControl } from './LayersControl';
import { InteractiveLegend } from './InteractiveLegend';
import { MeasurementTools } from './MeasurementTools';

export const WaterMap = () => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<SceneView | null>(null);
  const [sketchVM, setSketchVM] = useState<SketchViewModel | null>(null);
  const [bufferSize, setBufferSize] = useState([500]);
  const [selectedFeatures, setSelectedFeatures] = useState<Graphic[]>([]);
  const [pendingGeometry, setPendingGeometry] = useState<Geometry | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { region, period, waterBodyType } = useFilterStore();
  const { setView: setMapView } = useMapStore();
  const { analyzeWaterBody, isAnalyzing, result } = useWaterAnalysis();
  const { setCurrentAnalysis, setAgricultureStats, setWeatherData, addToHistory } = useAnalysisStore();

  useEffect(() => {
    if (!mapDiv.current) return;

    // Create graphics layers
    const graphicsLayer = new GraphicsLayer({ title: 'Sketches' });
    const bufferLayer = new GraphicsLayer({ title: 'Buffers' });

    // Couches des limites administratives du Burkina Faso
    const regionsLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Administrative_Divisions/FeatureServer/0',
      title: 'Régions du Burkina Faso',
      definitionExpression: "COUNTRY = 'Burkina Faso'",
      opacity: 0.5,
      outFields: ['*'],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [0, 122, 194, 0.15],
          outline: {
            color: [0, 122, 194, 0.8],
            width: 2
          }
        }
      },
      popupTemplate: {
        title: 'Région: {NAME}',
        content: 'Région: {NAME}<br>Pays: {COUNTRY}',
      },
    });

    const provincesLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Administrative_Divisions/FeatureServer/0',
      title: 'Provinces du Burkina Faso',
      definitionExpression: "COUNTRY = 'Burkina Faso'",
      opacity: 0.4,
      visible: false,
      outFields: ['*'],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [76, 175, 80, 0.1],
          outline: {
            color: [76, 175, 80, 0.8],
            width: 1.5
          }
        }
      },
      popupTemplate: {
        title: 'Province: {NAME}',
        content: 'Province: {NAME}<br>Région: {PARENT}',
      },
    });

    const communesLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Administrative_Divisions/FeatureServer/0',
      title: 'Communes du Burkina Faso',
      definitionExpression: "COUNTRY = 'Burkina Faso'",
      opacity: 0.3,
      visible: false,
      outFields: ['*'],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [255, 152, 0, 0.08],
          outline: {
            color: [255, 152, 0, 0.6],
            width: 1
          }
        }
      },
      popupTemplate: {
        title: 'Commune: {NAME}',
        content: 'Commune: {NAME}<br>Province: {PARENT}',
      },
    });

    // Couche des routes principales (OpenStreetMap via ArcGIS)
    const roadsLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Transport_Service/FeatureServer/0',
      title: 'Routes Principales',
      definitionExpression: "COUNTRY = 'Burkina Faso'",
      opacity: 0.7,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: [255, 170, 0],
          width: 2
        }
      },
      visible: true,
    });

    // Couche des villes et localités
    const citiesLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Cities/FeatureServer/0',
      title: 'Villes',
      definitionExpression: "CNTRY_NAME = 'Burkina Faso'",
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          color: [255, 255, 255],
          size: 8,
          outline: {
            color: [0, 122, 194],
            width: 2
          }
        }
      },
      labelingInfo: [{
        labelExpressionInfo: { expression: "$feature.CITY_NAME" },
        symbol: {
          type: 'text',
          color: [255, 255, 255],
          haloColor: [0, 0, 0],
          haloSize: 1,
          font: {
            size: 10,
            weight: 'bold'
          }
        }
      }],
      popupTemplate: {
        title: '{CITY_NAME}',
        content: 'Population: {POP}<br>Rang: {POP_RANK}',
      },
    });

    // Couche des rivières et cours d'eau
    const riversLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Hydro_Reference_Overlay/FeatureServer/0',
      title: 'Rivières et Cours d\'eau',
      definitionExpression: "1=1",
      opacity: 0.8,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: [0, 191, 255],
          width: 2,
          style: 'solid'
        }
      },
      popupTemplate: {
        title: 'Cours d\'eau',
        content: 'Type: {TYPE}<br>Nom: {NAME}',
      },
    });

    // Couche d'occupation du sol (ESA WorldCover)
    const landCoverLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/ESA_WorldCover_2021_v200/FeatureServer/0',
      title: 'Occupation du Sol',
      opacity: 0.6,
      visible: false,
      popupTemplate: {
        title: 'Occupation du sol',
        content: 'Type: {LANDCOVER_TYPE}<br>Description: {DESCRIPTION}',
      },
    });

    // Couche de densité de population (WorldPop estimations)
    const populationLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Population_Density/FeatureServer/0',
      title: 'Densité de Population',
      definitionExpression: "CNTRY_NAME = 'Burkina Faso'",
      opacity: 0.6,
      visible: false,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [255, 0, 0, 0.3],
          outline: {
            color: [255, 0, 0, 0.5],
            width: 0.5
          }
        }
      },
      popupTemplate: {
        title: 'Densité de population',
        content: 'Population: {POP}<br>Densité: {DENSITY} hab/km²',
      },
    });

    // Zones de production agricole du Burkina Faso - géométries réalistes basées sur les régions
    const agricultureLayer = new FeatureLayer({
      source: [
        // Zone Centre - Maïs (autour d'Ouagadougou)
        new Graphic({
          geometry: new Polygon({
            rings: [[[-1.7, 12.5], [-1.3, 12.5], [-1.3, 12.1], [-1.7, 12.1], [-1.7, 12.5]]],
            spatialReference: { wkid: 4326 },
          }),
          attributes: { ObjectID: 1, type_culture: 'Maïs', rendement_moyen: 2.8, superficie_ha: 12500 },
        }),
        // Zone Est - Coton (région de Fada N'Gourma)
        new Graphic({
          geometry: new Polygon({
            rings: [[[0.2, 11.5], [1.2, 11.5], [1.2, 11.0], [0.2, 11.0], [0.2, 11.5]]],
            spatialReference: { wkid: 4326 },
          }),
          attributes: { ObjectID: 2, type_culture: 'Coton', rendement_moyen: 1.8, superficie_ha: 15200 },
        }),
        // Zone Hauts-Bassins - Riz (région de Bobo-Dioulasso)
        new Graphic({
          geometry: new Polygon({
            rings: [[[-4.8, 11.4], [-4.0, 11.4], [-4.0, 10.8], [-4.8, 10.8], [-4.8, 11.4]]],
            spatialReference: { wkid: 4326 },
          }),
          attributes: { ObjectID: 3, type_culture: 'Riz', rendement_moyen: 3.2, superficie_ha: 8900 },
        }),
        // Zone Centre-Nord - Mil (région de Kaya)
        new Graphic({
          geometry: new Polygon({
            rings: [[[-2.0, 13.5], [-1.0, 13.5], [-1.0, 12.8], [-2.0, 12.8], [-2.0, 13.5]]],
            spatialReference: { wkid: 4326 },
          }),
          attributes: { ObjectID: 4, type_culture: 'Mil', rendement_moyen: 1.2, superficie_ha: 18700 },
        }),
        // Zone Sud-Ouest - Sorgho (région de Gaoua)
        new Graphic({
          geometry: new Polygon({
            rings: [[[-3.5, 11.2], [-2.5, 11.2], [-2.5, 10.5], [-3.5, 10.5], [-3.5, 11.2]]],
            spatialReference: { wkid: 4326 },
          }),
          attributes: { ObjectID: 5, type_culture: 'Sorgho', rendement_moyen: 1.5, superficie_ha: 10300 },
        }),
      ],
      objectIdField: 'ObjectID',
      geometryType: 'polygon',
      spatialReference: { wkid: 4326 },
      title: 'Zones de Production Agricole',
      fields: [
        { name: 'ObjectID', type: 'oid' },
        { name: 'type_culture', type: 'string' },
        { name: 'rendement_moyen', type: 'double' },
        { name: 'superficie_ha', type: 'double' },
      ],
      renderer: {
        type: 'unique-value',
        field: 'type_culture',
        uniqueValueInfos: [
          {
            value: 'Maïs',
            symbol: {
              type: 'simple-fill',
              color: [255, 235, 59, 0.6],
              outline: { color: [255, 193, 7], width: 1 },
            },
          },
          {
            value: 'Mil',
            symbol: {
              type: 'simple-fill',
              color: [205, 220, 57, 0.6],
              outline: { color: [175, 180, 43], width: 1 },
            },
          },
          {
            value: 'Coton',
            symbol: {
              type: 'simple-fill',
              color: [255, 255, 255, 0.7],
              outline: { color: [200, 200, 200], width: 1 },
            },
          },
          {
            value: 'Riz',
            symbol: {
              type: 'simple-fill',
              color: [76, 175, 80, 0.6],
              outline: { color: [56, 142, 60], width: 1 },
            },
          },
          {
            value: 'Sorgho',
            symbol: {
              type: 'simple-fill',
              color: [255, 152, 0, 0.6],
              outline: { color: [230, 81, 0], width: 1 },
            },
          },
        ],
      },
      popupTemplate: {
        title: 'Zone de production: {type_culture}',
        content: [
          {
            type: 'fields',
            fieldInfos: [
              { fieldName: 'type_culture', label: 'Type de culture' },
              { fieldName: 'rendement_moyen', label: 'Rendement moyen (t/ha)' },
              { fieldName: 'superficie_ha', label: 'Superficie (ha)' },
            ],
          },
        ],
      },
    });

    // Create map with all layers
    const map = new Map({
      basemap: 'satellite',
      ground: 'world-elevation',
      layers: [
        populationLayer,
        landCoverLayer,
        communesLayer,
        provincesLayer,
        regionsLayer,
        riversLayer,
        roadsLayer,
        citiesLayer,
        agricultureLayer,
        bufferLayer,
        graphicsLayer
      ],
    });

    // Vue 3D centrée sur le Burkina Faso avec coordonnées géographiques précises
    const sceneView = new SceneView({
      container: mapDiv.current,
      map: map,
      camera: {
        position: {
          longitude: -1.5584, // Longitude centrale du Burkina Faso
          latitude: 12.2395,  // Latitude centrale du Burkina Faso
          z: 1000000 // Altitude pour voir tout le pays (1000 km)
        },
        tilt: 45,
        heading: 0
      },
      qualityProfile: 'high'
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
          
          // Show confirmation dialog
          setPendingGeometry(geometry);
          setShowConfirmDialog(true);
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
    setMapView(sceneView);

    return () => {
      sceneView.destroy();
      setMapView(null);
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

  const handleConfirmAnalysis = async () => {
    setShowConfirmDialog(false);
    
    if (!pendingGeometry) return;

    const analysisResult = await analyzeWaterBody(pendingGeometry, {
      region,
      period,
      waterBodyType,
      bufferSize: bufferSize[0],
    });

    if (analysisResult) {
      setCurrentAnalysis(analysisResult);
      
      if (analysisResult.agricultureStats) {
        setAgricultureStats(analysisResult.agricultureStats);
      }
      
      if (analysisResult.weatherData) {
        setWeatherData(analysisResult.weatherData);
      }
      
      if (analysisResult.agricultureStats) {
        addToHistory(analysisResult, analysisResult.agricultureStats, region);
      }
    }
    
    setPendingGeometry(null);
  };

  const handleCancelAnalysis = () => {
    setShowConfirmDialog(false);
    setPendingGeometry(null);
    handleClear();
  };

  return (
    <>
      <ZoneConfirmationDialog
        open={showConfirmDialog}
        geometry={pendingGeometry}
        onConfirm={handleConfirmAnalysis}
        onCancel={handleCancelAnalysis}
      />
      
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
        <Card className="shadow-soft overflow-hidden">
          <div ref={mapDiv} className="h-[600px] w-full" />
        </Card>
      </div>

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
    </div>
    </>
  );
};
