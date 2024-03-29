import * as z from "zod"
import { createBrowserClient } from "@supabase/ssr";

export async function GET() {
    try {
        const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')

        if (!supabaseAdmin) {
            throw new Error('Not authenticated')
        }

        const { data , error } = await supabaseAdmin
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

        if (error) {
            throw error;
        }

        // remove all casts greater than 24hrs old
        const onlyLast24hrs = data.filter((article: any) => {
            const date = new Date(article.created_at);
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            const diffInHours = diff / (1000 * 60 * 60);
            return diffInHours < 24;
        })

        // add top likes to each article
        const castsWithTopLikes = onlyLast24hrs.map((article: any) => {
            // likes should be the source.likes with the highest value
            const likes = article.sources.length > 0 ? Math.max(...article.sources.map((source: any) => source.likes)) : 0;
            return { ...article, likes };
        });

        // filter the top 5 articles by likes
        const topFiveArticles = castsWithTopLikes.sort((a: any, b: any) => b.likes - a.likes).slice(0, 5);

        // find the corresponding articles from the original data
        const topFiveArticlesFull = topFiveArticles.map((topArticle: any) => {
            return data.find((article: any) => article.id === topArticle.id);
        });

        // return stream response (SSE)
        return new Response(JSON.stringify(topFiveArticlesFull), { status: 200 });

    } catch (error) {
        console.log("Error in getTopFiveArticles route:", error)
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }
        return new Response(JSON.stringify(error), { status: 500 })
    }
}

