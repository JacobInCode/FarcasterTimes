import { createClient } from "@/utils/supabase/server";
import ConnectSupabaseSteps from "@/components/tutorial/ConnectSupabaseSteps";
import SignUpUserSteps from "@/components/tutorial/SignUpUserSteps";
import Header from "@/components/Header";
import { createBrowserClient } from '@supabase/ssr'
import ArticlesFeed from "@/components/ArticlesFeed";
import ArticlePage from "@/components/ArticlePage";
import TitleLogo from "@/components/TitleLogo";
import Link from "next/link";
import type { Metadata, ResolvingMetadata } from 'next'
 
type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

const defaultUrl = process.env.VERCEL_URL
  ? `https://falfj.com`
  : "http://localhost:3000";

const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Fully Automated Laissez-Faire Journalism",
  description: "Automated news generation for internet natives",
  openGraph: {
    images: ['https://falfj.com/opengraph-image.png'],
    width: 1200,
    height: 600,
  },
  // image: new URL("/opengraph-image.png", defaultUrl),
};
 
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')

  const { data: articleData, error: articlesError } = await supabaseAdmin
  .from('articles')
  .select('*')
  .eq('id', params.id || '')
  .single()
 
  // fetch data
  // const product = await fetch(`https://.../${id}`).then((res) => res.json())
 
  // optionally access and extend (rather than replace) parent metadata
  // const previousImages = (await parent).openGraph?.images || []

  if (articlesError) {
    return metadata;
  }
 
  return {
    title: articleData.headline,
    openGraph: {
      images: [`https://fthzoepekxipizxebefk.supabase.co/storage/v1/object/public/cover_photos/${articleData.image}`],
    },
  }
}

export default async function Index({ params }: { params: { id: string } }) {
  const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')
  let article = null;

  const { data: articleData, error: articlesError } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('id', params.id || '')
    .single()

  if (articlesError) {
    console.error(articlesError);
  }

  article = articleData;

  return (
    <div className="flex-1 w-full flex flex-col gap-7 items-center mb-32 max-w-6xl">
      <div className='w-full flex flex-col items-center justify-center bg-background'>
        <Link href="/" className='py-1 flex justify-center relative w-80 sm:w-96'>
          <TitleLogo className="" />
        </Link>
        <div className="border-b w-full" />
      </div>
      <ArticlePage article={article} />
    </div>
  );
}
