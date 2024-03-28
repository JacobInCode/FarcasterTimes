import * as z from "zod"
import { createBrowserClient } from "@supabase/ssr";
import { CastParamType, FilterType, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { channels } from "@/lib/utils/config";
// export const maxDuration = 300; // This function can run for a maximum of 300 seconds

// IMPORTANT! Set the runtime to edge
// export const runtime = 'edge'

const schema = z.object({
    channelId: z.string()
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

        const { channelId } = schema.parse(json);

        let feedRes;

        const channelIds = channels.find(c => c.id === channelId)?.sources;

        console.log("channelIds", channelIds)
        if (!channelIds) {
            throw new Error('Channel not found');
        }

        const fetchFeedPromises = channelIds.map(async (channelId) => {
            const feedRes = await client.fetchFeed('filter', {
                filterType: FilterType.ChannelId,
                channelId,
                withRecasts: true,
                withReplies: true,
                limit: 100
            });
            return feedRes;
        });

        console.log("fetchFeedPromises", fetchFeedPromises)

        const feedResponses = await Promise.all(fetchFeedPromises);
        feedRes = feedResponses.map(f => f.casts).flat();

        // return stream response (SSE)
        return new Response(JSON.stringify(feedRes), { status: 200 });

    } catch (error) {
        console.log("Error in fetch feed route:", error)
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }
        return new Response(JSON.stringify(error), { status: 500 })
    }
}

