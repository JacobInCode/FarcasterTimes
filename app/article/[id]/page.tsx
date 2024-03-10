import { createClient } from "@/utils/supabase/server";
import ConnectSupabaseSteps from "@/components/tutorial/ConnectSupabaseSteps";
import SignUpUserSteps from "@/components/tutorial/SignUpUserSteps";
import Header from "@/components/Header";
import { createBrowserClient } from '@supabase/ssr'
import ArticlesFeed from "@/components/ArticlesFeed";
import ArticlePage from "@/components/ArticlePage";
import TitleLogo from "@/components/TitleLogo";
import Link from "next/link";

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
    <div className="flex-1 w-full flex flex-col gap-20 items-center mt-20 mb-32">
      <div className='w-full fixed top-0 flex flex-col items-center justify-center bg-background md:px-20 lg:px-36'>
        <Link href="/" className='py-1 flex justify-center relative w-96'>
          <TitleLogo className="h-10" />
        </Link>
        <div className="border-b w-full" />

      </div>
      <ArticlePage article={article} />
    </div>
  );
}
