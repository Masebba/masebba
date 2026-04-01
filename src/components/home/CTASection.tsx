import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { MailIcon } from 'lucide-react';
export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-surface-dark text-white">
      <div className="absolute inset-0 bg-primary/10" />
      <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Have a project in mind?
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
          I'm currently available for freelance work and full-time
          opportunities. Let's build something amazing together.
        </p>
        <Link to="/contact">
          <Button size="lg" className="gap-2 text-main">
            <MailIcon className="w-5 h-5" />
            Get In Touch
          </Button>
        </Link>
      </div>
    </section>);

}