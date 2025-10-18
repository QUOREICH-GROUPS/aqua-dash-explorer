import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnalysisStore } from '@/stores/analysisStore';
import { Clock, TrendingUp, MapPin, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const AnalysisHistory = () => {
  const { analysisHistory } = useAnalysisStore();

  const handleExport = (historyItem: any) => {
    const exportData = {
      date: format(historyItem.timestamp, 'PPpp', { locale: fr }),
      region: historyItem.region,
      surface: historyItem.analysis.surface,
      ndwi: historyItem.analysis.ndwi,
      agricultureStats: historyItem.agricultureStats,
      anomalies: historyItem.analysis.anomalies,
      alerts: historyItem.analysis.alerts,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyse-${format(historyItem.timestamp, 'yyyy-MM-dd-HHmm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (analysisHistory.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Historique des Analyses</CardTitle>
          <CardDescription className="text-muted-foreground">
            Aucune analyse enregistrée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les analyses effectuées apparaîtront ici.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historique des Analyses
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {analysisHistory.length} analyse(s) enregistrée(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {analysisHistory.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {format(item.timestamp, 'PPpp', { locale: fr })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground capitalize">
                      {item.region}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <Badge variant="secondary">
                      {item.analysis.surface.value} {item.analysis.surface.unit}
                    </Badge>
                    <Badge variant="secondary">
                      NDWI: {item.analysis.ndwi.average.toFixed(2)}
                    </Badge>
                    {item.agricultureStats && (
                      <Badge variant="secondary">
                        {item.agricultureStats.totalParcelles} parcelle(s)
                      </Badge>
                    )}
                  </div>

                  {item.analysis.anomalies.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <TrendingUp className="h-3 w-3 text-orange-500" />
                      <span className="text-muted-foreground">
                        {item.analysis.anomalies.length} anomalie(s) détectée(s)
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(item)}
                  className="gap-2"
                >
                  <Download className="h-3 w-3" />
                  Exporter
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
