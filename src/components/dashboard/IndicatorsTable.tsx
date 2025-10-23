import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, FileSpreadsheet, Share2, MapPin, Loader2 } from 'lucide-react';
import { exportToCSV, exportToExcel, generateShareableLink, copyToClipboard } from '@/utils/exportUtils';
import { useFilterStore } from '@/stores/filterStore';
import { useMapStore } from '@/stores/mapStore';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useWaterBodies } from '@/hooks/useWaterBodiesApi';
import type { WaterBody } from '@/services/api/waterBodiesApi';

export const IndicatorsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { region, waterBodyType } = useFilterStore();
  const { zoomToLocation, setSelectedWaterBodyId } = useMapStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch water bodies from API
  const { data, isLoading, error } = useWaterBodies({
    region: region !== 'all' ? region : undefined,
    type: waterBodyType !== 'all' ? waterBodyType : undefined,
  });

  const filteredData = useMemo(() => {
    if (!data?.items) return [];

    return data.items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.region.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [data, searchTerm]);

  const handleExportCSV = () => {
    exportToCSV(filteredData);
    toast({
      title: "Export CSV réussi",
      description: `${filteredData.length} plans d'eau exportés`,
    });
  };

  const handleExportExcel = () => {
    exportToExcel(filteredData);
    toast({
      title: "Export Excel réussi",
      description: `${filteredData.length} plans d'eau exportés`,
    });
  };

  const handleShare = async () => {
    const shareLink = generateShareableLink({
      region,
      waterBodyType,
    });
    
    const copied = await copyToClipboard(shareLink);
    
    if (copied) {
      toast({
        title: "Lien copié",
        description: "Le lien de partage a été copié dans le presse-papier",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (waterBody: WaterBody) => {
    setSelectedWaterBodyId(waterBody.id);

    // Extract coordinates from centroid if available
    if (waterBody.centroid?.coordinates) {
      const [lng, lat] = waterBody.centroid.coordinates;
      zoomToLocation(lat, lng);
    }

    navigate('/map');

    toast({
      title: "Zoom sur la carte",
      description: `Navigation vers ${waterBody.name}`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Critique</Badge>;
      case 'warning':
        return <Badge variant="default">Attention</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getVariationColor = (variation: number) => {
    if (variation < -10) return 'text-destructive';
    if (variation < 0) return 'text-orange-500';
    return 'text-accent';
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Chargement des données...</span>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-8">
          <div className="text-center text-destructive">
            <p className="font-semibold">Erreur lors du chargement des données</p>
            <p className="text-sm mt-2">{error instanceof Error ? error.message : 'Une erreur est survenue'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Plans d'eau surveillés</CardTitle>
            <CardDescription className="text-muted-foreground">
              {filteredData.length} plans d'eau • Cliquez sur une ligne pour zoomer sur la carte
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>
        <Input
          placeholder="Rechercher par nom ou région..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-4"
        />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground">Nom</TableHead>
                <TableHead className="text-foreground">Région</TableHead>
                <TableHead className="text-foreground">Type</TableHead>
                <TableHead className="text-right text-foreground">Surface (ha)</TableHead>
                <TableHead className="text-right text-foreground">Variation (%)</TableHead>
                <TableHead className="text-right text-foreground">NDWI</TableHead>
                <TableHead className="text-center text-foreground">Statut</TableHead>
                <TableHead className="text-center text-foreground">Alertes</TableHead>
                <TableHead className="text-center text-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((waterBody) => (
                <TableRow 
                  key={waterBody.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(waterBody)}
                >
                  <TableCell className="font-medium text-foreground">
                    {waterBody.name}
                  </TableCell>
                  <TableCell className="capitalize text-foreground">
                    {waterBody.region}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {waterBody.type === 'lake' && 'Lac'}
                    {waterBody.type === 'river' && 'Rivière'}
                    {waterBody.type === 'reservoir' && 'Réservoir'}
                    {waterBody.type === 'wetland' && 'Zone humide'}
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    {waterBody.surface_area_ha?.toLocaleString() || '-'}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${getVariationColor(waterBody.metadata?.variation || 0)}`}>
                    {waterBody.metadata?.variation ?
                      `${waterBody.metadata.variation > 0 ? '+' : ''}${waterBody.metadata.variation}%` :
                      '-'}
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    {waterBody.metadata?.ndwi !== undefined ? waterBody.metadata.ndwi.toFixed(2) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(waterBody.metadata?.status || 'normal')}
                  </TableCell>
                  <TableCell className="text-center">
                    {waterBody.metadata?.alerts && waterBody.metadata.alerts > 0 ? (
                      <Badge variant="outline" className="bg-destructive/10">
                        {waterBody.metadata.alerts}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(waterBody);
                      }}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
