import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWaterSegmentation } from '@/hooks/useWaterSegmentation';
import { Upload, Image as ImageIcon, Download, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const WaterSegmentationPanel = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { segmentWater, isProcessing, isModelLoading, result } = useWaterSegmentation();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleSegment = useCallback(async () => {
    if (!selectedFile) return;
    await segmentWater(selectedFile);
  }, [selectedFile, segmentWater]);

  const downloadMask = useCallback(() => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.maskDataUrl;
    link.download = 'water-mask.png';
    link.click();
  }, [result]);

  const downloadProcessed = useCallback(() => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.processedImageUrl;
    link.download = 'water-segmentation.png';
    link.click();
  }, [result]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Segmentation IA - Plans d'eau
        </CardTitle>
        <CardDescription>
          Détectez automatiquement les plans d'eau sur vos images satellite
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="space-y-2">
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 hover:border-primary transition-colors text-center">
              <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Cliquez pour sélectionner une image satellite
              </p>
              <p className="text-xs text-muted-foreground">
                Formats acceptés: JPG, PNG, GeoTIFF
              </p>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isProcessing || isModelLoading}
            />
          </label>
        </div>

        {/* Preview and Results */}
        {previewUrl && (
          <div className="space-y-4">
            <Tabs defaultValue="original" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="original">Original</TabsTrigger>
                <TabsTrigger value="segmented" disabled={!result}>
                  Segmentation
                </TabsTrigger>
                <TabsTrigger value="mask" disabled={!result}>
                  Masque
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="original" className="space-y-2">
                <img
                  src={previewUrl}
                  alt="Image originale"
                  className="w-full rounded-lg"
                />
              </TabsContent>
              
              <TabsContent value="segmented" className="space-y-2">
                {result && (
                  <>
                    <img
                      src={result.processedImageUrl}
                      alt="Image segmentée"
                      className="w-full rounded-lg"
                    />
                    <Button
                      onClick={downloadProcessed}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger la segmentation
                    </Button>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="mask" className="space-y-2">
                {result && (
                  <>
                    <img
                      src={result.maskDataUrl}
                      alt="Masque d'eau"
                      className="w-full rounded-lg bg-black"
                    />
                    <Button
                      onClick={downloadMask}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le masque
                    </Button>
                  </>
                )}
              </TabsContent>
            </Tabs>

            {/* Results Stats */}
            {result && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Couverture d'eau</span>
                    <span className="font-medium">
                      {result.waterPercentage.toFixed(2)}%
                    </span>
                  </div>
                  <Progress value={result.waterPercentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Dimensions</p>
                    <p className="font-medium">
                      {result.originalDimensions.width} × {result.originalDimensions.height}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Surface eau</p>
                    <p className="font-medium">
                      {((result.waterPercentage / 100) * 
                        result.originalDimensions.width * 
                        result.originalDimensions.height).toFixed(0)} px²
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSegment}
                disabled={isProcessing || isModelLoading || !selectedFile}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : isModelLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Chargement du modèle...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Détecter l'eau
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>✓ Traitement 100% local (confidentialité)</p>
          <p>✓ Modèle IA optimisé pour imagerie satellite</p>
          <p>✓ Résultats exportables (PNG, masque binaire)</p>
        </div>
      </CardContent>
    </Card>
  );
};
