import { getPrices } from '@/lib/utils/fetch';
import ArticlesFeed from "@/components/ArticlesFeed";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 15 // revalidate at most every 15 mins

export default async function Index() {

  const channelId = 'all';
  const { prices } = await getPrices();

  return (
    <div className="flex-1 w-full flex flex-col gap-7 items-center mb-16 relative max-w-6xl">
      <Header prices={prices} channelId={channelId} />
      <ArticlesFeed channelId={channelId} />
      <Footer />
    </div>
  );
}
