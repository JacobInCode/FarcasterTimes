// import { getServerSession } from "next-auth"
import * as z from "zod"
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import OpenAI from "openai";
import { createBrowserClient } from "@supabase/ssr";
import { decode } from 'base64-arraybuffer'
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
export const maxDuration = 300; // This function can run for a maximum of 300 seconds

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

const schema = z.object({
    prompt: z.string(),
});

export async function POST(
    req: Request,
) {
    try {
        const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')

        if (!supabaseAdmin) {
            throw new Error('Not authenticated')
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        // Validate route params.

        const json = await req.json();

        const { prompt } = schema.parse(json);

        console.log("image prompt", prompt)

        const image = await openai.images.generate({ model: "dall-e-3", prompt: prompt.replace("'", ""), style: 'vivid', response_format: 'b64_json', size:"1792x1024" });

        // add image to supabase storage cover_photos 

        // console.log("image", image.data[0])
        const randomId = uuidv4()

        if (image.data[0].b64_json) {
            const { data, error } = await supabaseAdmin
                .storage
                .from('cover_photos')
                .upload(`${randomId}.png`, decode(image.data[0].b64_json), {
                    contentType: 'image/png'
                })
        } else {
            // Handle the error when b64_json is undefined
        }

        return new Response(JSON.stringify({ imageUrl: `${randomId}.png` }));

    } catch (error) {
        console.log("Error in ai image gen route:", error)
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }
        return new Response(null, { status: 500 })
    }
}

