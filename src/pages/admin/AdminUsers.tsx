import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Shield, ShieldCheck, ShieldAlert, MoreVertical, Ban, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

