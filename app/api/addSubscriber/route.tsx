import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createBrowserClient } from '@supabase/ssr';

// Define a schema for the request content using Zod
const schema = z.object({
    email: z.string(),
});

export async function POST(request: Request) {
    const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')

    try {
        
        // insert new articles to supabase db
        const json = await request.json();
        const { email } = schema.parse(json);

        console.log("email", email)
        
        const { data, error } = await supabaseAdmin.from('subscribers').insert({ email })
        
        if (error) {
          throw error;
        }
        
        // Successfully added the articles
        return NextResponse.json(JSON.stringify(data), { status: 201 });
    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }
        return new Response(null, { status: 500 })
    }
}