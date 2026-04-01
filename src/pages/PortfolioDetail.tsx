import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  GithubIcon,
  CalendarIcon,
  UserIcon,
  TagIcon } from
'lucide-react';
import { useProjects } from '../lib/hooks/useProjects';
import { Project } from '../types';
export function PortfolioDetail() {
  const { id } = useParams();
  const { projects } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (id && projects.length > 0) {
      const found = projects.find((p) => p.id === id);
      setProject(found || null);
      setChecked(true);
    }
  }, [projects, id]);
  if (!checked) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl text-center min-h-[60vh] flex items-center justify-center">
        <p className="text-muted">Loading project...</p>
      </div>);

  }
  if (!project) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl text-center">
        <h1 className="text-3xl font-bold text-main mb-4">Project Not Found</h1>
        <p className="text-muted mb-8">
          The project you are looking for does not exist or has been removed.
        </p>
        <Link to="/portfolio">
          <Button>Back to Portfolio</Button>
        </Link>
      </div>);

  }
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Link
        to="/portfolio"
        className="inline-flex items-center text-muted hover:text-primary mb-8 transition-colors font-medium">
        
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Portfolio
      </Link>

      {/* Hero Image */}
      <div className="aspect-[21/9] w-full bg-surface-dark rounded-2xl mb-12 flex items-center justify-center text-muted overflow-hidden relative shadow-lg">
        {project.coverImage ?
        <img
          src={project.coverImage}
          alt={project.title}
          className="w-full h-full object-cover" /> :


        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-medium">
              Project Cover Image Placeholder
            </span>
          </div>
        }
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-main mb-4">
              {project.title}
            </h1>
            <p className="text-xl text-muted leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          <div className="prose prose-lg prose-invert max-w-none text-muted">
            {/* Gallery Placeholder */}
            <div className="my-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="aspect-video bg-surface rounded-xl flex items-center justify-center">
                Image 1
              </div>
              <div className="aspect-video bg-surface rounded-xl flex items-center justify-center">
                Image 2
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-10">
          {/* Project Details Card */}
          <div className="bg-surface p-6 rounded-xl border border-border space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-main uppercase tracking-wider mb-4">
                Project Details
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-muted">
                  <CalendarIcon className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <span className="block text-xs font-medium uppercase">
                      Date
                    </span>
                    <span className="text-main font-medium">
                      {new Date(project.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: 'long',
                          year: 'numeric'
                        }
                      )}
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-muted">
                  <TagIcon className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <span className="block text-xs font-medium uppercase">
                      Category
                    </span>
                    <span className="text-main font-medium">
                      {project.category}
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-main uppercase tracking-wider mb-3">
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies?.map((tech) =>
                <span
                  key={tech}
                  className="px-3 py-1 bg-background border border-border rounded-md text-xs font-medium text-muted">
                  
                    {tech}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {project.liveLink && project.liveLink !== "#" && (
            <a
              href={project.liveLink}
              target="_blank"
              rel="noreferrer"
              className="block">
              
                <Button
                variant="primary"
                size="lg"
                fullWidth
                className="gap-2 justify-center">
                
                  View Live Site <ExternalLinkIcon className="w-4 h-4" />
                </Button>
              </a>
            )}
            {project.sourceLink && project.sourceLink !== "#" && (
            <a
              href={project.sourceLink}
              target="_blank"
              rel="noreferrer"
              className="block">
              
                <Button
                variant="outline"
                size="lg"
                fullWidth
                className="gap-2 justify-center">
                
                  Source Code <GithubIcon className="w-4 h-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>);

}