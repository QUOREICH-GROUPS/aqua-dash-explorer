import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { timeSeriesData, ndwiData } from '@/data/mockData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      ticks: {
        callback: (value: number | string) => `${value} ha`,
      },
    },
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export const ChartsPanel = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Évolution des surfaces</CardTitle>
          <CardDescription className="text-muted-foreground">
            Série temporelle de la surface totale des plans d'eau
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line options={lineOptions} data={timeSeriesData} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Distribution NDWI</CardTitle>
          <CardDescription className="text-muted-foreground">
            Répartition des plans d'eau par qualité de l'eau (indice NDWI)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar options={barOptions} data={ndwiData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
