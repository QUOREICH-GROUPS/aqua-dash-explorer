import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { WaterAnalysisResult } from './useWaterAnalysis';

export interface AnalysisHistoryEntry {
  id: string;
  user_id: string;
  zone_name: string;
  zone_type: string;
  geometry: any;
  analysis_data: WaterAnalysisResult;
  weather_data?: any;
  agriculture_data?: any;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useAnalysisHistory = () => {
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setHistory((data || []) as unknown as AnalysisHistoryEntry[]);
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnalysis = async (
    zoneName: string,
    zoneType: string,
    geometry: any,
    analysisData: WaterAnalysisResult,
    weatherData?: any,
    agricultureData?: any,
    tags?: string[],
    notes?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .insert({
          user_id: user.id,
          zone_name: zoneName,
          zone_type: zoneType,
          geometry,
          analysis_data: analysisData as any,
          weather_data: weatherData as any,
          agriculture_data: agricultureData as any,
          tags,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      setHistory((prev) => [data as unknown as AnalysisHistoryEntry, ...prev]);
      
      toast({
        title: "Analyse sauvegardée",
        description: "L'analyse a été ajoutée à l'historique",
      });

      return data;
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'analyse",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAnalysis = async (
    id: string,
    updates: Partial<Pick<AnalysisHistoryEntry, 'tags' | 'notes'>>
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('analysis_history')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setHistory((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
        )
      );

      toast({
        title: "Analyse mise à jour",
        description: "Les modifications ont été enregistrées",
      });
    } catch (error) {
      console.error('Error updating analysis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'analyse",
        variant: "destructive",
      });
    }
  };

  const deleteAnalysis = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('analysis_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setHistory((prev) => prev.filter((item) => item.id !== id));

      toast({
        title: "Analyse supprimée",
        description: "L'analyse a été retirée de l'historique",
      });
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'analyse",
        variant: "destructive",
      });
    }
  };

  const filteredHistory = history.filter((entry) => {
    const matchesSearch = 
      entry.zone_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = 
      selectedTags.length === 0 ||
      selectedTags.every((tag) => entry.tags?.includes(tag));

    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(
    new Set(history.flatMap((entry) => entry.tags || []))
  );

  return {
    history: filteredHistory,
    allHistory: history,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedTags,
    setSelectedTags,
    allTags,
    saveAnalysis,
    updateAnalysis,
    deleteAnalysis,
    refetch: fetchHistory,
  };
};
