import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer } from 'lucide-react';
import { useAnalysisStore } from '@/stores/analysisStore';

export const WeatherWidget = () => {
  const { weatherData } = useAnalysisStore();

  if (!weatherData) {
    return null;
  }

  const WeatherIcon = () => {
    switch (weatherData.condition) {
      case 'sunny':
        return <Sun className="h-12 w-12 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="h-12 w-12 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="h-12 w-12 text-blue-500" />;
    }
  };

  const conditionText = {
    sunny: 'Ensoleillé',
    cloudy: 'Nuageux',
    rainy: 'Pluvieux',
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Conditions Météo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-3xl font-bold text-foreground">
              {weatherData.temperature}°C
            </p>
            <p className="text-sm text-muted-foreground">
              {conditionText[weatherData.condition]}
            </p>
          </div>
          <WeatherIcon />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Humidité</p>
              <p className="text-sm font-medium text-foreground">{weatherData.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Précipitations</p>
              <p className="text-sm font-medium text-foreground">{weatherData.precipitation}mm</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-muted-foreground">Vent</p>
              <p className="text-sm font-medium text-foreground">{weatherData.windSpeed} km/h</p>
            </div>
          </div>
        </div>

        {weatherData.forecast && weatherData.forecast.length > 0 && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Prévisions 3 jours</p>
            <div className="space-y-1">
              {weatherData.forecast.slice(0, 3).map((day, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{day.date}</span>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-3 w-3" />
                    <span className="font-medium text-foreground">{day.temperature}°C</span>
                    <CloudRain className="h-3 w-3 text-blue-500" />
                    <span className="text-muted-foreground">{day.precipitation}mm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
