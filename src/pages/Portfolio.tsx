import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProjectCard } from '../components/ProjectCard';
import { useProjects } from '../lib/hooks/useProjects';
import { useSiteSettings } from '../lib/hooks/useSiteSettings';
import { parseCreativeProjects, parsePublications } from '../lib/settingsContent';
import {
  DownloadIcon,
  PaletteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { SkeletonProjectCard } from '../components/ui/Skeleton';

const fallbackCreative = [
  {
    title: 'Photography Portfolio',
    category: 'Creative',
    icon: 'Camera',
    description:
      'A visual collection showcasing portrait, landscape, and event photography work.',
  },
  {
    title: 'Brand Identity System',
    category: 'Design',
    icon: 'Palette',
    description:
      'Complete logo, typography, and visual language package for a startup brand.',
  },
];

const fallbackPublications = [
  {
    title: 'AI-Driven User Experience Optimization',
    type: 'Concept Note',
    year: '2024',
    status: 'In Review',
    downloadUrl: '',
    description:
      'Exploring how machine learning can personalize UI/UX in real time based on user behavior.',
  },
  {
    title: 'Digital Transformation Strategy for SMEs',
    type: 'Proposal',
    year: '2023',
    status: 'Accepted',
    downloadUrl: '',
    description:
      'A strategic framework for small and medium enterprises to adopt cloud-first infrastructure.',
  },
];

const getStatusStyle = (s: string) => {
  switch (s) {
    case 'Published':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Accepted':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'In Review':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Submitted':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getTypeStyle = (t: string) => {
  switch (t) {
    case 'Research Paper':
      return 'bg-primary/10 text-primary';
    case 'Proposal':
      return 'bg-blue-100 text-blue-700';
    case 'Concept Note':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const PROJECTS_PER_PAGE = 8;
const SECTION_ITEMS_PER_PAGE = 2;

function PaginationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={currentPage === 1}
        className="gap-2"
      >
        <ChevronLeftIcon className="w-4 h-4" /> Prev
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-10 h-10 rounded-lg px-3 text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-primary text-background'
                : 'bg-surface text-muted hover:bg-surface-dark hover:text-main'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="gap-2"
      >
        Next <ChevronRightIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [creativePage, setCreativePage] = useState(1);
  const [publicationsPage, setPublicationsPage] = useState(1);

  const { projects, loading } = useProjects();
  const { settings, loading: settingsLoading } = useSiteSettings();

  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [projects]);

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE)
  );

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    return filteredProjects.slice(start, start + PROJECTS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const parsedCreative = useMemo(() => {
    const items = parseCreativeProjects(settings.portfolioNonTechProjects);
    return items.length ? items : fallbackCreative;
  }, [settings.portfolioNonTechProjects]);

  const parsedPublications = useMemo(() => {
    const items = parsePublications(settings.portfolioPublications);
    return items.length ? items : fallbackPublications;
  }, [settings.portfolioPublications]);

  const creativeTotalPages = Math.max(
    1,
    Math.ceil(parsedCreative.length / SECTION_ITEMS_PER_PAGE)
  );

  const publicationsTotalPages = Math.max(
    1,
    Math.ceil(parsedPublications.length / SECTION_ITEMS_PER_PAGE)
  );

  const paginatedCreative = useMemo(() => {
    const start = (creativePage - 1) * SECTION_ITEMS_PER_PAGE;
    return parsedCreative.slice(start, start + SECTION_ITEMS_PER_PAGE);
  }, [parsedCreative, creativePage]);

  const paginatedPublications = useMemo(() => {
    const start = (publicationsPage - 1) * SECTION_ITEMS_PER_PAGE;
    return parsedPublications.slice(start, start + SECTION_ITEMS_PER_PAGE);
  }, [parsedPublications, publicationsPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (creativePage > creativeTotalPages) setCreativePage(creativeTotalPages);
  }, [creativePage, creativeTotalPages]);

  useEffect(() => {
    if (publicationsPage > publicationsTotalPages)
      setPublicationsPage(publicationsTotalPages);
  }, [publicationsPage, publicationsTotalPages]);

  const startItem =
    filteredProjects.length === 0
      ? 0
      : (currentPage - 1) * PROJECTS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * PROJECTS_PER_PAGE, filteredProjects.length);

  if ((loading && projects.length === 0) || (settingsLoading && !settings.portfolioNonTechProjects)) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24 space-y-12">
        <div className="text-center mb-16 max-w-2xl mx-auto space-y-3">
          <div className="h-4 w-24 rounded-full bg-surface animate-pulse mx-auto" />
          <div className="h-12 w-80 max-w-full rounded-full bg-surface animate-pulse mx-auto" />
          <div className="h-5 w-full max-w-2xl rounded-full bg-surface animate-pulse mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonProjectCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-main mb-4">Selected Works</h1>
        <p className="text-lg text-muted leading-relaxed">
          A collection of my projects, case studies, creative work, and publications.
        </p>
      </div>

      <section className="mb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
              Development
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-main">Tech Projects</h3>
          </div>
          {projects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? 'bg-primary text-background'
                      : 'bg-surface text-muted hover:bg-surface-dark hover:text-main'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {paginatedProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10">
              <p className="text-sm text-muted">
                Showing {startItem}-{endItem} of {filteredProjects.length} projects
              </p>

              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={() => setCurrentPage((page) => Math.max(1, page - 1))}
                onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-10 text-center text-muted">
            No projects available yet.
          </div>
        )}
      </section>

      <section className="mb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
              Creative
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-main">Work outside of Software Development</h3>
          </div>
        </div>

        {paginatedCreative.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedCreative.map((item) => (
                <Card key={item.title} padding="lg" className="h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <PaletteIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-main mb-1">{item.title}</h4>
                      <p className="text-sm font-semibold text-[#4e72ac] mb-3">{item.category}</p>
                      <p className="text-muted">{item.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 mt-10">
              <p className="text-sm text-muted">
                Showing {Math.min((creativePage - 1) * SECTION_ITEMS_PER_PAGE + 1, parsedCreative.length)}
                -
                {Math.min(creativePage * SECTION_ITEMS_PER_PAGE, parsedCreative.length)} of{' '}
                {parsedCreative.length} projects
              </p>

              <PaginationControls
                currentPage={creativePage}
                totalPages={creativeTotalPages}
                onPrev={() => setCreativePage((page) => Math.max(1, page - 1))}
                onNext={() => setCreativePage((page) => Math.min(creativeTotalPages, page + 1))}
                onPageChange={(page) => setCreativePage(page)}
              />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-10 text-center text-muted">
            No non-tech projects available yet.
          </div>
        )}
      </section>

      <section>
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
              Research
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-main">Publications</h3>
          </div>
        </div>

        {paginatedPublications.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedPublications.map((item) => (
                <Card key={item.title} padding="lg" className="h-full">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-main mb-2">{item.title}</h4>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-full font-medium ${getTypeStyle(item.type)}`}>
                          {item.type}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full font-medium border ${getStatusStyle(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                        <span className="px-2 py-1 rounded-full font-medium bg-surface text-muted">
                          {item.year}
                        </span>
                      </div>
                    </div>

                    {item.downloadUrl ? (
                      <Button variant="outline" size="sm" className="gap-2">
                        <DownloadIcon className="w-4 h-4" /> Download
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-muted">{item.description}</p>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 mt-10">
              <p className="text-sm text-muted">
                Showing{' '}
                {Math.min((publicationsPage - 1) * SECTION_ITEMS_PER_PAGE + 1, parsedPublications.length)}
                -
                {Math.min(publicationsPage * SECTION_ITEMS_PER_PAGE, parsedPublications.length)} of{' '}
                {parsedPublications.length} publications
              </p>

              <PaginationControls
                currentPage={publicationsPage}
                totalPages={publicationsTotalPages}
                onPrev={() => setPublicationsPage((page) => Math.max(1, page - 1))}
                onNext={() => setPublicationsPage((page) => Math.min(publicationsTotalPages, page + 1))}
                onPageChange={(page) => setPublicationsPage(page)}
              />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-10 text-center text-muted">
            No publications available yet.
          </div>
        )}
      </section>
    </div>
  );
}