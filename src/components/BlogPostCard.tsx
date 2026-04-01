import { Card } from './ui/Card';
import { Link } from 'react-router-dom';
import { CalendarIcon, ArrowRightIcon } from 'lucide-react';
interface BlogPostCardProps {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  featuredImage?: string;
}
export function BlogPostCard({
  slug,
  title,
  category,
  date,
  excerpt,
  featuredImage
}: BlogPostCardProps) {
  return (
    <Card
      padding="none"
      className="overflow-hidden group hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      
      <Link
        to={`/blog/${slug}`}
        className="block aspect-video bg-surface-dark relative overflow-hidden">
        
        {featuredImage ?
        <img
          src={featuredImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> :


        <div className="absolute inset-0 flex items-center justify-center text-muted group-hover:scale-105 transition-transform duration-500">
            <span className="text-sm font-medium">Featured Image</span>
          </div>
        }
      </Link>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-3 text-xs font-medium mb-3">
          <span className="text-primary uppercase tracking-wider">
            {category}
          </span>
          <span className="text-muted flex items-center gap-1">
            <CalendarIcon className="w-3 h-3" /> {date}
          </span>
        </div>
        <Link to={`/blog/${slug}`}>
          <h3 className="text-xl font-bold text-main mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        <p className="text-muted text-sm line-clamp-3 mb-6 flex-1">{excerpt}</p>
        <Link
          to={`/blog/${slug}`}
          className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-auto">
          
          Read Article <ArrowRightIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </Card>);

}