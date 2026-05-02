import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  titlePersian: string;
  description: string;
  descriptionPersian: string;
  link: string;
  gradient: string;
  delay?: number;
}

const FeatureCard = ({
  icon: Icon,
  title,
  titlePersian,
  description,
  descriptionPersian,
  link,
  gradient,
  delay = 0,
}: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      <Link to={link} className="block group">
        <div className="cinema-card p-8 h-full transition-all duration-500 group-hover:border-primary/50">
          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />
