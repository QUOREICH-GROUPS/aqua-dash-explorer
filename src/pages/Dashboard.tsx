import { Droplets, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFilterStore } from '@/stores/filterStore';

export const Dashboard = () => {
  const { region, period, waterBodyType } = useFilterStore();

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Plans d'eau totaux"
          value="1,284"
          description="Dans toutes les régions"
          icon={Droplets}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Qualité moyenne"
          value="87%"
          description="Indice de qualité de l'eau"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Alertes actives"
          value="23"
          description="Nécessitent une attention"
          icon={AlertTriangle}
          trend={{ value: 8, isPositive: false }}
        />
        <StatsCard
          title="Suivi actif"
          value="956"
          description="Plans d'eau surveillés"
          icon={Activity}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Carte interactive</CardTitle>
            <CardDescription className="text-muted-foreground">
              Visualisation géographique des plans d'eau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-lg bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center border border-border">
              <div className="text-center space-y-2">
                <Droplets className="h-16 w-16 mx-auto text-primary/40" />
                <p className="text-sm text-muted-foreground font-medium">
                  Carte ArcGIS sera intégrée ici
                </p>
                <p className="text-xs text-muted-foreground">
                  Utilisant @arcgis/core pour la visualisation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Analyse des données</CardTitle>
            <CardDescription className="text-muted-foreground">
              Tendances et statistiques des plans d'eau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-lg bg-gradient-to-br from-accent/5 to-primary/10 flex items-center justify-center border border-border">
              <div className="text-center space-y-2">
                <TrendingUp className="h-16 w-16 mx-auto text-accent/40" />
                <p className="text-sm text-muted-foreground font-medium">
                  Graphiques Chart.js seront intégrés ici
                </p>
                <p className="text-xs text-muted-foreground">
                  Utilisant react-chartjs-2 pour la visualisation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Filtres actifs</CardTitle>
          <CardDescription className="text-muted-foreground">
            Configuration actuelle de la recherche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Région</p>
              <p className="text-sm font-semibold text-foreground capitalize">
                {region === 'all' ? 'Toutes les régions' : region}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Période</p>
              <p className="text-sm font-semibold text-foreground">
                {period === 'current' ? 'Période actuelle' : period}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Type</p>
              <p className="text-sm font-semibold text-foreground capitalize">
                {waterBodyType === 'all' ? 'Tous types' : waterBodyType}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
