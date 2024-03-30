import { NextResponse } from "next/server";
import { inngest } from "@/app/inngest/client"; // Import our client

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

// Create a simple async Next.js API route handler
export async function POST(req: Request) {

  const data = await req.json();

  const { urls, email } = data;

  console.log(`Generating citizen article`);

  // Send your event payload to Inngest
  await inngest.send({
    name: "generate.citizen.article",
    data: { urls, email }
  });

  return NextResponse.json("generating citizen article");
}