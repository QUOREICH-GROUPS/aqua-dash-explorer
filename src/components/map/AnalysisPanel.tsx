import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WaterAnalysisResult } from '@/hooks/useWaterAnalysis';
import { TrendingDown, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface AnalysisPanelProps {
  result: WaterAnalysisResult | null;
  isAnalyzing: boolean;
}

export const AnalysisPanel = ({ result, isAnalyzing }: AnalysisPanelProps) => {
  if (isAnalyzing) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Analyse en cours...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Résultats d'analyse IA</CardTitle>
          <CardDescription className="text-muted-foreground">
            Dessinez une zone et lancez l'analyse pour voir les résultats
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Surface et Variation */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            Surface
            {result.surface.variation < 0 ? (
              <TrendingDown className="h-5 w-5 text-destructive" />
            ) : (
              <TrendingUp className="h-5 w-5 text-accent" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-bold text-foreground">
            {result.surface.value} {result.surface.unit}
          </div>
          <Badge variant={result.surface.variation < 0 ? 'destructive' : 'secondary'}>
            {result.surface.variation > 0 ? '+' : ''}{result.surface.variation}%
          </Badge>
        </CardContent>
      </Card>

      {/* NDWI */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">NDWI Moyen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-bold text-foreground">
            {result.ndwi.average.toFixed(2)}
          </div>
          <Badge variant="outline" className="capitalize">
            Tendance: {result.ndwi.trend === 'stable' ? 'Stable' : result.ndwi.trend === 'increasing' ? 'Croissante' : 'Décroissante'}
          </Badge>
        </CardContent>
      </Card>

      {/* Anomalies */}
      {result.anomalies.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Anomalies détectées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.anomalies.map((anomaly, index) => (
              <Alert key={index} variant={anomaly.severity === 'high' ? 'destructive' : 'default'}>
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{anomaly.type}</span>
                    <Badge variant={
                      anomaly.severity === 'high' ? 'destructive' : 
                      anomaly.severity === 'medium' ? 'default' : 
                      'secondary'
                    }>
                      {anomaly.severity}
                    </Badge>
                  </div>
                  <p className="text-sm mt-1">{anomaly.description}</p>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alertes */}
      {result.alerts.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Alertes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.alerts.map((alert, index) => (
              <div key={index} className="p-3 rounded bg-secondary/30 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{alert.type}</span>
                  <Badge variant={
                    alert.priority === 'high' ? 'destructive' : 
                    alert.priority === 'medium' ? 'default' : 
                    'secondary'
                  }>
                    {alert.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Prévisions */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Prévisions (7 jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {result.forecast.map((forecast) => (
              <div key={forecast.day} className="flex items-center justify-between p-2 rounded bg-muted/30">
                <span className="text-sm font-medium text-foreground">Jour {forecast.day}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground">{forecast.predictedSurface.toFixed(1)} ha</span>
                  <Badge variant="outline" className="text-xs">
                    {(forecast.confidence * 100).toFixed(0)}% confiance
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
