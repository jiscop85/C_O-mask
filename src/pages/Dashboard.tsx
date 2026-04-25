import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Film, Mic2, Calendar, TrendingUp, Clock, Zap, 
  ArrowRight, Activity, BarChart3, PieChart, Users,
  Image, Wand2, Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransformationHistory } from '@/hooks/useTransformationHistory';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';


const Dashboard = () => {
  const { user, profile } = useAuth();
  const { history, loading } = useTransformationHistory();
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    faceSwaps: 0,
    voiceChanges: 0,
    avgTime: 0,
  });

  // Calculate stats
  const faceSwaps = history.filter(h => h.transformation_type === 'face_swap');
  const voiceChanges = history.filter(h => h.transformation_type === 'voice_change');
  const avgProcessingTime = history.length > 0 
    ? Math.round(history.reduce((acc, h) => acc + (h.processing_time_ms || 0), 0) / history.length)
    : 0;

  // Animate stats on load
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedStats({
        total: Math.round(history.length * eased),
        faceSwaps: Math.round(faceSwaps.length * eased),
        voiceChanges: Math.round(voiceChanges.length * eased),
        avgTime: Math.round(avgProcessingTime * eased),
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [history.length, faceSwaps.length, voiceChanges.length, avgProcessingTime]);

  // Generate chart data from history
  const generateChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        faceSwaps: 0,
        voiceChanges: 0,
        total: 0,
      };
    });

    history.forEach(record => {
      const recordDate = new Date(record.created_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) {
        const index = 6 - diffDays;
        if (index >= 0 && index < 7) {
          last7Days[index].total++;
          if (record.transformation_type === 'face_swap') {
            last7Days[index].faceSwaps++;
          } else {
            last7Days[index].voiceChanges++;
          }
        }
      }
    });

    return last7Days;
  };

  const chartData = generateChartData();
  
  const pieData = [
    { name: 'Face Swaps', value: faceSwaps.length, color: 'hsl(38, 92%, 50%)' },
    { name: 'Voice Changes', value: voiceChanges.length, color: 'hsl(280, 70%, 50%)' },
  ];

  const quickActions = [
    { 
      title: 'Face Swap', 
      titlePersian: 'تغییر چهره',
      icon: Film, 
      path: '/face-swap', 
      gradient: 'from-primary to-cinema-crimson',
      description: 'Transform faces with AI'
    },
    { 
      title: 'Voice Changer', 
      titlePersian: 'تغییر صدا',
      icon: Mic2, 
      path: '/voice-changer', 
      gradient: 'from-accent to-amber-600',
      description: 'Real-time voice transformation'
    },
    { 
      title: 'Book Session', 
      titlePersian: 'رزرو جلسه',
      icon: Calendar, 
      path: '/booking', 
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Schedule a consultation'
    },
  ];

  const recentTransformations = history.slice(0, 5);

  return (
    <div className="min-h-screen pt-24 pb-12 relative">
      {/* Animated Background */}
      <div className="mesh-gradient" />
      <div className="grid-overlay" />
      
      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb orb-1" style={{ background: 'radial-gradient(circle, hsl(38 92% 50% / 0.3) 0%, transparent 70%)' }} />
        <div className="floating-orb orb-2" style={{ background: 'radial-gradient(circle, hsl(280 70% 50% / 0.25) 0%, transparent 70%)' }} />
        <div className="floating-orb orb-3" style={{ background: 'radial-gradient(circle, hsl(180 80% 50% / 0.2) 0%, transparent 70%)' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-sm tech-text text-muted-foreground">ANALYTICS DASHBOARD</span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4">
            WELCOME <span className="text-accent gold-glow">{profile?.display_name || 'CREATOR'}</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Track your transformations, monitor performance, and access all features in one place.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2" dir="rtl">
            تبدیل‌های خود را پیگیری کنید، عملکرد را مانیتور کنید
          </p>
        </motion.div>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Transformations', labelPersian: 'کل تبدیل‌ها', value: animatedStats.total, icon: Sparkles, color: 'text-accent' },
            { label: 'Face Swaps', labelPersian: 'تغییر چهره', value: animatedStats.faceSwaps, icon: Image, color: 'text-primary' },
            { label: 'Voice Changes', labelPersian: 'تغییر صدا', value: animatedStats.voiceChanges, icon: Wand2, color: 'text-purple-400' },
            { label: 'Avg. Processing (ms)', labelPersian: 'زمان پردازش', value: animatedStats.avgTime, icon: Clock, color: 'text-emerald-400' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="neon-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className={`text-4xl font-display ${stat.color} mb-2`}>{stat.value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground/70" dir="rtl">{stat.labelPersian}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 neon-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  ACTIVITY OVERVIEW
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Last 7 days performance</p>
              </div>
            </div>
 ashboard;
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorFaceSwaps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVoiceChanges" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(280, 70%, 50%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(280, 70%, 50%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="faceSwaps" 
                    stroke="hsl(38, 92%, 50%)" 
                    fillOpacity={1} 
                    fill="url(#colorFaceSwaps)"
                    name="Face Swaps"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="voiceChanges" 
                    stroke="hsl(280, 70%, 50%)" 
                    fillOpacity={1} 
                    fill="url(#colorVoiceChanges)"
                    name="Voice Changes"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="neon-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2">
                <PieChart className="w-5 h-5 text-accent" />
                BREAKDOWN
              </h2>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3 mt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="font-display text-2xl text-foreground mb-6 flex items-center gap-3">
            <Zap className="w-6 h-6 text-accent" />
            QUICK ACTIONS
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.7 }}
              >
                <Link to={action.path}>
                  <motion.div
                    className="neon-card p-6 group cursor-pointer h-full"
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow`}>
                      <action.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-display text-xl text-foreground mb-1 flex items-center gap-2">
                      {action.title}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent" />
                    </h3>
                    <p className="text-xs text-muted-foreground/70 mb-2" dir="rtl">{action.titlePersian}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Transformations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="font-display text-2xl text-foreground mb-6 flex items-center gap-3">
            <Clock className="w-6 h-6 text-accent" />
            RECENT TRANSFORMATIONS
          </h2>


