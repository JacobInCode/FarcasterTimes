// import { getServerSession } from "next-auth"
import * as z from "zod"
// import fs from "fs";
// import path from "path";
import OpenAI from "openai";
import { createBrowserClient } from "@supabase/ssr";
import { decode } from 'base64-arraybuffer'
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
// export const maxDuration = 300; // This function can run for a maximum of 300 seconds

// IMPORTANT! Set the runtime to edge
// export const runtime = 'edge'

const schema = z.object({
    input: z.string(),
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

        const { input } = schema.parse(json);

        // const speechFile = path.resolve("./speech.mp3");

        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "nova",
            input,
          });

        //   console.log(speechFile);
          const buffer = Buffer.from(await mp3.arrayBuffer());
        // add image to supabase storage cover_photos 

        // console.log("image", image.data[0])
        const randomId = uuidv4()

            const { data, error } = await supabaseAdmin
                .storage
                .from('cover_photos')
                .upload(`${randomId}.mp3`, buffer, {
                    contentType: 'audio/mp3'
                })
      

        return new Response(JSON.stringify({ speechUrl: `${randomId}.mp3` }));

    } catch (error) {
        console.log("Error in ai chat route:", error)
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }
        return new Response(null, { status: 500 })
    }
}

