import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { StatsSection } from '../components/home/StatsSection';
import { FeaturedServices } from '../components/home/FeaturedServices';
import { FeaturedProjects } from '../components/home/FeaturedProjects';
import { FeaturedBlogPosts } from '../components/home/FeaturedBlogPosts';
import { CTASection } from '../components/home/CTASection';
export function Home() {
  return (
    <div className="flex-1 flex flex-col w-full">
      <HeroSection />
      <StatsSection />
      <FeaturedServices />
      <FeaturedProjects />
      <FeaturedBlogPosts />
      <CTASection />
    </div>);

}