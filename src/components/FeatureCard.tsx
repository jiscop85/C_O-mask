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
          
          <div className="relative z-10">
            {/* Icon */}
            <motion.div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className="w-8 h-8 text-primary-foreground" />
            </motion.div>

            {/* Title */}
            <h3 className="font-display text-2xl text-foreground mb-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 font-medium" dir="rtl">
              {titlePersian}
            </p>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-2">
              {description}
            </p>
            <p className="text-muted-foreground/70 text-xs leading-relaxed" dir="rtl">
              {descriptionPersian}
            </p>

            {/* Arrow indicator */}
            <motion.div
              className="mt-6 flex items-center gap-2 text-primary"
              initial={{ x: 0 }}
              whileHover={{ x: 10 }}
            >
              <span className="text-sm font-medium">Explore</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default FeatureCard;
