import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface TransformationRecord {
  id: string;
  transformation_type: 'face_swap' | 'voice_change';
  source_image_url: string | null;
  target_image_url: string | null;
  result_url: string | null;
  processing_time_ms: number | null;
  processing_mode: 'client' | 'server' | null;
  metadata: Json;
  created_at: string;
}

export const useTransformationHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<TransformationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transformation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data as TransformationRecord[]);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (record: Omit<TransformationRecord, 'id' | 'created_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const insertData = {
        user_id: user.id,
        transformation_type: record.transformation_type,
        source_image_url: record.source_image_url,
        target_image_url: record.target_image_url,
        result_url: record.result_url,
        processing_time_ms: record.processing_time_ms,
        processing_mode: record.processing_mode,
        metadata: record.metadata,
      };

      const { data, error } = await supabase
        .from('transformation_history')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      
      setHistory(prev => [data as TransformationRecord, ...prev]);
      return { data, error: null };
    } catch (error) {
      const err = error as Error;
      toast({
        variant: 'destructive',
        title: 'Failed to save',
        description: err.message,
      });
      return { data: null, error: err };
    }
  };

  const deleteRecord = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('transformation_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setHistory(prev => prev.filter(r => r.id !== id));
      toast({
        title: 'Deleted',
        description: 'Record removed from history.',
      });
      return { error: null };
    } catch (error) {
      const err = error as Error;
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: err.message,
      });
      return { error: err };
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  return {
    history,
    loading,
    addRecord,
    deleteRecord,
    refresh: fetchHistory,
  };
};
