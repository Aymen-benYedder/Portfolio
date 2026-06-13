import { useState } from 'react';

interface Post {
  id: string;
  title: string;
  categories?: string[];
  slug?: string;
  publishedAt?: string;
  description?: string;
}

export default function BlogFilterIsland({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState('all');

  const categories = ['all', ...new Set(posts.flatMap(p => p.categories || []))];
  const filtered = active === 'all' ? posts : posts.filter(p => p.categories?.includes(active));

  return (
    <div>
      <div className="flex flex-wrap gap-[var(--spacing-gap-sm)] mb-[var(--spacing-gap-lg)]" role="toolbar" aria-label="Filter blog posts">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            aria-pressed={active === cat}
            className={`label-caps px-[12px] py-[8px] min-h-[36px] border cursor-pointer transition-all duration-200 ${
              active === cat
                ? 'border-[var(--accent)] text-[var(--accent)] bg-[rgba(16,185,129,0.08)] shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                : 'border-[var(--border)] text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
            }`}
          >
            {cat === 'all' ? 'ALL' : cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid gap-[1px] bg-[rgba(16,185,129,0.06)]">
        {filtered.map(post => (
          <article key={post.id} className="glass-panel px-[var(--card-px)] py-[var(--card-py)] hover:bg-[rgba(16,185,129,0.03)] transition-[background_120ms_ease] rounded-none">
            <a href={`/blog/${post.slug}/`} className="no-underline min-h-[44px] flex flex-col justify-center">
              <h2 className="font-[family-name:var(--font-mono)] text-[14px] max-md:text-[var(--text-small)] font-bold text-[var(--text-1)] hover:text-[var(--accent)] hover:drop-shadow-[0_0_5px_rgba(16,185,129,0.3)] transition-all duration-200">{post.title}</h2>
              {post.description && <p className="text-[var(--text-small)] text-[var(--text-2)] mt-[var(--spacing-gap-xs)]">{post.description}</p>}
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
