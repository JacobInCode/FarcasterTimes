import { serve } from "inngest/next";
import { inngest } from "@/app/inngest/client";
import { generateChannelArticle, generateCitizenArticle, sendEmails } from "@/app/inngest/function";

export const runtime = "edge";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateChannelArticle,
    generateCitizenArticle,
    sendEmails
  ],
  streaming: "allow",
});