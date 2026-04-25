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
