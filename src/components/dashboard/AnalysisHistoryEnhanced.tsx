import { useState } from 'react';
import { Search, Filter, Download, MapPin, Calendar, Tag, Trash2, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export const AnalysisHistoryEnhanced = () => {
  const {
    history,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedTags,
    setSelectedTags,
    allTags,
    updateAnalysis,
    deleteAnalysis,
  } = useAnalysisHistory();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');

  const handleEdit = (entry: any) => {
    setEditingId(entry.id);
    setEditNotes(entry.notes || '');
    setEditTags(entry.tags?.join(', ') || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    await updateAnalysis(editingId, {
      notes: editNotes,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
    });

    setEditingId(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historique des Analyses
          </CardTitle>
          <Badge variant="secondary">{history.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans l'historique..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* History List */}
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">Aucune analyse dans l'historique</p>
              </div>
            ) : (
              history.map((entry) => (
                <Card key={entry.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            {entry.zone_name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(entry.created_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(entry)}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Modifier l'analyse</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Notes</Label>
                                  <Textarea
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="Ajouter des notes..."
                                    rows={4}
                                  />
                                </div>
                                <div>
                                  <Label>Tags (séparés par des virgules)</Label>
                                  <Input
                                    value={editTags}
                                    onChange={(e) => setEditTags(e.target.value)}
                                    placeholder="ex: sécheresse, agriculture, urgent"
                                  />
                                </div>
                                <Button onClick={handleSaveEdit} className="w-full">
                                  Enregistrer
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => deleteAnalysis(entry.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {entry.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Surface:</span>
                          <span className="ml-1 font-medium">
                            {entry.analysis_data.surface.value} {entry.analysis_data.surface.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">NDWI:</span>
                          <span className="ml-1 font-medium">
                            {entry.analysis_data.ndwi.average.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {entry.notes && (
                        <p className="text-xs text-muted-foreground italic border-l-2 border-primary pl-2">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
