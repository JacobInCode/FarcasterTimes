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
import MinimalHeader from "@/components/MinimalHeader";
import { SUPABASE_IMAGE_URL } from "@/lib/utils/config";

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

const defaultUrl = process.env.VERCEL_URL
  ? `https://citizentimes.xyz`
  : "http://localhost:3000";

const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Citizen Times",
  description: "Automated news generation for internet natives",
  openGraph: {
    images: ['https://citizentimes.xyz/opengraph-image.png'],
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

  if (articlesError) {
    return metadata;
  }

  return {
    title: articleData.headline,
    openGraph: {
      images: [`${SUPABASE_IMAGE_URL}/${articleData.image}`],
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
      <MinimalHeader />
      <ArticlePage article={article} id={article ? null : params.id || null} />
    </div>
  );
}
