import { generateArticles } from "@/lib/utils/fetch";
import { inngest } from "./client";

export const generateChannelArticles = inngest.createFunction(
  { id: "generate-articles" },
  { event: "generate.articles" },
  async ({ event, step }) => {

    // promise all for each channel
    await Promise.all(
        event.data.channelIds.map(async (channelId: string) => {
            console.log(`Generating articles for channel ${channelId}`);
            return generateArticles(channelId);
        }),
    );
  },
);
