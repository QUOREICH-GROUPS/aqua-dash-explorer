import { useState, useCallback, useRef } from 'react';
import { pipeline, env } from '@huggingface/transformers';
import { useToast } from '@/hooks/use-toast';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

interface SegmentationResult {
  maskDataUrl: string;
  waterPercentage: number;
  processedImageUrl: string;
  originalDimensions: { width: number; height: number };
}

export const useWaterSegmentation = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [result, setResult] = useState<SegmentationResult | null>(null);
  const { toast } = useToast();
  const segmenterRef = useRef<any>(null);

  const loadModel = useCallback(async () => {
    if (segmenterRef.current) return segmenterRef.current;

    setIsModelLoading(true);
    try {
      toast({
        title: "Chargement du modèle IA",
        description: "Téléchargement du modèle de segmentation (première fois uniquement)...",
      });

      // Use a segmentation model optimized for satellite imagery
      segmenterRef.current = await pipeline(
        'image-segmentation',
        'Xenova/segformer-b0-finetuned-ade-512-512',
        { device: 'webgpu' }
      );

      toast({
        title: "Modèle prêt",
        description: "Le modèle de segmentation est chargé et prêt à l'emploi",
      });

      return segmenterRef.current;
    } catch (error) {
      console.error('Error loading model:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger le modèle IA",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsModelLoading(false);
    }
  }, [toast]);

  const resizeImage = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement
  ) => {
    let width = image.naturalWidth;
    let height = image.naturalHeight;
    const originalDimensions = { width, height };

    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
        width = MAX_IMAGE_DIMENSION;
      } else {
        width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
        height = MAX_IMAGE_DIMENSION;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    
    return originalDimensions;
  };

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const segmentWater = useCallback(async (imageFile: File) => {
    setIsProcessing(true);
    setResult(null);

    try {
      const segmenter = await loadModel();
      
      toast({
        title: "Analyse en cours",
        description: "Segmentation de l'image satellite...",
      });

      // Load and prepare image
      const imageElement = await loadImage(imageFile);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      const originalDimensions = resizeImage(canvas, ctx, imageElement);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);

      // Segment the image
      const segments = await segmenter(imageData);

      if (!segments || !Array.isArray(segments)) {
        throw new Error('Invalid segmentation result');
      }

      // Find water-related segments
      const waterLabels = ['water', 'sea', 'river', 'lake', 'ocean', 'swimming pool'];
      const waterSegments = segments.filter((segment: any) =>
        waterLabels.some(label => segment.label?.toLowerCase().includes(label))
      );

      // Create water mask
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = canvas.width;
      outputCanvas.height = canvas.height;
      const outputCtx = outputCanvas.getContext('2d');

      if (!outputCtx) throw new Error('Could not get output canvas context');

      // Draw original image
      outputCtx.drawImage(canvas, 0, 0);
      
      // Apply water segmentation overlay
      outputCtx.globalAlpha = 0.5;
      outputCtx.fillStyle = '#3b82f6'; // Blue for water

      let waterPixelCount = 0;
      const totalPixels = canvas.width * canvas.height;

      if (waterSegments.length > 0) {
        waterSegments.forEach((segment: any) => {
          if (segment.mask && segment.mask.data) {
            const imageData = outputCtx.createImageData(canvas.width, canvas.height);
            
            for (let i = 0; i < segment.mask.data.length; i++) {
              if (segment.mask.data[i] > 0.5) {
                const pixelIndex = i * 4;
                imageData.data[pixelIndex] = 59;     // R
                imageData.data[pixelIndex + 1] = 130; // G
                imageData.data[pixelIndex + 2] = 246; // B
                imageData.data[pixelIndex + 3] = 128; // A (50% opacity)
                waterPixelCount++;
              }
            }
            
            outputCtx.putImageData(imageData, 0, 0);
          }
        });
      }

      const waterPercentage = (waterPixelCount / totalPixels) * 100;

      // Create mask-only canvas
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext('2d');

      if (maskCtx) {
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        
        if (waterSegments.length > 0) {
          waterSegments.forEach((segment: any) => {
            if (segment.mask && segment.mask.data) {
              const imageData = maskCtx.createImageData(maskCanvas.width, maskCanvas.height);
              
              for (let i = 0; i < segment.mask.data.length; i++) {
                if (segment.mask.data[i] > 0.5) {
                  const pixelIndex = i * 4;
                  imageData.data[pixelIndex] = 255;
                  imageData.data[pixelIndex + 1] = 255;
                  imageData.data[pixelIndex + 2] = 255;
                  imageData.data[pixelIndex + 3] = 255;
                }
              }
              
              maskCtx.putImageData(imageData, 0, 0);
            }
          });
        }
      }

      const finalResult: SegmentationResult = {
        maskDataUrl: maskCanvas.toDataURL('image/png'),
        waterPercentage,
        processedImageUrl: outputCanvas.toDataURL('image/png'),
        originalDimensions,
      };

      setResult(finalResult);

      toast({
        title: "Segmentation terminée",
        description: `Plans d'eau détectés: ${waterPercentage.toFixed(2)}% de l'image`,
      });

      return finalResult;
    } catch (error) {
      console.error('Error segmenting water:', error);
      toast({
        title: "Erreur de segmentation",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [loadModel, toast]);

  return {
    segmentWater,
    isProcessing,
    isModelLoading,
    result,
  };
};
