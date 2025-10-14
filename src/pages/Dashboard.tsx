import { Droplets, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ChartsPanel } from '@/components/dashboard/ChartsPanel';
import { IndicatorsTable } from '@/components/dashboard/IndicatorsTable';
import { useFilterStore } from '@/stores/filterStore';
import { mockWaterBodies } from '@/data/mockData';

export const Dashboard = () => {
  const { region, waterBodyType } = useFilterStore();

  // Calculate summary statistics
  const totalSurface = mockWaterBodies.reduce((sum, body) => sum + body.surface, 0);
  const averageVariation = mockWaterBodies.reduce((sum, body) => sum + body.variation, 0) / mockWaterBodies.length;
  const totalAlerts = mockWaterBodies.reduce((sum, body) => sum + body.alerts, 0);
  const monitoredCount = mockWaterBodies.filter(body => body.status !== 'Critique').length;

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
          value={`${(totalSurface / 1000).toFixed(1)}k ha`}
          description="Cumul de tous les plans d'eau"
          icon={Droplets}
          trend={{ value: 2.5, isPositive: false }}
        />
        <StatsCard
          title="Variation moyenne"
          value={`${averageVariation.toFixed(1)}%`}
          description="Évolution sur la période"
          icon={TrendingUp}
          trend={{ value: Math.abs(averageVariation), isPositive: averageVariation >= 0 }}
        />
        <StatsCard
          title="Alertes actives"
          value={totalAlerts}
          description="Nécessitent une attention"
          icon={AlertTriangle}
          trend={{ value: 15, isPositive: false }}
        />
        <StatsCard
          title="Suivi actif"
          value={monitoredCount}
          description="Plans d'eau surveillés"
          icon={Activity}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Charts Panel */}
      <ChartsPanel />

      {/* Indicators Table */}
      <IndicatorsTable />
    </div>
  );
};

