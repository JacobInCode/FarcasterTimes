import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createBrowserClient } from '@supabase/ssr';

// Define a schema for the request content using Zod
const articleSchema = z.object({
    body: z.string(),
    headline: z.string(),
    sources: z.array(z.any()),
    channel_id: z.string(),
    image: z.string().optional(),
    audio: z.string().optional(),
    citizen: z.boolean().optional(),
});

export async function POST(request: Request) {
    const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')

    try {
        
        // insert new articles to supabase db
        const data = await request.json();
        const articles = z.array(articleSchema).parse(data);

        console.log('articles', articles);
        const insertData = articles.map(article => ({
            body: article.body,
            headline: article.headline,
            sources: article.sources,
            channel_id: article.channel_id,
            image: article.image,
            audio: article.audio,
            citizen: article.citizen,   
        }));

        const { data: newArticles, error } = await supabaseAdmin
            .from('articles')
            .insert(insertData)
            .select();
        if (error) {
            throw error;
        }

        console.log('Successfully added the articles', newArticles);

        // Successfully added the articles
        return NextResponse.json(JSON.stringify(newArticles), { status: 201 });
    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }
        return new Response(null, { status: 500 })
    }
}