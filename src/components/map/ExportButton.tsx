import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useFilterStore } from '@/stores/filterStore';
import { useMapStore } from '@/stores/mapStore';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF } from '@/utils/pdfExport';

export const ExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { currentAnalysis } = useAnalysisStore();
  const { region } = useFilterStore();
  const { view } = useMapStore();
  const { toast } = useToast();

  const handleExport = async () => {
    if (!currentAnalysis) {
      toast({
        title: "Aucune analyse disponible",
        description: "Effectuez une analyse avant d'exporter",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Capturer la carte si disponible
      let mapScreenshot: string | undefined;
      if (view) {
        const screenshot = await view.takeScreenshot({
          format: 'png',
          quality: 85,
          width: 1200,
          height: 600
        });
        mapScreenshot = screenshot.dataUrl;
      }

      // Exporter en PDF/HTML
      await exportToPDF({
        analysis: currentAnalysis,
        region: region || 'Toutes régions',
        timestamp: new Date(),
        mapScreenshot,
      });

      toast({
        title: "Export réussi",
        description: "Le rapport a été téléchargé",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible de générer le rapport",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={!currentAnalysis || isExporting}
      className="gap-2"
      variant="default"
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
          Export en cours...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Exporter en PDF
        </>
      )}
    </Button>
  );
};