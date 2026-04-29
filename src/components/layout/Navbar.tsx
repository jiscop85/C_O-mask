import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
