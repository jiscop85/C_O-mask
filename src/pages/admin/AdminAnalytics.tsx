import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Cpu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('7d');
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [modelData, setModelData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  useEffect(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const fetchAnalytics = async () => {
      const { data } = await supabase
        .from('transformation_history')
        .select('*')
        .gte('created_at', since.toISOString())
        .order('created_at');

      const transforms = data || [];

      // Daily counts
      const daily: Record<string, { face_swap: number; voice_change: number; video: number }> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
        daily[key] = { face_swap: 0, voice_change: 0, video: 0 };
      }
      transforms.forEach((t) => {
        const key = new Date(t.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' });
        if (daily[key]) {
          const type = t.transformation_type as keyof typeof daily[typeof key];
          if (type in daily[key]) daily[key][type]++;
        }
      });
      setDailyData(Object.entries(daily).map(([date, v]) => ({ date, ...v })));

      // Model usage
      const models: Record<string, number> = {};
      transforms.forEach((t) => {
        const meta = t.metadata as Record<string, any> | null;
        const model = (meta?.model as string) || t.transformation_type;
        models[model] = (models[model] || 0) + 1;
      });
      setModelData(Object.entries(models).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count));

      
      // Processing times
      const perf: Record<string, { total: number; count: number }> = {};
      transforms.forEach((t) => {
        const key = new Date(t.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' });
        if (!perf[key]) perf[key] = { total: 0, count: 0 };
        perf[key].total += t.processing_time_ms || 0;
        perf[key].count++;
      });
      setPerformanceData(
        Object.entries(perf).map(([date, v]) => ({
          date,
          avgMs: v.count > 0 ? Math.round(v.total / v.count) : 0,
        }))
      );
    };

    fetchAnalytics();
  }, [period]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display text-foreground tracking-wider">ANALYTICS</h1>
          <p className="text-muted-foreground">Platform usage & performance metrics</p>
        </motion.div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Daily Breakdown */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader><CardTitle className="text-foreground flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" />Daily Transformations</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="face_swap" fill="hsl(38,92%,50%)" name="Face Swap" radius={[4, 4, 0, 0]} />
                <Bar dataKey="voice_change" fill="hsl(280,70%,50%)" name="Voice Change" radius={[4, 4, 0, 0]} />
                <Bar dataKey="video" fill="hsl(180,80%,50%)" name="Video" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Model Usage */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-foreground flex items-center gap-2"><Cpu className="w-5 h-5 text-accent" />Model Usage</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {modelData.map((m, i) => (
                <div key={m.name} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{m.name.replace('_', ' ')}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        style={{ width: `${modelData[0]?.count ? (m.count / modelData[0].count) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-8 text-right">{m.count}</span>
                  </div>
                </div>
              ))}
              {modelData.length === 0 && <p className="text-muted-foreground text-sm">No data yet</p>}
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-foreground flex items-center gap-2"><Clock className="w-5 h-5 text-green-400" />Avg Processing Time</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="avgMs" stroke="hsl(142,70%,45%)" strokeWidth={2} dot={{ r: 3 }} name="Avg (ms)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
