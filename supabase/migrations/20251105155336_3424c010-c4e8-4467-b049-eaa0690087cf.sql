-- Table pour les notifications en temps réel
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('alert', 'info', 'warning', 'success')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Table pour l'historique enrichi des analyses
CREATE TABLE public.analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  zone_name TEXT NOT NULL,
  zone_type TEXT NOT NULL,
  geometry JSONB NOT NULL,
  analysis_data JSONB NOT NULL,
  weather_data JSONB,
  agriculture_data JSONB,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Policies pour notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Policies pour analysis_history
CREATE POLICY "Users can view own analyses"
ON public.analysis_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analyses"
ON public.analysis_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
ON public.analysis_history
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
ON public.analysis_history
FOR DELETE
USING (auth.uid() = user_id);

-- Triggers pour updated_at
CREATE TRIGGER update_analysis_history_updated_at
BEFORE UPDATE ON public.analysis_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_analysis_history_user_id ON public.analysis_history(user_id);
CREATE INDEX idx_analysis_history_created_at ON public.analysis_history(created_at DESC);
CREATE INDEX idx_analysis_history_tags ON public.analysis_history USING GIN(tags);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;