import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Stats {
  totalUsers: number;
  totalTransformations: number;
  totalBookings: number;
  avgProcessingTime: number;
}

