import { generateArticle } from "@/lib/utils/fetch";
import { inngest } from "./client";

export const generateChannelArticle = inngest.createFunction(
  { id: "generate-article" },
  { event: "generate.article" },
  async ({ event, step }) => {

    await generateArticle(event.data.channelId);

  },
);
