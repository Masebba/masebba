import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  GithubIcon,
  CalendarIcon,
  TagIcon,
} from 'lucide-react';
import { useProjects } from '../lib/hooks/useProjects';
import { Project } from '../types';

function formatDateValue(value: unknown): string {
  if (!value) return '';

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      });
    }
    return value;
  }

  if (
    typeof value === 'object' &&
    value &&
    'toDate' in value &&
    typeof (value as any).toDate === 'function'
  ) {
    return (value as any).toDate().toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
  }

  return '';
}

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

  const galleryImages = useMemo(
    () =>
      [project?.detailImage1, project?.detailImage2].filter(
        (image): image is string => Boolean(image),
      ),
    [project],
  );

  if (!checked) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-12 text-center min-h-[60vh] flex items-center justify-center">
        <p className="text-muted">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-main mb-4">Project Not Found</h1>
        <p className="text-muted mb-8">
          The project you are looking for does not exist or has been removed.
        </p>
        <Link to="/portfolio">
          <Button>Back to Portfolio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <Link
        to="/portfolio"
        className="inline-flex items-center text-muted hover:text-primary mb-8 transition-colors font-medium"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Portfolio
      </Link>

      <div className="aspect-[21/9] w-full bg-surface-dark rounded-2xl mb-12 flex items-center justify-center text-muted overflow-hidden relative shadow-lg">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-medium">
              Project Cover Image Placeholder
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
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
            {galleryImages.length > 0 ? (
              <div className="my-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-video bg-surface rounded-xl overflow-hidden border border-border"
                  >
                    <img
                      src={image}
                      alt={`${project.title} image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="my-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="aspect-video bg-surface rounded-xl flex items-center justify-center border border-border">
                  <span className="text-sm text-muted">No extra images uploaded</span>
                </div>
                <div className="aspect-video bg-surface rounded-xl flex items-center justify-center border border-border">
                  <span className="text-sm text-muted">No extra images uploaded</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-72 space-y-10">
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
                      {formatDateValue(project.createdAt)}
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
                {project.technologies?.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-background border border-border rounded-md text-xs font-medium text-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {project.liveLink && project.liveLink !== '#' && (
              <a
                href={project.liveLink}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="gap-2 justify-center"
                >
                  View Live Site <ExternalLinkIcon className="w-4 h-4" />
                </Button>
              </a>
            )}
            {project.sourceLink && project.sourceLink !== '#' && (
              <a
                href={project.sourceLink}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="gap-2 justify-center"
                >
                  Source Code <GithubIcon className="w-4 h-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
