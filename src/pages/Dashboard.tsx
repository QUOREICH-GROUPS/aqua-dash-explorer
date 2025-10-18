import { Droplets, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { IndicatorsTable } from '@/components/dashboard/IndicatorsTable';
import { AgricultureCharts } from '@/components/dashboard/AgricultureCharts';
import { AnalysisHistory } from '@/components/dashboard/AnalysisHistory';
import { useFilterStore } from '@/stores/filterStore';
import { useAnalysisStore } from '@/stores/analysisStore';

export const Dashboard = () => {
  const { region, waterBodyType } = useFilterStore();
  const { currentAnalysis, agricultureStats } = useAnalysisStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Tableau de bord
        </h2>
        <p className="text-muted-foreground">
          Vue d'ensemble des plans d'eau - {region !== 'all' ? region : 'Toutes régions'} • {waterBodyType !== 'all' ? waterBodyType : 'Tous types'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Surface totale"
          value={agricultureStats ? `${agricultureStats.totalSurface.toLocaleString()} ha` : '45,230 ha'}
          description="Zone analysée"
          icon={Droplets}
          trend={{ value: currentAnalysis?.surface.variation || 2.5, isPositive: (currentAnalysis?.surface.variation || 2.5) > 0 }}
        />
        <StatsCard
          title="Rendement moyen"
          value={agricultureStats ? `${agricultureStats.averageYield.toFixed(1)} t/ha` : '2.8 t/ha'}
          description="Toutes cultures confondues"
          icon={TrendingUp}
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatsCard
          title="Alertes actives"
          value={currentAnalysis?.alerts.length.toString() || '3'}
          description="Nécessitent une attention"
          icon={AlertTriangle}
          trend={{ value: 15, isPositive: false }}
        />
        <StatsCard
          title="Parcelles"
          value={agricultureStats?.totalParcelles.toString() || '5'}
          description="Dans la zone analysée"
          icon={Activity}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Agriculture Charts */}
      <AgricultureCharts />

      {/* Indicators Table */}
      <IndicatorsTable />

      {/* Analysis History */}
      <AnalysisHistory />
    </div>
  );
};

