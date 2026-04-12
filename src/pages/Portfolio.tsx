import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ProjectCard } from "../components/ProjectCard";
import { useProjects } from "../lib/hooks/useProjects";
import { useSiteSettings } from "../lib/hooks/useSiteSettings";
import {
  parseCreativeProjects,
  parsePublications,
} from "../lib/settingsContent";
import {
  BriefcaseIcon,
  FileTextIcon,
  DownloadIcon,
  PaletteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

const fallbackCreative = [
  {
    title: "Photography Portfolio",
    category: "Creative",
    icon: "Camera",
    description:
      "A visual collection showcasing portrait, landscape, and event photography work.",
  },
  {
    title: "Brand Identity System",
    category: "Design",
    icon: "Palette",
    description:
      "Complete logo, typography, and visual language package for a startup brand.",
  },
];

const fallbackPublications = [
  {
    title: "AI-Driven User Experience Optimization",
    type: "Concept Note",
    year: "2024",
    status: "In Review",
    downloadUrl: "",
    description:
      "Exploring how machine learning can personalize UI/UX in real time based on user behavior.",
  },
  {
    title: "Digital Transformation Strategy for SMEs",
    type: "Proposal",
    year: "2023",
    status: "Accepted",
    downloadUrl: "",
    description:
      "A strategic framework for small and medium enterprises to adopt cloud-first infrastructure.",
  },
];

const getStatusStyle = (s: string) => {
  switch (s) {
    case "Published":
      return "bg-green-100 text-green-700 border-green-200";
    case "Accepted":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "In Review":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Submitted":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getTypeStyle = (t: string) => {
  switch (t) {
    case "Research Paper":
      return "bg-primary/10 text-primary";
    case "Proposal":
      return "bg-blue-100 text-blue-700";
    case "Concept Note":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const PROJECTS_PER_PAGE = 8;

export function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const { projects } = useProjects();
  const { settings } = useSiteSettings();

  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [projects]);

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE),
  );

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    return filteredProjects.slice(start, start + PROJECTS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const creativeProjects = parseCreativeProjects(
    settings.portfolioNonTechProjects,
  ).length
    ? parseCreativeProjects(settings.portfolioNonTechProjects)
    : fallbackCreative;

  const publications = parsePublications(settings.portfolioPublications).length
    ? parsePublications(settings.portfolioPublications)
    : fallbackPublications;

  const startItem =
    filteredProjects.length === 0
      ? 0
      : (currentPage - 1) * PROJECTS_PER_PAGE + 1;
  const endItem = Math.min(
    currentPage * PROJECTS_PER_PAGE,
    filteredProjects.length,
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-main mb-4">
          Selected Works
        </h1>
        <p className="text-lg text-muted leading-relaxed">
          A collection of my projects, case studies, creative work, and
          publications.
        </p>
      </div>

      <section className="mb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
              Development
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-main">
              Tech Projects
            </h3>
          </div>
          {projects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category ? "bg-primary text-background" : "bg-surface text-muted hover:bg-surface-dark hover:text-main"}`}
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
                Showing {startItem}-{endItem} of {filteredProjects.length}{" "}
                projects
              </p>

              {totalPages > 1 ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                    className="gap-2"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Prev
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                      .slice(
                        Math.max(0, currentPage - 3),
                        Math.min(totalPages, currentPage + 2),
                      )
                      .map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-10 h-10 rounded-lg px-3 text-sm font-medium transition-colors ${page === currentPage ? "bg-primary text-background" : "bg-surface text-muted hover:bg-surface-dark hover:text-main"}`}
                        >
                          {page}
                        </button>
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="gap-2"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BriefcaseIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-main mb-2">Loading...</h3>
            <p className="text-muted max-w-md mx-auto">
              Projects will appear here, please wait.
            </p>
          </div>
        )}
      </section>

      <section className="mb-24">
        <div className="mb-10">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
            Creative
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-main">
            Non-Tech Projects
          </h3>
          <p className="text-muted mt-2 max-w-2xl">
            Beyond code - creative endeavors, community initiatives, and passion
            projects.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {creativeProjects.map((project, idx) => {
            return (
              <Card
                key={idx}
                padding="lg"
                className="group hover:border-primary transition-colors hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <PaletteIcon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-main group-hover:text-primary transition-colors">
                        {project.title}
                      </h4>
                      <span className="px-2.5 py-0.5 bg-surface rounded-full text-xs font-medium text-muted">
                        {project.category}
                      </span>
                    </div>
                    <p className="text-muted leading-relaxed text-sm">
                      {project.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-10">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
            Publications
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-main">
            Papers, Proposals & Concept Notes
          </h3>
          <p className="text-muted mt-2 max-w-2xl">
            Research contributions, strategic proposals, and conceptual
            frameworks I've authored.
          </p>
        </div>
        <div className="space-y-4">
          {publications.map((paper, idx) => (
            <Card
              key={idx}
              padding="md"
              className="group hover:border-primary transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileTextIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-main group-hover:text-primary transition-colors">
                    {paper.title}
                  </h4>
                  <p className="text-sm text-muted leading-relaxed line-clamp-2">
                    {paper.description}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getTypeStyle(paper.type)}`}
                  >
                    {paper.type}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusStyle(paper.status)}`}
                  >
                    {paper.status}
                  </span>
                  <span className="text-xs text-muted font-medium">
                    {paper.year}
                  </span>
                  {paper.downloadUrl ? (
                    <a
                      href={paper.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-background text-xs font-semibold hover:opacity-80 transition-opacity"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" />
                      Download
                    </a>
                  ) : (
                    <span className="px-3 py-1.5 rounded-md bg-surface text-xs font-medium text-muted border border-border">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
