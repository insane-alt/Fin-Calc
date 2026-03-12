import { appEnv } from "@/lib/env.server";

export async function getFinanceNews() {
    const res = await fetch(
        `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=20&apiKey=${appEnv.NEWS_API}`,
        {
            next: {
                revalidate: 300, // ISR: cache for 5 min
            },
        }
    );

    if (!res.ok) throw new Error("Failed to fetch news");

    const data = await res.json();
    return data.articles;
}