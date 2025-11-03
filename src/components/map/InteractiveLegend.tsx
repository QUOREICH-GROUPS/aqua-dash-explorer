import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const InteractiveLegend = () => {
  const legendItems = [
    {
      category: "Indice NDWI",
      description: "Normalized Difference Water Index",
      items: [
        { color: "hsl(200, 85%, 60%)", label: "Eau (> 0.3)", range: "> 0.3" },
        { color: "hsl(180, 65%, 50%)", label: "Zone humide (0.0 - 0.3)", range: "0.0 - 0.3" },
        { color: "hsl(30, 85%, 55%)", label: "Sol sec (< 0.0)", range: "< 0.0" },
      ]
    },
    {
      category: "Cultures",
      description: "Zones de production agricole",
      items: [
        { color: "hsl(55, 100%, 65%)", label: "Maïs", info: "Rendement moyen: 2.8 t/ha" },
        { color: "hsl(65, 60%, 55%)", label: "Mil", info: "Rendement moyen: 1.2 t/ha" },
        { color: "hsl(0, 0%, 85%)", label: "Coton", info: "Rendement moyen: 1.8 t/ha" },
        { color: "hsl(120, 40%, 50%)", label: "Riz", info: "Rendement moyen: 3.2 t/ha" },
        { color: "hsl(30, 100%, 55%)", label: "Sorgho", info: "Rendement moyen: 1.5 t/ha" },
      ]
    },
    {
      category: "Alertes",
      description: "Niveaux de priorité",
      items: [
        { color: "hsl(0, 84%, 60%)", label: "Priorité haute", badge: "high" },
        { color: "hsl(30, 85%, 55%)", label: "Priorité moyenne", badge: "medium" },
        { color: "hsl(200, 85%, 45%)", label: "Priorité basse", badge: "low" },
      ]
    },
  ];

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Info className="h-5 w-5" />
          Légende interactive
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Guide des couleurs et indices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {legendItems.map((category, idx) => (
          <div key={idx} className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">{category.category}</h4>
              <p className="text-xs text-muted-foreground">{category.description}</p>
            </div>
            <div className="space-y-2">
              {category.items.map((item, itemIdx) => (
                <TooltipProvider key={itemIdx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 transition-colors cursor-help">
                        <div 
                          className="w-6 h-6 rounded border-2 border-border flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-foreground block truncate">{item.label}</span>
                          {item.range && (
                            <span className="text-xs text-muted-foreground">{item.range}</span>
                          )}
                        </div>
                        {item.badge && (
                          <Badge variant={
                            item.badge === 'high' ? 'destructive' : 
                            item.badge === 'medium' ? 'default' : 
                            'secondary'
                          } className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </TooltipTrigger>
                    {item.info && (
                      <TooltipContent>
                        <p className="text-xs">{item.info}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        ))}
        
        {/* Échelle des températures */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Température</h4>
            <p className="text-xs text-muted-foreground">En degrés Celsius</p>
          </div>
          <div className="relative h-8 rounded overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500" />
            <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium text-background">
              <span>15°</span>
              <span>25°</span>
              <span>35°</span>
              <span>45°</span>
            </div>
          </div>
        </div>

        {/* Échelle des précipitations */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Précipitations</h4>
            <p className="text-xs text-muted-foreground">En millimètres</p>
          </div>
          <div className="relative h-8 rounded overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-100 via-blue-300 to-blue-600" />
            <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium text-background">
              <span className="text-foreground">0</span>
              <span>25</span>
              <span>50</span>
              <span>100+</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};