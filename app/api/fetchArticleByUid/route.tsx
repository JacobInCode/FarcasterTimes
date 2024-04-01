import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createBrowserClient } from '@supabase/ssr';

// Define a schema for the request content using Zod
const articleSchema = z.object({
    uid: z.string(),
});

export async function POST(request: Request) {
    const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')

    try {
        
        // insert new articles to supabase db
        const data = await request.json();
        const { uid } = articleSchema.parse(data);
        let article = null;
        
        const { data: articleData, error: articlesError } = await supabaseAdmin
          .from('articles')
          .select('*')
          .eq('uid', uid)
          .single()
        
        if (articlesError) {
          console.error(articlesError);
        }
        
        article = articleData;

        // Successfully added the articles
        return NextResponse.json(JSON.stringify(article), { status: 201 });
    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }
        return new Response(null, { status: 500 })
    }
}