import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Share2 } from 'lucide-react';
import { useMapStore } from '@/stores/mapStore';
import { useFilterStore } from '@/stores/filterStore';
import { generateShareableLink, copyToClipboard } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

export const MapControls = () => {
  const { view, selectedWaterBodyId } = useMapStore();
  const { region, period, waterBodyType } = useFilterStore();
  const { toast } = useToast();

  const handleCapture = async () => {
    if (!view) {
      toast({
        title: "Erreur",
        description: "La vue n'est pas prête",
        variant: "destructive",
      });
      return;
    }

    try {
      const screenshot = await view.takeScreenshot({
        format: 'png',
        quality: 100,
        width: 1920,
        height: 1080
      });

      const link = document.createElement('a');
      link.href = screenshot.dataUrl;
      link.download = `water-map-${Date.now()}.png`;
      link.click();

      toast({
        title: "Capture réussie",
        description: "L'image de la carte a été téléchargée",
      });
    } catch (error) {
      console.error('Screenshot error:', error);
      toast({
        title: "Erreur de capture",
        description: "Impossible de capturer la carte",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const shareLink = generateShareableLink({
      region,
      period,
      waterBodyType,
      selectedWaterBodyId: selectedWaterBodyId || undefined,
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

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-foreground">Contrôles de la carte</CardTitle>
        <CardDescription className="text-muted-foreground">
          Capturez et partagez vos vues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleCapture}
        >
          <Camera className="h-4 w-4" />
          Capturer la vue
        </Button>
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          Partager la sélection
        </Button>
      </CardContent>
    </Card>
  );
};
