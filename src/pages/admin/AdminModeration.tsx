import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileWarning, Trash2, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TransformRecord {
  id: string;
  user_id: string;
  transformation_type: string;
  created_at: string;
  processing_time_ms: number | null;
  metadata: any;
  source_image_url: string | null;
  result_url: string | null;
  user_name?: string;
}

export default function AdminModeration() {
  const [records, setRecords] = useState<TransformRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: transforms } = await supabase
        .from('transformation_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (transforms) {
        // Get user names
        const userIds = [...new Set(transforms.map(t => t.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        const profileMap: Record<string, string> = {};
        (profiles || []).forEach((p) => {
          profileMap[p.id] = p.display_name || p.email || 'Unknown';
        });

        setRecords(transforms.map(t => ({ ...t, user_name: profileMap[t.user_id] || 'Unknown' })));
      }
      setLoading(false);
    };
    fetch();
  }, []);
