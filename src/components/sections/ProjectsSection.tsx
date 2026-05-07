import { useLanguage } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { projects } from '@/data/projects';

export function ProjectsSection() {
  const { t, language } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section id="projects" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />

      <div className="container relative z-10 px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            {t('projects.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('projects.subtitle')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mt-4" />
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="group relative glass rounded-2xl overflow-hidden hover-lift fade-in-up opacity-0"
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.image}
                  alt={language === 'fa' ? project.titleFa : project.titleEn}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent",
                  "transition-opacity duration-300",
                  hoveredId === project.id ? "opacity-90" : "opacity-70"
                )} />
                
                {/* Gradient Border on Hover */}
                <div className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-300",
                  hoveredId === project.id && "opacity-100"
                )}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-20`} />
                </div>
              </div>

              {/* Content */}
              <div className="relative p-6">
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {language === 'fa' ? project.titleFa : project.titleEn}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {language === 'fa' ? project.descriptionFa : project.descriptionEn}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <Button variant="glass" size="sm" asChild>
                    <a href={project.github} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  </Button>
                  <Button variant="gradient" size="sm" asChild>
                    <Link to={`/project/${project.id}`}>
                      <ExternalLink className="w-4 h-4" />
                      {t('projects.viewCase')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="heroOutline" size="lg" className="group" asChild>
            <Link to="/projects">
              {t('projects.viewAll')}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
