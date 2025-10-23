import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useAnalysisStore } from '@/stores/analysisStore';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export const AgricultureCharts = () => {
  const { agricultureStats } = useAnalysisStore();

  if (!agricultureStats) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Statistiques Agricoles</CardTitle>
          <CardDescription className="text-muted-foreground">
            Aucune analyse disponible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Dessinez une zone sur la carte et lancez une analyse pour voir les statistiques.
          </p>
        </CardContent>
      </Card>
    );
  }

  const cultureColors = {
    'Maïs': 'rgba(255, 235, 59, 0.8)',
    'Mil': 'rgba(205, 220, 57, 0.8)',
    'Coton': 'rgba(255, 255, 255, 0.8)',
    'Riz': 'rgba(76, 175, 80, 0.8)',
    'Sorgho': 'rgba(255, 152, 0, 0.8)',
  };

  const donutData = {
    labels: agricultureStats.culturesBreakdown.map((c) => c.type),
    datasets: [
      {
        data: agricultureStats.culturesBreakdown.map((c) => c.surface),
        backgroundColor: agricultureStats.culturesBreakdown.map((c) => cultureColors[c.type as keyof typeof cultureColors] || 'rgba(200, 200, 200, 0.8)'),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const barData = {
    labels: agricultureStats.culturesBreakdown.map((c) => c.type),
    datasets: [
      {
        label: 'Rendement (t/ha)',
        data: agricultureStats.culturesBreakdown.map((c) => c.rendement),
        backgroundColor: agricultureStats.culturesBreakdown.map((c) => cultureColors[c.type as keyof typeof cultureColors] || 'rgba(200, 200, 200, 0.8)'),
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'hsl(var(--foreground))',
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'hsl(var(--background))',
        titleColor: 'hsl(var(--foreground))',
        bodyColor: 'hsl(var(--foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
        grid: {
          color: 'hsl(var(--border))',
        },
      },
      x: {
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
        grid: {
          color: 'hsl(var(--border))',
        },
      },
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Répartition par Culture</CardTitle>
          <CardDescription className="text-muted-foreground">
            Surface totale : {agricultureStats.totalSurface.toLocaleString()} ha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Doughnut data={donutData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Rendement par Culture</CardTitle>
          <CardDescription className="text-muted-foreground">
            Rendement moyen : {agricultureStats.averageYield.toFixed(1)} t/ha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
