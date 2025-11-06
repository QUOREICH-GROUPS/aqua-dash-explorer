import { MainLayout } from '@/components/layout/MainLayout';
import { WaterMap } from '@/components/map/WaterMap';
import { TemporalChart } from '@/components/map/TemporalChart';
import { ExportButton } from '@/components/map/ExportButton';
import { SatelliteDataPanel } from '@/components/map/SatelliteDataPanel';
import { WeatherStationsPanel } from '@/components/map/WeatherStationsPanel';
import { WaterSegmentationPanel } from '@/components/map/WaterSegmentationPanel';

const Map = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Carte Interactive
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Analysez les plans d'eau avec l'IA géospatiale
            </p>
          </div>
          <ExportButton />
        </div>

        <WaterMap />
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <TemporalChart />
          <SatelliteDataPanel />
        </div>
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <WaterSegmentationPanel />
          <WeatherStationsPanel />
        </div>
      </div>
    </MainLayout>
  );
};

export default Map;
