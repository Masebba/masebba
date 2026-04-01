// featured images don't display.
import React, { useMemo, useState } from "react";
import { BlogPostCard } from "../components/BlogPostCard";
import { useBlogPosts } from "../lib/hooks/useBlogPosts";
import { Link } from "react-router-dom";
import { ArrowRightIcon, FileTextIcon } from "lucide-react";
import { Button } from "../components/ui/Button";
export function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { posts } = useBlogPosts(true);
  const categories = useMemo(() => {
    const cats = new Set(
      posts.flatMap((p) => p.categories || []).filter(Boolean),
    );
    return ["All", ...Array.from(cats)];
  }, [posts]);
  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((p) => p.categories?.includes(activeCategory));
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-main mb-4">
            Writings & Thoughts
          </h1>
          <p className="text-lg text-muted">
            Articles, tutorials, and insights about web development, design, and
            technology.
          </p>
        </div>

        {posts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category ? "bg-primary text-background" : "bg-surface text-muted hover:bg-surface-dark hover:text-main"}`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
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

          <div className="text-center mt-16">
            <Link to="/contact">
              <Button variant="outline" size="lg" className="gap-2">
                Get in Touch <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileTextIcon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-main mb-2">No Articles Yet</h3>
          <p className="text-muted max-w-md mx-auto mb-6">
            Blog posts will appear here once published through the admin panel.
          </p>
          <Link to="/contact">
            <Button variant="outline" className="gap-2">
              Get in Touch <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
