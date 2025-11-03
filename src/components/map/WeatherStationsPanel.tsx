import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, Droplets, Wind, Thermometer, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WeatherStation {
  id: string;
  name: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  data: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    lastUpdate: string;
  };
  status: 'active' | 'inactive' | 'maintenance';
}

export const WeatherStationsPanel = () => {
  const [stations, setStations] = useState<WeatherStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchWeatherStations();
  }, []);

  const fetchWeatherStations = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('weather-stations', {
        body: { region: 'burkina-faso' }
      });

      if (error) throw error;

      setStations(data.stations || []);
    } catch (error) {
      console.error('Error fetching weather stations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les stations météo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'maintenance':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Inactif';
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Stations Météo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Stations Météo au Sol
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {stations.length} stations au Burkina Faso
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-[500px] overflow-y-auto space-y-2">
          {stations.map((station) => (
            <div
              key={station.id}
              onClick={() => setSelectedStation(station.id)}
              className={`p-3 rounded border cursor-pointer transition-colors ${
                selectedStation === station.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted/30'
              }`}
            >
              {/* En-tête de la station */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{station.name}</h4>
                    <p className="text-xs text-muted-foreground">{station.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(station.status)}`} />
                  <Badge variant="outline" className="text-xs">
                    {getStatusLabel(station.status)}
                  </Badge>
                </div>
              </div>

              {/* Données météo */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Température</p>
                    <p className="text-sm font-semibold text-foreground">
                      {station.data.temperature}°C
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Humidité</p>
                    <p className="text-sm font-semibold text-foreground">
                      {station.data.humidity}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                  <Cloud className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Précipitations</p>
                    <p className="text-sm font-semibold text-foreground">
                      {station.data.precipitation} mm
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vent</p>
                    <p className="text-sm font-semibold text-foreground">
                      {station.data.windSpeed} km/h
                    </p>
                  </div>
                </div>
              </div>

              {/* Dernière mise à jour */}
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Mis à jour: {new Date(station.data.lastUpdate).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded bg-secondary/20 border border-border">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Info:</strong> Les données proviennent de stations météorologiques réelles 
            de l'ANAM-BF (Agence Nationale de la Météorologie du Burkina Faso).
          </p>
        </div>
      </CardContent>
    </Card>
  );
};