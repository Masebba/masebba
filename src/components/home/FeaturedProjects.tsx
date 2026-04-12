import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { ProjectCard } from "../ProjectCard";
import { Button } from "../ui/Button";
import { useProjects } from "../../lib/hooks/useProjects";

export function FeaturedProjects() {
  const { projects } = useProjects();

  const featuredProjects = useMemo(() => {
    const homeSelected = [...projects]
      .filter((project) => project.showOnHome)
      .sort((a, b) => a.homeOrder - b.homeOrder || a.order - b.order);

    if (homeSelected.length > 0) {
      return homeSelected.slice(0, 3);
    }

    return [...projects].slice(0, 3);
  }, [projects]);

  if (featuredProjects.length === 0) return null;

  return (
    <section className="py-10 md:py-22 bg-surface/30">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
              Projects
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-main">
              Recent Works
            </h3>
          </div>
          <Link to="/portfolio">
            <Button variant="ghost" className="gap-2">
              View All Projects <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>

        {projects.length > 3 && (
          <div className="text-center mt-12">
            <Link to="/portfolio">
              <Button variant="outline" size="lg" className="gap-2">
                See More Projects <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
