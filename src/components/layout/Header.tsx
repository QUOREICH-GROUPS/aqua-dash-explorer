import { Waves, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

export const Header = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-primary to-accent p-2">
            <Waves className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Gestion des Plans d'Eau
            </h1>
            <p className="text-xs text-muted-foreground">
              Analyse et visualisation environnementale
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Tableau de bord
          </Button>
          <Button variant="ghost" size="sm">
            Rapports
          </Button>
          <Button variant="default" size="sm">
            Exporter
          </Button>
        </div>
      </div>
    </header>
  );
};
