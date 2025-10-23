import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface WaterAnalysisResult {
  surface: {
    value: number;
    unit: string;
    variation: number;
  };
  ndwi: {
    average: number;
    trend: 'stable' | 'increasing' | 'decreasing';
  };
  anomalies: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  forecast: Array<{
    day: number;
    predictedSurface: number;
    confidence: number;
  }>;
  alerts: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high';
    message: string;
  }>;
  suggestions: string[];
}

export const useWaterAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<WaterAnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeWaterBody = async (geometry: any, parameters: any) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('water-analysis-ai', {
        body: { geometry, parameters }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      
      toast({
        title: "Analyse terminée",
        description: "Les résultats de l'analyse IA sont disponibles.",
      });

      return data;
    } catch (error) {
      console.error('Error analyzing water body:', error);
      
      toast({
        title: "Erreur d'analyse",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeWaterBody,
    isAnalyzing,
    result,
  };
};
