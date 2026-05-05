import { useLanguage } from '@/contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';

const skills = [
  { name: 'Python', level: 95, category: 'Languages' },
  { name: 'PyTorch', level: 92, category: 'Frameworks' },
  { name: 'TensorFlow', level: 88, category: 'Frameworks' },
  { name: 'LLMs', level: 90, category: 'AI/ML' },
  { name: 'LangChain', level: 88, category: 'AI/ML' },
  { name: 'NLP', level: 90, category: 'AI/ML' },
  { name: 'Computer Vision', level: 85, category: 'AI/ML' },
  { name: 'Docker', level: 85, category: 'DevOps' },
  { name: 'AWS', level: 80, category: 'Cloud' },
  { name: 'MLOps', level: 82, category: 'DevOps' },
];

const stats = [
  { value: '5+', labelEn: 'Years Experience', labelFa: 'سال تجربه' },
  { value: '30+', labelEn: 'Projects Completed', labelFa: 'پروژه تکمیل شده' },
  { value: '15+', labelEn: 'Happy Clients', labelFa: 'مشتری راضی' },
  { value: '10+', labelEn: 'Publications', labelFa: 'مقاله منتشر شده' },
];

export function AboutSection() {
  const { t, language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 neural-grid opacity-30" />
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary/5 to-transparent" />

      <div className="container relative z-10 px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            {t('about.title')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: About Text & Stats */}
          <div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {t('about.description')}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`glass rounded-xl p-6 text-center hover-lift ${
                    isVisible ? 'fade-in-up opacity-0' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'fa' ? stat.labelFa : stat.labelEn}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Skills */}
          <div>
            <h3 className="text-2xl font-bold mb-8">{t('about.skills.title')}</h3>
            <div className="space-y-5">
              {skills.map((skill, index) => (
                <div
                  key={skill.name}
                  className={`${isVisible ? 'fade-in-up opacity-0' : 'opacity-0'}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-sm text-primary">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: isVisible ? `${skill.level}%` : '0%',
                        transitionDelay: `${index * 0.05}s`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
