import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, UserIcon } from 'lucide-react';
import { useBlogPosts } from '../lib/hooks/useBlogPosts';
import { sanitizeHtml } from '../lib/sanitize';
import { BlogPost as BlogPostType } from '../types';
import { Button } from '../components/ui/Button';
export function BlogPost() {
  const { slug } = useParams();
  const { posts } = useBlogPosts(true); // publishedOnly = true
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (slug && posts.length > 0) {
      const found = posts.find((p) => p.slug === slug);
      setPost(found || null);
      setChecked(true);
    }
  }, [posts, slug]);
  if (!checked) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center min-h-[60vh] flex items-center justify-center">
        <p className="text-muted">Loading article...</p>
      </div>);

  }
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <h1 className="text-3xl font-bold text-main mb-4">Post Not Found</h1>
        <p className="text-muted mb-8">
          The article you are looking for does not exist or has been removed.
        </p>
        <Link to="/blog">
          <Button>Back to Blog</Button>
        </Link>
      </div>);

  }
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <Link
        to="/blog"
        className="inline-flex items-center text-muted hover:text-primary mb-10 transition-colors font-medium">
        
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Blog
      </Link>

      <header className="mb-12 text-center max-w-3xl mx-auto">
        {post.categories?.[0] &&
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold uppercase tracking-wider mb-6">
            {post.categories[0]}
          </div>
        }
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-main mb-8 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted font-medium">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            <span>Masebba</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </header>

      <div className="aspect-[21/9] w-full bg-surface-dark rounded-2xl mb-16 flex items-center justify-center text-muted shadow-lg overflow-hidden relative">
        {post.coverImage ?
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover" /> :


        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-medium">
              Featured Image Placeholder
            </span>
          </div>
        }
      </div>

      <div
        className="prose prose-lg prose-invert max-w-3xl mx-auto text-muted"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(post.content)
        }} />
      

      {/* Author Section */}
      <div className="max-w-3xl mx-auto mt-20 pt-10 border-t border-border flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-surface shrink-0 flex items-center justify-center text-muted">
          Img
        </div>
        <div>
          <h3 className="text-lg font-bold text-main">Written by Masebba</h3>
          <p className="text-muted mt-1">
            Full-stack developer passionate about building accessible and
            performant web applications.
          </p>
        </div>
      </div>
    </article>);

}