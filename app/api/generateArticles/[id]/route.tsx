import { NextResponse } from "next/server";
import { inngest } from "@/app/inngest/client"; // Import our client
import { channels } from "@/lib/utils/config";

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

// Create a simple async Next.js API route handler
export async function GET(req: Request) {

  const channelId = req.url.split('/').pop();

  // Send your event payload to Inngest
  await inngest.send({
    name: "generate.articles",
    data: {
      channelIds: [channelId]
    },
  });

  return NextResponse.json({ channelId: channelId});
}