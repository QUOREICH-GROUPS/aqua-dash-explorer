import { Droplets, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { IndicatorsTable } from '@/components/dashboard/IndicatorsTable';
import { AgricultureCharts } from '@/components/dashboard/AgricultureCharts';
import { AnalysisHistory } from '@/components/dashboard/AnalysisHistory';
import { useFilterStore } from '@/stores/filterStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useWaterBodies } from '@/hooks/useWaterBodiesApi';
import { useMemo } from 'react';

export const Dashboard = () => {
  const { region, waterBodyType } = useFilterStore();
  const { currentAnalysis, agricultureStats } = useAnalysisStore();

  // Fetch water bodies from API
  const { data, isLoading } = useWaterBodies({
    region: region !== 'all' ? region : undefined,
    type: waterBodyType !== 'all' ? waterBodyType : undefined,
  });

  // Calculate statistics from API data
  const stats = useMemo(() => {
    if (!data?.items) {
      return {
        totalSurface: 0,
        totalWaterBodies: 0,
        activeAlerts: 0,
        avgVariation: 0,
      };
    }

    const totalSurface = data.items.reduce((sum, wb) => sum + (wb.surface_area_ha || 0), 0);
    const activeAlerts = data.items.reduce((sum, wb) => sum + (wb.metadata?.alerts || 0), 0);
    const avgVariation = data.items.length > 0
      ? data.items.reduce((sum, wb) => sum + (wb.metadata?.variation || 0), 0) / data.items.length
      : 0;

    return {
      totalSurface,
      totalWaterBodies: data.items.length,
      activeAlerts,
      avgVariation,
    };
  }, [data]);

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
          value={isLoading ? '...' : `${stats.totalSurface.toLocaleString()} ha`}
          description="Plans d'eau surveillés"
          icon={Droplets}
          trend={{ value: stats.avgVariation, isPositive: stats.avgVariation > 0 }}
        />
        <StatsCard
          title="Plans d'eau"
          value={isLoading ? '...' : stats.totalWaterBodies.toString()}
          description={region !== 'all' ? region : 'Toutes régions'}
          icon={Activity}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Alertes actives"
          value={isLoading ? '...' : stats.activeAlerts.toString()}
          description="Nécessitent une attention"
          icon={AlertTriangle}
          trend={{ value: stats.activeAlerts > 5 ? 15 : -10, isPositive: stats.activeAlerts <= 5 }}
        />
        <StatsCard
          title="Variation moyenne"
          value={isLoading ? '...' : `${stats.avgVariation.toFixed(1)}%`}
          description="Évolution des surfaces"
          icon={TrendingUp}
          trend={{ value: stats.avgVariation, isPositive: stats.avgVariation > 0 }}
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

