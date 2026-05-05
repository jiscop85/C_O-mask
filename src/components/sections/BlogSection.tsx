import { useLanguage } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogPosts } from '@/data/blog';

export function BlogSection() {
  const { t, language } = useLanguage();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (language === 'fa') {
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <section id="blog" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 neural-grid opacity-20" />
      
      <div className="container relative z-10 px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            {t('blog.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('blog.subtitle')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mt-4" />
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <article
              key={post.id}
              className="group glass rounded-2xl overflow-hidden hover-lift fade-in-up opacity-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <Link to={`/blog/${post.id}`}>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={language === 'fa' ? post.titleFa : post.titleEn}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
              </Link>

              {/* Content */}
              <div className="p-6">
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {language === 'fa' ? post.readTimeFa : post.readTime}
                  </span>
                </div>

                {/* Title */}
                <Link to={`/blog/${post.id}`}>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {language === 'fa' ? post.titleFa : post.titleEn}
                  </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {language === 'fa' ? post.excerptFa : post.excerptEn}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Read More */}
                <Button variant="ghost" size="sm" className="group/btn p-0 h-auto" asChild>
                  <Link to={`/blog/${post.id}`}>
                    {t('blog.readMore')}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="heroOutline" size="lg" className="group" asChild>
            <Link to="/blog">
              {t('blog.viewAll')}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
