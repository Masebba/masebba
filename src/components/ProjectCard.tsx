import { Card } from './ui/Card';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, StarIcon } from 'lucide-react';
interface ProjectCardProps {
  id: string;
  title: string;
  category: string;
  coverImage?: string;
  technologies: string[];
  isFeatured?: boolean;
}
export function ProjectCard({
  id,
  title,
  category,
  coverImage,
  technologies,
  isFeatured
}: ProjectCardProps) {
  return (
    <Link to={`/portfolio/${id}`} className="group block h-full">
      <Card
        padding="none"
        className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 relative">
        
        {isFeatured &&
        <div className="absolute top-4 right-4 z-10 bg-primary text-background text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
            <StarIcon className="w-3 h-3 fill-current" /> Featured
          </div>
        }
        <div className="aspect-video bg-surface-dark w-full relative overflow-hidden">
          {coverImage ?
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> :


          <div className="absolute inset-0 flex items-center justify-center text-muted group-hover:scale-105 transition-transform duration-500">
              <span className="text-sm font-medium">Image Placeholder</span>
            </div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <span className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
            {category}
          </span>
          <h3 className="text-xl font-bold text-main mb-3 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="flex flex-wrap gap-2 mb-6 mt-auto">
            {technologies.slice(0, 3).map((tech) =>
            <span
              key={tech}
              className="px-2.5 py-1 bg-surface rounded-md text-xs font-medium text-muted">
              
                {tech}
              </span>
            )}
            {technologies.length > 3 &&
            <span className="px-2.5 py-1 bg-surface rounded-md text-xs font-medium text-muted">
                +{technologies.length - 3}
              </span>
            }
          </div>

          <div className="flex items-center text-sm font-medium text-primary mt-auto group-hover:underline">
            View Project{' '}
            <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </Link>);

}