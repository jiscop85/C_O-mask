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


  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('transformation_history').delete().eq('id', id);
    if (!error) {
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.success('Record deleted');
    } else {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground tracking-wider">CONTENT MODERATION</h1>
        <p className="text-muted-foreground">Review and manage user-generated transformations</p>
      </motion.div>

      <div className="grid gap-3">
        {records.map((record, i) => (
          <motion.div key={record.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    record.transformation_type === 'face_swap' ? 'bg-accent/20 text-accent' :
                    record.transformation_type === 'voice_change' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {record.transformation_type === 'face_swap' ? '🎭' : record.transformation_type === 'voice_change' ? '🎤' : '🎬'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize">{record.transformation_type.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">
                      by {record.user_name} • {new Date(record.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {record.processing_time_ms && (
                    <Badge variant="outline" className="text-xs">{record.processing_time_ms}ms</Badge>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(record.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {records.length === 0 && !loading && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground">No content to review</p>
          </div>
        )}
      </div>
    </div>
  );
}
