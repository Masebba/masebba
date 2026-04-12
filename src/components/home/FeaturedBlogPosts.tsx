import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { BlogPostCard } from "../BlogPostCard";
import { Button } from "../ui/Button";
import { useBlogPosts } from "../../lib/hooks/useBlogPosts";
export function FeaturedBlogPosts() {
  const { posts } = useBlogPosts(true);
  const recentPosts = posts.slice(0, 3);
  // Only show section if there are published posts
  if (recentPosts.length === 0) return null;
  return (
    <section className="py-10 md:py-22">
      <div className="container mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
              Insights
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-main">
              Latest Articles
            </h3>
          </div>
          <Link to="/blog">
            <Button variant="ghost" className="gap-2">
              Read More Articles <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recentPosts.map((post) => (
            <BlogPostCard
              key={post.id}
              slug={post.slug}
              title={post.title}
              category={post.categories?.[0] || "Uncategorized"}
              date={new Date(post.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              excerpt={post.excerpt || "Read more about this topic..."}
              featuredImage={post.coverImage}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
