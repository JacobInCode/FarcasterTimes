import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createBrowserClient } from '@supabase/ssr';
import { inngest } from '@/app/inngest/client';

// Define a schema for the request content using Zod
const schema = z.object({
    urls: z.array(z.any()),
    email: z.string()
});

export async function POST(request: Request) {

    try {

        // insert new articles to supabase db
        const data = await request.json();
        const { urls, email } = schema.parse(data);

        // Send your event payload to Inngest
        await inngest.send({
            name: "generate.citizen.article",
            data: { urls, email }
        });

        // Successfully added the articles
        return NextResponse.json(JSON.stringify("success"), { status: 201 });
    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }
        return new Response(null, { status: 500 })
    }
}