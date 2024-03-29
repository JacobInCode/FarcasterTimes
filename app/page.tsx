import { initialFetch } from '@/lib/utils/fetch';
import ArticlesFeed from "@/components/ArticlesFeed";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 15 // revalidate at most every hour

export default async function Index() {

  const channelId = 'all';
  const { prices, articles } = await initialFetch(channelId);

  // organize articles by created_at but zero out the minutes and seconds for every article where citizen === false
  const mixedArticles = articles ? articles?.map((article: any) => {
    const date = new Date(article.created_at);
    if (article.citizen === false) {
      date.setMinutes(0);
      // make seconds a random amount between 0 and 59
      date.setSeconds(Math.floor(Math.random() * 60));
    }
    return { ...article, created_at: date };
  }) : null;

  // sort by created_at
  const sorted = mixedArticles ? mixedArticles?.sort((a: any, b: any) => b.created_at - a.created_at) : null;

  return (
    <div className="flex-1 w-full flex flex-col gap-7 items-center mb-16 relative max-w-6xl">
      <Header prices={prices} channelId={channelId} />
      <ArticlesFeed articles={sorted} />
      <Footer />
    </div>
  );
}
