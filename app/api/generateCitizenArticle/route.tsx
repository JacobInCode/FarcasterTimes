import { NextResponse } from "next/server";
import { inngest } from "@/app/inngest/client"; // Import our client
import { z } from 'zod';

// Define a schema for the request content using Zod
const schema = z.object({
  urls: z.array(z.any()),
  email: z.string()
});

// Create a simple async Next.js API route handler
export async function POST(request: Request) {

  // insert new articles to supabase db
  const data = await request.json();
  const { urls, email } = schema.parse(data);

  console.log(`Generating citizen article`);

  // Send your event payload to Inngest
  await inngest.send({
    name: "generate.citizen.article",
    data: { urls, email }
  });

  return NextResponse.json("generating citizen article");
}