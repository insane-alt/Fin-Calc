import { getFinanceNews } from "@/lib/news";

export default async function Home() {
  const articles = await getFinanceNews();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Finance News
          </h1>
          <p className="text-slate-500 mt-2">
            Real-time updates from global financial markets.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article: any, i: number) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                {article.urlToImage ? (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs italic">
                    No Preview Available
                  </div>
                )}
                {/* Source Badge */}
                <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-md">
                  {new URL(article.url).hostname.replace("www.", "")}
                </div>
              </div>

              {/* Content Container */}
              <div className="p-6 flex flex-col grow">
                <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h2>

                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 grow">
                  {article.description ||
                    "Click to read the full coverage of this story from the original source."}
                </p>

                <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400 uppercase">
                    {new Date(article.publishedAt).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" },
                    )}
                  </span>
                  <span className="text-blue-600 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Article <span>→</span>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
