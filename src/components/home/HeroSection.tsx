import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRightIcon, FileTextIcon, CheckCircleIcon, AwardIcon, UsersIcon } from 'lucide-react';
import { useSiteSettings } from '../../lib/hooks/useSiteSettings';
import { useTheme } from '../../contexts/ThemeContext';
import { Skeleton } from '../ui/Skeleton';

export function HeroSection() {
  const { settings, loading } = useSiteSettings();
  const { theme } = useTheme();

  const isDarkTheme = theme === 'dark' || theme === 'black' || theme === 'ocean' || theme?.toString().toLowerCase().includes('dark');

  const heroOverlay = isDarkTheme
    ? 'linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.72))'
    : 'linear-gradient(rgba(255,255,255,0.88), rgba(255,255,255,0.88))';

  const heroStyle = settings.heroBackgroundImageUrl
    ? {
        backgroundImage: `${heroOverlay}, url(${settings.heroBackgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : undefined;

  if (loading) {
    return (
      <section className="relative py-10 md:py-12 overflow-hidden bg-gradient-to-br from-background via-surface/30 to-background transition-colors duration-300">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center space-y-6">
            <Skeleton variant="rectangular" height={28} width={220} className="rounded-full" />
            <Skeleton variant="text" width="80%" height={60} />
            <Skeleton variant="text" width="60%" height={28} />
            <Skeleton variant="text" lines={3} />
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Skeleton variant="rectangular" height={48} width={180} className="rounded-xl" />
              <Skeleton variant="rectangular" height={48} width={150} className="rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-10 md:py-12 overflow-hidden bg-gradient-to-br from-background via-surface/30 to-background transition-colors duration-300" style={heroStyle}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-sm font-medium text-muted mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-blink" />
            Available for new opportunities
          </div>

          <h1 className="text-5xl md:text-5xl font-bold text-main mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            {settings.heroTitle || 'My name is Masebba A. Nasser'}
          </h1>

          <p className="text-xl md:text-2xl text-primary font-semibold mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            {settings.heroSubtitle || 'Memorable Digital Experience Developer'}
          </p>

          <p className="text-base md:text-lg text-muted mb-10 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Data Analytics, Mobile or Web App, I am ready to DO IT. Invest your time and efforts on running your business. Leave the Designing and Development to me.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link to="/contact" className="w-full sm:w-auto">
              <Button size="lg" fullWidth className="gap-2 group">
                Get a Free Quote
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link to="/about" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" fullWidth className="gap-2">
                <FileTextIcon className="w-4 h-4" />
                Learn More
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-400">
            <div className="flex items-center gap-2 text-muted">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">Trusted</span>
            </div>

            <div className="flex items-center gap-2 text-muted">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <AwardIcon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">Experienced</span>
            </div>

            <div className="flex items-center gap-2 text-muted">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">Professional</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
