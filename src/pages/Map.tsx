import { MainLayout } from '@/components/layout/MainLayout';
import { WaterMap } from '@/components/map/WaterMap';

const Map = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Carte Interactive
          </h2>
          <p className="text-muted-foreground">
            Analysez les plans d'eau avec l'IA géospatiale
          </p>
        </div>

        <WaterMap />
      </div>
    </MainLayout>
  );
};

export default Map;
