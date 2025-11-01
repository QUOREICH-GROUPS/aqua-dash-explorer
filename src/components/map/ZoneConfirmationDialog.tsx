import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Ruler } from 'lucide-react';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Geometry from '@arcgis/core/geometry/Geometry';

interface ZoneConfirmationDialogProps {
  open: boolean;
  geometry: Geometry | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ZoneConfirmationDialog = ({
  open,
  geometry,
  onConfirm,
  onCancel,
}: ZoneConfirmationDialogProps) => {
  const getZoneInfo = () => {
    if (!geometry) return null;

    let area = 0;
    let perimeter = 0;

    try {
      const areaMeters = geometryEngine.geodesicArea(geometry as any, 'square-meters');
      area = areaMeters / 10000;
      
      const perimeterMeters = geometryEngine.geodesicLength(geometry as any, 'meters');
      perimeter = perimeterMeters / 1000;
    } catch (error) {
      console.error('Error calculating geometry properties:', error);
    }

    return {
      area: area > 0 ? area.toFixed(2) : 'N/A',
      perimeter: perimeter > 0 ? perimeter.toFixed(2) : 'N/A',
      type: geometry.type,
    };
  };

  const info = getZoneInfo();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Zone sélectionnée
          </DialogTitle>
          <DialogDescription>
            Vérifiez les informations de la zone avant de lancer l'analyse IA
          </DialogDescription>
        </DialogHeader>

        {info && (
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Surface</span>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {info.area} ha
                </Badge>
              </div>

              {info.perimeter !== 'N/A' && (
                <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Périmètre</span>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {info.perimeter} km
                  </Badge>
                </div>
              )}

              <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Type de géométrie</span>
                <Badge variant="outline">{info.type}</Badge>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">
                L'analyse IA va examiner cette zone pour détecter les plans d'eau,
                calculer les indices NDWI, identifier les zones agricoles et
                fournir des prévisions météorologiques.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={onConfirm}>
            Lancer l'analyse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
