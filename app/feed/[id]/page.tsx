import { createBrowserClient } from '@supabase/ssr'
import ArticlesFeed from "@/components/ArticlesFeed";
import TitleLogo from '@/components/TitleLogo';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { inter } from '@/app/fonts';
import { ChevronDownIcon } from 'lucide-react';

function shouldGenerate(lastGeneration: any): boolean {
  let generate = false;
  if (lastGeneration) {
    const createdAt = new Date(lastGeneration.created_at);
    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours > 24) {
      generate = true;
    }
  } else {
    generate = true;
  }
  return generate;
}

export const revalidate = 0 // revalidate at most every hour

export default async function Index({ params }: { params: { id: string } }) {
  const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')
  let channelId = params.id || 'trending';
  let articles = null;

  console.log("channelId", channelId);


  const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=ETH', {
    method: 'GET',
    // @ts-ignore
    headers: {
      'X-CMC_PRO_API_KEY': process.env.COIN_MARKET_CAP_API_KEY,
      'Accept': 'application/json'
    }
  })
  const res = await response.json()

  const priceOfEthereum = res.data.ETH.quote.USD.price.toLocaleString(undefined, { maximumFractionDigits: 2 });

  console.log("priceOfEthereum", priceOfEthereum);
  try {
    const { data: lastGeneration, error: generationError } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();


    console.log("lastGeneration", lastGeneration);

    if (generationError) {
      console.error(generationError);
    }

    if (!shouldGenerate(lastGeneration)) {
      const { data: latestArticles, error: articlesError } = await supabaseAdmin
        .from('articles')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (articlesError) {
        console.error(articlesError);
      }

      articles = latestArticles;
    }
  } catch (error) {
    console.error(error);
  }
  const currentDate = format(new Date(), 'EEEE, MMMM d');

  return (
    <div className="flex-1 w-full flex flex-col gap-7 items-center mb-16 relative max-w-6xl">
    <div className='w-full top-0 flex flex-col items-center justify-center bg-background max-w-6xl'>
      <div className={cn(inter.className, 'pt-2 text-xs')}>
        <a href="https://warpcast.com/balajis.eth/0x68d54993" target="_blank">Internet Native</a>
      </div>
      <div className='px-8 sm:px-32 py-3 lg:p-5 w-full flex justify-center border-b relative'>
      <div className={"hidden sm:inline absolute left-0 flex flex-col space-y-0.5 pl-3 md:px-0"}>
            <div className={cn(inter.className,'text-xs font-bold')}>{currentDate}</div>
            <div className={cn(inter.className,'text-xs')}>Today's Date</div>
          </div>
        <TitleLogo className="" />
        <div className="hidden sm:inline absolute flex justify-end right-0 space-y-0.5 pr-3 md:px-0 p-6">
          <div className={cn(inter.className, 'text-xs font-medium')}><span className='mr-2'>ETH </span>${priceOfEthereum}</div>
        </div>

      </div>
      <header className="flex space-x-6 justify-center items-center w-full h-10 bg-primary border-b mx-24 border-black">
        <Link href="/feed/citizen" className='flex space-x-1 items-center'>
          <h1 className={cn(inter.className, "text-xs", { "font-medium": channelId === "citizen" })}>{"Citizen"}</h1><ChevronDownIcon className="h-2 w-2" />
        </Link>
        <Link href="/feed/trending" className='flex space-x-1 items-center'>
          <h1 className={cn(inter.className, "text-xs", { "font-medium": channelId === "trending" })}>{"Trending"}</h1><ChevronDownIcon className="h-2 w-2" />
        </Link>
        <Link href="/feed/ethereum" className='flex space-x-1 items-center'>
          <h1 className={cn(inter.className, "text-xs", { "font-medium": channelId === "ethereum" })}>{"Ethereum"}</h1><ChevronDownIcon className="h-2 w-2" />
        </Link>
        <Link href="/feed/farcaster" className='flex space-x-1 items-center'>
          <h1 className={cn(inter.className, "text-xs", { "font-medium": channelId === "farcaster" })}>{"Farcaster"}</h1><ChevronDownIcon className="h-2 w-2" />
        </Link>
      </header>
      <div className="w-full border-b mt-0.5 border-black" />
    </div>
    <ArticlesFeed articles={articles} channelId={channelId} />
    <footer className="flex flex-col space-y-0.5 justify-center items-center bg-background w-full max-w-6xl pt-24">
      <div className="w-full border-b-2 border-gray-200" />
      <div className="w-full border-b border-gray-200" />
      <p className={cn(inter.className, "text-[11px] pt-10")}>Created by <a className='font-medium' href="https://warpcast.com/stringtheory69" target="_blank">StringTheory69 -{'>'}</a></p>
    </footer>
  </div>
  );
}
