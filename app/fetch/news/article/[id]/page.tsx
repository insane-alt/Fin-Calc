import { getFinanceNews } from "@/lib/news";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;
  const articles = await getFinanceNews();

  // Find article by index (or ID if your API provides one)
  const articleIndex = parseInt(id);
  const article = articles[articleIndex];

  if (!article) return notFound();

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-8 inline-block transition-colors"
        >
          ← Back to Finance News
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {article.author || "Financial Staff"}
            </span>
            <span>•</span>
            <time>
              {new Date(article.publishedAt).toLocaleDateString(undefined, {
                dateStyle: "long",
              })}
            </time>
          </div>
        </header>

        {article.urlToImage && (
          <div className="relative aspect-video mb-8 overflow-hidden rounded-2xl shadow-lg">
            <img
              src={article.urlToImage}
              alt={article.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <article className="prose prose-slate lg:prose-lg dark:prose-invert max-w-none">
          <p className="leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
            {article.content || article.description}
          </p>
        </article>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700"
          >
            Read original source at {new URL(article.url).hostname}
          </a>
        </div>
      </div>
    </main>
  );
}
