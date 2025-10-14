import { MapPin, Calendar, Droplets, RotateCcw } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFilterStore } from '@/stores/filterStore';

const regions = [
  { value: 'all', label: 'Toutes les régions' },
  { value: 'nord', label: 'Nord' },
  { value: 'sud', label: 'Sud' },
  { value: 'est', label: 'Est' },
  { value: 'ouest', label: 'Ouest' },
  { value: 'centre', label: 'Centre' },
];

const periods = [
  { value: 'current', label: 'Période actuelle' },
  { value: 'last-month', label: 'Dernier mois' },
  { value: 'last-quarter', label: 'Dernier trimestre' },
  { value: 'last-year', label: 'Dernière année' },
  { value: 'custom', label: 'Personnalisé' },
];

const waterBodyTypes = [
  { value: 'all', label: 'Tous types' },
  { value: 'lake', label: 'Lac' },
  { value: 'river', label: 'Rivière' },
  { value: 'reservoir', label: 'Réservoir' },
  { value: 'wetland', label: 'Zone humide' },
];

export const AppSidebar = () => {
  const { region, period, waterBodyType, setRegion, setPeriod, setWaterBodyType, resetFilters } = useFilterStore();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs uppercase tracking-wider">
            Filtres de recherche
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-6 px-2 py-4">
              <SidebarMenuItem>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-sidebar-primary" />
                    Région
                  </Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border">
                      <SelectValue placeholder="Sélectionner une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-sidebar-primary" />
                    Période
                  </Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border">
                      <SelectValue placeholder="Sélectionner une période" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-sidebar-primary" />
                    Type de plan d'eau
                  </Label>
                  <Select value={waterBodyType} onValueChange={setWaterBodyType}>
                    <SelectTrigger className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {waterBodyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="w-full bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border hover:bg-sidebar-accent/80"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réinitialiser les filtres
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
