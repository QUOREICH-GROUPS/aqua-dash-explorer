import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Layers, MapPin, Navigation, Droplets, Map as MapIcon, Users } from 'lucide-react';
import SceneView from '@arcgis/core/views/SceneView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

interface LayersControlProps {
  view: SceneView | null;
}

export const LayersControl = ({ view }: LayersControlProps) => {
  const [layers, setLayers] = useState({
    regions: true,
    provinces: false,
    communes: false,
    routes: true,
    villes: true,
    rivieres: true,
    agriculture: true,
    occupation: false,
    population: false,
  });

  useEffect(() => {
    if (!view) return;

    const updateLayerVisibility = (layerTitle: string, visible: boolean) => {
      const layer = view.map.layers.find(l => l.title === layerTitle);
      if (layer) {
        layer.visible = visible;
      }
    };

    updateLayerVisibility('Régions du Burkina Faso', layers.regions);
    updateLayerVisibility('Provinces du Burkina Faso', layers.provinces);
    updateLayerVisibility('Communes du Burkina Faso', layers.communes);
    updateLayerVisibility('Routes Principales', layers.routes);
    updateLayerVisibility('Villes', layers.villes);
    updateLayerVisibility('Rivières et Cours d\'eau', layers.rivieres);
    updateLayerVisibility('Zones de Production Agricole', layers.agriculture);
    updateLayerVisibility('Occupation du Sol', layers.occupation);
    updateLayerVisibility('Densité de Population', layers.population);
  }, [layers, view]);

  const handleLayerToggle = (layerKey: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Couches cartographiques
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Activez/désactivez les couches d'informations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Limites administratives */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MapIcon className="h-4 w-4" />
            Limites administratives
          </h4>
          <div className="space-y-2 pl-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="regions" className="text-sm cursor-pointer">
                Régions
              </Label>
              <Switch
                id="regions"
                checked={layers.regions}
                onCheckedChange={() => handleLayerToggle('regions')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="provinces" className="text-sm cursor-pointer">
                Provinces
              </Label>
              <Switch
                id="provinces"
                checked={layers.provinces}
                onCheckedChange={() => handleLayerToggle('provinces')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="communes" className="text-sm cursor-pointer">
                Communes
              </Label>
              <Switch
                id="communes"
                checked={layers.communes}
                onCheckedChange={() => handleLayerToggle('communes')}
              />
            </div>
          </div>
        </div>

        {/* Infrastructure */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Infrastructure
          </h4>
          <div className="space-y-2 pl-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="routes" className="text-sm cursor-pointer">
                Routes principales
              </Label>
              <Switch
                id="routes"
                checked={layers.routes}
                onCheckedChange={() => handleLayerToggle('routes')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="villes" className="text-sm cursor-pointer">
                Villes et localités
              </Label>
              <Switch
                id="villes"
                checked={layers.villes}
                onCheckedChange={() => handleLayerToggle('villes')}
              />
            </div>
          </div>
        </div>

        {/* Ressources naturelles */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Ressources naturelles
          </h4>
          <div className="space-y-2 pl-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="rivieres" className="text-sm cursor-pointer">
                Rivières et cours d'eau
              </Label>
              <Switch
                id="rivieres"
                checked={layers.rivieres}
                onCheckedChange={() => handleLayerToggle('rivieres')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="agriculture" className="text-sm cursor-pointer">
                Zones agricoles
              </Label>
              <Switch
                id="agriculture"
                checked={layers.agriculture}
                onCheckedChange={() => handleLayerToggle('agriculture')}
              />
            </div>
          </div>
        </div>

        {/* Données socio-économiques */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Données socio-économiques
          </h4>
          <div className="space-y-2 pl-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="occupation" className="text-sm cursor-pointer">
                Occupation du sol
              </Label>
              <Switch
                id="occupation"
                checked={layers.occupation}
                onCheckedChange={() => handleLayerToggle('occupation')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="population" className="text-sm cursor-pointer">
                Densité de population
              </Label>
              <Switch
                id="population"
                checked={layers.population}
                onCheckedChange={() => handleLayerToggle('population')}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
