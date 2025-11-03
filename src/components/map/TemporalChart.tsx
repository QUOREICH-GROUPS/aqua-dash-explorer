import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';
import { useAnalysisStore } from '@/stores/analysisStore';
import { TrendingUp, Calendar } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const TemporalChart = () => {
  const { analysisHistory } = useAnalysisStore();

  if (analysisHistory.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Évolution temporelle
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Effectuez plusieurs analyses pour voir l'évolution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="text-center space-y-2">
              <Calendar className="h-12 w-12 mx-auto opacity-50" />
              <p className="text-sm">Aucune donnée historique disponible</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Préparer les données pour le graphique (inverser pour ordre chronologique)
  const sortedHistory = [...analysisHistory].reverse();
  const labels = sortedHistory.map((item) => 
    new Date(item.timestamp).toLocaleDateString('fr-FR', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  );

  const surfaceData = sortedHistory.map((item) => item.analysis.surface.value);
  const ndwiData = sortedHistory.map((item) => item.analysis.ndwi.average);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Surface (ha)',
        data: surfaceData,
        borderColor: 'hsl(200, 85%, 45%)',
        backgroundColor: 'hsla(200, 85%, 45%, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'NDWI',
        data: ndwiData,
        borderColor: 'hsl(180, 65%, 50%)',
        backgroundColor: 'hsla(180, 65%, 50%, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'hsl(215, 25%, 15%)',
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
      tooltip: {
        backgroundColor: 'hsl(0, 0%, 100%)',
        titleColor: 'hsl(215, 25%, 15%)',
        bodyColor: 'hsl(215, 25%, 15%)',
        borderColor: 'hsl(210, 25%, 88%)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'hsl(210, 25%, 88%)',
        },
        ticks: {
          color: 'hsl(215, 15%, 50%)',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Surface (ha)',
          color: 'hsl(200, 85%, 45%)',
        },
        grid: {
          color: 'hsl(210, 25%, 88%)',
        },
        ticks: {
          color: 'hsl(215, 15%, 50%)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'NDWI',
          color: 'hsl(180, 65%, 50%)',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'hsl(215, 15%, 50%)',
        },
      },
    },
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Évolution temporelle
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Historique des {analysisHistory.length} dernières analyses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};