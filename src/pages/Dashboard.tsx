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

