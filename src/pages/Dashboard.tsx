import { Droplets, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { WaterMap } from '@/components/map/WaterMap';
import { useFilterStore } from '@/stores/filterStore';

export const Dashboard = () => {
  const { region, waterBodyType } = useFilterStore();

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
          value="105k ha"
          description="Cumul de tous les plans d'eau"
          icon={Droplets}
          trend={{ value: 2.5, isPositive: false }}
        />
        <StatsCard
          title="Variation moyenne"
          value="-3.2%"
          description="Évolution sur la période"
          icon={TrendingUp}
          trend={{ value: 3.2, isPositive: false }}
        />
        <StatsCard
          title="Alertes actives"
          value="13"
          description="Nécessitent une attention"
          icon={AlertTriangle}
          trend={{ value: 15, isPositive: false }}
        />
        <StatsCard
          title="Suivi actif"
          value="956"
          description="Plans d'eau surveillés"
          icon={Activity}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Water Map with ArcGIS */}
      <WaterMap />
    </div>
  );
};

