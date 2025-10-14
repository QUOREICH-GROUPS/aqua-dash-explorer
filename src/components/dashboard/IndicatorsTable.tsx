import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { mockWaterBodies } from '@/data/mockData';
import { exportToCSV, exportToExcel } from '@/utils/exportData';
import { useToast } from '@/hooks/use-toast';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Excellent':
      return 'default';
    case 'Bon':
      return 'secondary';
    case 'Moyen':
      return 'outline';
    case 'Faible':
      return 'outline';
    case 'Critique':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Excellent':
      return 'text-green-600 bg-green-50';
    case 'Bon':
      return 'text-blue-600 bg-blue-50';
    case 'Moyen':
      return 'text-yellow-600 bg-yellow-50';
    case 'Faible':
      return 'text-orange-600 bg-orange-50';
    case 'Critique':
      return 'text-red-600 bg-red-50';
    default:
      return '';
  }
};

export const IndicatorsTable = () => {
  const [data] = useState(mockWaterBodies);
  const { toast } = useToast();

  const handleExportCSV = () => {
    exportToCSV(data);
    toast({
      title: 'Export réussi',
      description: 'Les données ont été exportées au format CSV',
    });
  };

  const handleExportExcel = () => {
    exportToExcel(data);
    toast({
      title: 'Export réussi',
      description: 'Les données ont été exportées au format Excel',
    });
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Tableau des indicateurs</CardTitle>
            <CardDescription className="text-muted-foreground">
              Liste détaillée des plans d'eau avec leurs métriques clés
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Nom</TableHead>
                <TableHead className="font-semibold">Région</TableHead>
                <TableHead className="text-right font-semibold">Surface (ha)</TableHead>
                <TableHead className="text-right font-semibold">Variation (%)</TableHead>
                <TableHead className="text-right font-semibold">NDWI</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="text-right font-semibold">Alertes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.region}</TableCell>
                  <TableCell className="text-right font-mono">
                    {row.surface.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-semibold ${
                        row.variation >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {row.variation > 0 ? '+' : ''}
                      {row.variation}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {row.ndwi.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(row.status)}
                      className={getStatusColor(row.status)}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {row.alerts > 0 ? (
                      <div className="flex items-center justify-end gap-1">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="font-semibold text-destructive">
                          {row.alerts}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
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
