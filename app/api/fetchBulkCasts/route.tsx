import * as z from "zod"
import { createBrowserClient } from "@supabase/ssr";
import { CastParamType, NeynarAPIClient } from "@neynar/nodejs-sdk";
export const maxDuration = 300; // This function can run for a maximum of 300 seconds

// IMPORTANT! Set the runtime to edge
// export const runtime = 'edge'

const schema = z.object({
    hashes: z.array(z.array(z.string())),
});
    
export async function POST(
    req: Request,
) {
    try {
        const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')
        const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY || '');

        if (!supabaseAdmin) {
            throw new Error('Not authenticated')
        }
        // Validate route params.

        const json = await req.json();

        console.log("json", json)

        const { hashes: parsedHashes } = schema.parse(json);

        console.log("hashes", parsedHashes)

        const castsRes = await Promise.all(parsedHashes.map((hashes: string[]) => client.fetchBulkCasts(hashes)));

        // return stream response (SSE)
        return new Response(JSON.stringify(castsRes), { status: 200 });

    } catch (error) {
        console.log("Error in ai chat route:", error)
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }
        return new Response(null, { status: 500 })
    }
}

