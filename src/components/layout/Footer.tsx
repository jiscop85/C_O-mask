import { useLanguage } from '@/contexts/AuthContext';
import { Github, Linkedin, Mail, Heart, Phone, Send } from 'lucide-react';

export function Footer() {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-border/50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 neural-grid opacity-10" />


