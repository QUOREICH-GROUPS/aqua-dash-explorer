import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Satellite, Download, RefreshCw, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SatelliteData {
  date: string;
  ndvi: number;
  ndwi: number;
  cloudCoverage: number;
  resolution: string;
  source: 'Sentinel-2' | 'Landsat-8';
}

export const SatelliteDataPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [satelliteData, setSatelliteData] = useState<SatelliteData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSatelliteData = async () => {
    setIsLoading(true);
    
    try {
      // Appel à l'edge function pour récupérer les données Sentinel-2
      const { data, error } = await supabase.functions.invoke('satellite-data', {
        body: {
          coordinates: {
            latitude: 12.2395,
            longitude: -1.5584
          },
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
        }
      });

      if (error) throw error;

      setSatelliteData(data.images || []);
      
      toast({
        title: "Données satellitaires chargées",
        description: `${data.images?.length || 0} images disponibles`,
      });
    } catch (error) {
      console.error('Error fetching satellite data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les données satellitaires",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getQualityColor = (cloudCoverage: number) => {
    if (cloudCoverage < 10) return 'text-green-600';
    if (cloudCoverage < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Satellite className="h-5 w-5" />
          Données Satellitaires
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Images Sentinel-2 et Landsat-8
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={fetchSatelliteData}
          disabled={isLoading}
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Récupérer les images
            </>
          )}
        </Button>

        {satelliteData.length > 0 && (
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Liste</TabsTrigger>
              <TabsTrigger value="indices">Indices</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-2 mt-4">
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {satelliteData.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(item.date)}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      selectedDate === item.date
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {new Date(item.date).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <Badge variant="outline">{item.source}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NDVI:</span>
                        <span className="font-medium text-foreground">{item.ndvi.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NDWI:</span>
                        <span className="font-medium text-foreground">{item.ndwi.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-muted-foreground">Nuages:</span>
                        <span className={`font-medium ${getQualityColor(item.cloudCoverage)}`}>
                          {item.cloudCoverage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="indices" className="space-y-3 mt-4">
              {selectedDate ? (
                <>
                  <div className="p-4 rounded bg-muted/30 border border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      Image du {new Date(selectedDate).toLocaleDateString('fr-FR')}
                    </h4>
                    
                    <div className="space-y-3">
                      {/* NDVI */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">NDVI (Végétation)</span>
                          <span className="text-sm font-medium text-foreground">
                            {satelliteData.find(d => d.date === selectedDate)?.ndvi.toFixed(3)}
                          </span>
                        </div>
                        <div className="h-2 rounded bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>-1 (Eau)</span>
                          <span>0 (Sol)</span>
                          <span>1 (Végétation)</span>
                        </div>
                      </div>

                      {/* NDWI */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">NDWI (Eau)</span>
                          <span className="text-sm font-medium text-foreground">
                            {satelliteData.find(d => d.date === selectedDate)?.ndwi.toFixed(3)}
                          </span>
                        </div>
                        <div className="h-2 rounded bg-gradient-to-r from-amber-500 via-blue-300 to-blue-600" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>-1 (Sec)</span>
                          <span>0 (Humide)</span>
                          <span>1 (Eau)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-secondary/20 border border-border">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Astuce:</strong> Les indices NDVI et NDWI permettent d'identifier 
                      la végétation et l'eau avec précision grâce aux données satellitaires.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Satellite className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sélectionnez une image pour voir les détails</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {satelliteData.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Satellite className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune donnée disponible</p>
            <p className="text-xs mt-1">Cliquez sur "Récupérer les images"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};