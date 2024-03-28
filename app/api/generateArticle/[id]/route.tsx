import { NextResponse } from "next/server";
import { inngest } from "@/app/inngest/client"; // Import our client

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

// Create a simple async Next.js API route handler
export async function GET(req: Request) {

  const channelId = req.url.split('/').pop();

  console.log(`Generating articles for channel ${channelId}`);

  // Send your event payload to Inngest
  await inngest.send({
    name: "generate.article",
    data: {
      channelId
    },
  });

  return NextResponse.json({ channelId: channelId});
}