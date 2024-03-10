import { createBrowserClient } from '@supabase/ssr'
import ArticlesFeed from "@/components/ArticlesFeed";
import TitleLogo from '@/components/TitleLogo';
import { format } from 'date-fns';

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


export default async function Index() {
  const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')
  let channelId = "ethereum";
  let articles = null;


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
    <div className="flex-1 w-full flex flex-col gap-20 items-center mt-56 mb-32 relative">
      <div className='w-full fixed top-0 flex flex-col items-center justify-center bg-background md:px-20 lg:px-36'>

        <div className='pt-5 text-xs'>
          A Balaji Srinivasan Bounty Inspired Creation
        </div>
        <div className='px-32 lg:p-6 w-full flex justify-center border-b relative'>
          <div className="hidden sm:inline absolute left-0 flex flex-col space-y-0.5 pl-3 md:px-0">
            <div className='text-xs font-bold'>{currentDate}</div>
            <div className='text-xs'>Today's Date</div>
          </div>
          <TitleLogo className="" />
          <div className="hidden sm:inline absolute right-0 flex flex-col space-y-0.5 pr-3 md:px-0">
            <div className='text-sm font-bold'>ETH ${priceOfEthereum}</div>
          </div>
          
        </div>
        <header className="flex justify-center items-center w-full h-10 bg-primary border-b mx-24 border-black">
          <h1 className="text-md font-bold">{"Ethereum News"}</h1>
        </header>
        <div className="w-full border-b mt-1 border-black" />
      </div>
      <ArticlesFeed articles={articles} />
    </div>
  );
}
