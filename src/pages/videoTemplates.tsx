import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Code2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { projects, projectSectors, getProjectsBySector, ProjectSector } from '@/data/projects';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Projects() {
  const { t, language } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState<ProjectSector>('all');

  const filteredProjects = getProjectsBySector(activeSector);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20 transition-colors duration-700" />
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute inset-0 neural-grid opacity-[0.03]" />
      </div>

      <ThemeToggle />
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        <div className="container relative z-10 px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Code2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {language === 'fa' ? 'نمونه کارها' : 'Portfolio'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              {language === 'fa' ? 'همه پروژه‌ها' : 'All Projects'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === 'fa' 
                ? 'مجموعه‌ای از پروژه‌های هوش مصنوعی، وب۳ و یادگیری ماشین که روی آن‌ها کار کرده‌ام'
                : 'A collection of AI-Powered, Web3 & Machine Learning projects I have worked on'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Sector Filter */}
      <section className="pb-8">
        <div className="container px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {projectSectors.map((sector) => (
              <button
                key={sector.id}
                onClick={() => setActiveSector(sector.id as ProjectSector)}
                className={cn(
                  "group relative px-5 py-3 rounded-2xl font-medium transition-all duration-300",
                  "border-2 hover:scale-105 active:scale-95",
                  activeSector === sector.id
                    ? "border-transparent shadow-lg"
                    : "border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm"
                )}
              >
                {/* Active gradient background */}
                {activeSector === sector.id && (
                  <div className={cn(
                    "absolute inset-0 rounded-2xl bg-gradient-to-r",
                    sector.color
                  )} />
                )}
                
                <span className={cn(
                  "relative flex items-center gap-2 transition-colors",
                  activeSector === sector.id ? "text-white" : "text-foreground"
                )}>
                  <span className="text-lg">{sector.icon}</span>
                  <span>{language === 'fa' ? sector.labelFa : sector.labelEn}</span>
                  <span className={cn(
                    "ml-1 px-2 py-0.5 rounded-full text-xs",
                    activeSector === sector.id 
                      ? "bg-white/20 text-white" 
                      : "bg-primary/10 text-primary"
                  )}>
                    {sector.id === 'all' 
                      ? projects.length 
                      : projects.filter(p => p.sector === sector.id).length
                    }
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="group relative glass rounded-2xl overflow-hidden hover-lift fade-in-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Sector Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
                    "bg-gradient-to-r text-white shadow-lg",
                    projectSectors.find(s => s.id === project.sector)?.color || 'from-primary to-accent'
                  )}>
                    {projectSectors.find(s => s.id === project.sector)?.icon}{' '}
                    {language === 'fa' 
                      ? projectSectors.find(s => s.id === project.sector)?.labelFa
                      : projectSectors.find(s => s.id === project.sector)?.labelEn
                    }
                  </span>
                </div>

                {/* Image */}
                <Link to={`/project/${project.id}`}>
                  <div className="relative h-48 overflow-hidden">
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
                    
                    <div className={cn(
                      "absolute inset-0 opacity-0 transition-opacity duration-300",
                      hoveredId === project.id && "opacity-100"
                    )}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-20`} />
                    </div>
                  </div>
                </Link>

                {/* Content */}
                <div className="relative p-6">
                  <Link to={`/project/${project.id}`}>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {language === 'fa' ? project.titleFa : project.titleEn}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                    {language === 'fa' ? project.descriptionFa : project.descriptionEn}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* API Integrations indicator */}
                  {project.apiIntegrations && project.apiIntegrations.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                      <Code2 className="w-3.5 h-3.5 text-accent" />
                      <span>
                        {project.apiIntegrations.length} API {language === 'fa' ? 'یکپارچه‌سازی' : 'Integrations'}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Button variant="glass" size="sm" asChild>
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button variant="gradient" size="sm" className="flex-1" asChild>
                      <Link to={`/project/${project.id}`}>
                        <ExternalLink className="w-4 h-4" />
                        {language === 'fa' ? 'مشاهده جزئیات' : 'View Details'}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <Code2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {language === 'fa' ? 'پروژه‌ای یافت نشد' : 'No projects found'}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
